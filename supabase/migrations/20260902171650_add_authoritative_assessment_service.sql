-- Server-authoritative assessment API. Client roles receive learner-safe quiz
-- projections and can no longer write official results or consume codes
-- directly.

create extension if not exists pgcrypto with schema extensions;

alter table public.access_codes
  add column if not exists code_hash bytea,
  add column if not exists created_by uuid references auth.users(id),
  add column if not exists learner_user_id uuid references auth.users(id),
  add column if not exists revoked_at timestamptz,
  add column if not exists used_at timestamptz,
  add column if not exists attempt_count integer not null default 0,
  add column if not exists max_attempts integer not null default 1;

update public.access_codes
set code_hash = extensions.digest(upper(code), 'sha256')
where code is not null and code_hash is null;

alter table public.access_codes alter column code drop not null;
create unique index if not exists access_codes_code_hash_key
  on public.access_codes (code_hash) where code_hash is not null;
alter table public.access_codes
  drop constraint if exists access_codes_attempt_limits_check;
alter table public.access_codes
  add constraint access_codes_attempt_limits_check
  check (max_attempts > 0 and attempt_count between 0 and max_attempts);

alter table public.quiz_results
  add column if not exists access_code_id uuid references public.access_codes(id),
  add column if not exists idempotency_key uuid,
  add column if not exists grading_version text not null default 'legacy-client-v1',
  add column if not exists graded_at timestamptz,
  add column if not exists submitted_by uuid references auth.users(id),
  add column if not exists learner_user_id uuid references auth.users(id);

create unique index if not exists quiz_results_idempotency_key_key
  on public.quiz_results (idempotency_key)
  where idempotency_key is not null;
create unique index if not exists quiz_results_access_code_id_key
  on public.quiz_results (access_code_id)
  where access_code_id is not null;

create table if not exists public.quiz_result_reports (
  result_id bigint primary key references public.quiz_results(id) on delete restrict,
  object_key text unique,
  status text not null default 'pending'
    check (status in ('pending', 'uploading', 'ready', 'failed', 'expired')),
  upload_token_hash bytea,
  upload_token_expires_at timestamptz,
  uploaded_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.quiz_result_reports enable row level security;
revoke all on table public.quiz_result_reports from public, anon, authenticated;

create or replace function private.answer_is_correct(
  p_question_type text,
  p_answer jsonb,
  p_correct_answer jsonb
)
returns boolean
language plpgsql
immutable
set search_path = ''
as $$
declare
  normalized_answer jsonb;
  normalized_correct jsonb;
begin
  if p_answer is null or p_correct_answer is null then
    return false;
  end if;

  if p_question_type <> 'check_all_that_apply' then
    return p_answer = p_correct_answer;
  end if;

  if jsonb_typeof(p_answer) <> 'array' or jsonb_typeof(p_correct_answer) <> 'array' then
    return false;
  end if;

  select coalesce(jsonb_agg(value order by value::text), '[]'::jsonb)
  into normalized_answer
  from jsonb_array_elements(p_answer);

  select coalesce(jsonb_agg(value order by value::text), '[]'::jsonb)
  into normalized_correct
  from jsonb_array_elements(p_correct_answer);

  return normalized_answer = normalized_correct;
end
$$;

revoke all on function private.answer_is_correct(text, jsonb, jsonb) from public;

create or replace function private.can_manage_assessments(p_quiz_id uuid default null)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles profile
    left join public.quizzes quiz on quiz.id = p_quiz_id
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin', 'aom', 'supervisor')
      and (
        profile.role in ('super_admin', 'admin')
        or p_quiz_id is null
        or quiz.market_id = profile.market_id
      )
  )
$$;

revoke all on function private.can_manage_assessments(uuid) from public;

create or replace function public.create_quiz_access_code(
  p_quiz_id uuid,
  p_ldap text,
  p_email text,
  p_market text,
  p_supervisor text,
  p_expires_in_minutes integer default 30
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  generated_code text;
  created public.access_codes;
  caller public.user_profiles;
  learner_id uuid;
  learner_market_id integer;
  provided_market_id integer;
begin
  if not private.can_manage_assessments(p_quiz_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_expires_in_minutes < 5 or p_expires_in_minutes > 1440 then
    raise exception 'Expiration must be between 5 and 1440 minutes';
  end if;

  caller := private.current_profile();
  select profile.user_id, profile.market_id
  into learner_id, learner_market_id
  from public.user_profiles profile
  where (p_email is not null and lower(profile.email) = lower(btrim(p_email)))
     or (p_ldap is not null and lower(split_part(profile.email, '@', 1)) = lower(btrim(p_ldap)))
  order by case when lower(profile.email) = lower(btrim(p_email)) then 0 else 1 end
  limit 1;
  select market.id into provided_market_id
  from public.markets market
  where lower(market.name) = lower(btrim(p_market))
  limit 1;
  if caller.role in ('aom', 'supervisor') and (
    provided_market_id is distinct from caller.market_id
    or (learner_id is not null and learner_market_id is distinct from caller.market_id)
  ) then
    raise exception 'Access codes must remain in your market' using errcode = '42501';
  end if;

  generated_code := upper(substr(encode(extensions.gen_random_bytes(8), 'hex'), 1, 12));

  insert into public.access_codes (
    code, code_hash, quiz_id, ldap, email, market, supervisor,
    expires_at, is_used, created_by, learner_user_id
  ) values (
    null,
    extensions.digest(generated_code, 'sha256'),
    p_quiz_id,
    nullif(btrim(p_ldap), ''),
    nullif(btrim(p_email), ''),
    nullif(btrim(p_market), ''),
    nullif(btrim(p_supervisor), ''),
    now() + make_interval(mins => p_expires_in_minutes),
    false,
    (select auth.uid()),
    learner_id
  ) returning * into created;

  insert into public.security_audit_log (
    actor_user_id, action, target_type, target_id,
    metadata
  ) values (
    (select auth.uid()), 'access_code.created', 'access_code', created.id::text,
    jsonb_build_object('quiz_id', p_quiz_id, 'expires_at', created.expires_at)
  );

  return jsonb_build_object(
    'id', created.id,
    'code', generated_code,
    'quiz_id', created.quiz_id,
    'ldap', created.ldap,
    'email', created.email,
    'market', created.market,
    'supervisor', created.supervisor,
    'expires_at', created.expires_at,
    'is_used', false,
    'created_at', created.created_at
  );
end
$$;

revoke all on function public.create_quiz_access_code(uuid, text, text, text, text, integer) from public;
grant execute on function public.create_quiz_access_code(uuid, text, text, text, text, integer) to authenticated;

create or replace function public.list_quiz_access_codes(p_quiz_id uuid)
returns table (
  id uuid,
  code text,
  ldap text,
  email text,
  market text,
  supervisor text,
  expires_at timestamptz,
  is_used boolean,
  revoked_at timestamptz,
  created_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.can_manage_assessments(p_quiz_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  return query
  select access_code.id,
         case
           when access_code.code is null then 'Issued once'
           else '••••' || right(access_code.code, 4)
         end,
         access_code.ldap::text,
         access_code.email::text,
         access_code.market::text,
         access_code.supervisor::text,
         access_code.expires_at,
         access_code.is_used,
         access_code.revoked_at,
         access_code.created_at
  from public.access_codes access_code
  where access_code.quiz_id = p_quiz_id
  order by access_code.created_at desc;
end
$$;

revoke all on function public.list_quiz_access_codes(uuid) from public;
grant execute on function public.list_quiz_access_codes(uuid) to authenticated;

create or replace function public.revoke_quiz_access_code(p_access_code_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.access_codes;
begin
  select * into target
  from public.access_codes
  where id = p_access_code_id
  for update;

  if target.id is null or not private.can_manage_assessments(target.quiz_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update public.access_codes
  set revoked_at = coalesce(revoked_at, now())
  where id = p_access_code_id;

  insert into public.security_audit_log (
    actor_user_id, action, target_type, target_id, metadata
  ) values (
    (select auth.uid()), 'access_code.revoked', 'access_code', target.id::text,
    jsonb_build_object('quiz_id', target.quiz_id)
  );
end
$$;

revoke all on function public.revoke_quiz_access_code(uuid) from public;
grant execute on function public.revoke_quiz_access_code(uuid) to authenticated;

create or replace function public.load_quiz_for_learner(
  p_quiz_id uuid default null,
  p_access_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  access_code public.access_codes;
  target_quiz public.quizzes;
  questions_json jsonb;
  is_official boolean := p_access_code is not null;
begin
  if is_official then
    select * into access_code
    from public.access_codes candidate
    where candidate.code_hash = extensions.digest(upper(btrim(p_access_code)), 'sha256')
       or upper(candidate.code) = upper(btrim(p_access_code))
    limit 1;

    if access_code.id is null
       or access_code.is_used
       or access_code.revoked_at is not null
       or access_code.attempt_count >= access_code.max_attempts
       or (access_code.expires_at is not null and access_code.expires_at <= now()) then
      raise exception 'Access code is invalid or unavailable' using errcode = '22023';
    end if;

    p_quiz_id := access_code.quiz_id;
  end if;

  select * into target_quiz
  from public.quizzes
  where id = p_quiz_id and archived_at is null;

  if target_quiz.id is null then
    raise exception 'Quiz is unavailable' using errcode = '22023';
  end if;

  if not is_official and not (target_quiz.is_practice or target_quiz.has_practice_mode) then
    raise exception 'Quiz requires an access code' using errcode = '42501';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', question.id,
        'category_id', question.category_id,
        'question_text', question.question_text,
        'question_type', question.question_type,
        'options', question.options
      ) order by
        case when target_quiz.randomize_questions then random() else relation.order_index end
    ),
    '[]'::jsonb
  ) into questions_json
  from public.quiz_questions relation
  join public.questions question on question.id = relation.question_id
  where relation.quiz_id = target_quiz.id;

  return jsonb_build_object(
    'id', target_quiz.id,
    'title', target_quiz.title,
    'description', target_quiz.description,
    'time_limit', target_quiz.time_limit,
    'passing_score', target_quiz.passing_score,
    'allow_partial_credit', target_quiz.allow_partial_credit,
    'randomize_questions', target_quiz.randomize_questions,
    'randomize_answers', false,
    'is_practice', not is_official,
    'questions', questions_json,
    'learner', case when is_official then jsonb_build_object(
      'ldap', access_code.ldap,
      'email', access_code.email,
      'market', access_code.market,
      'supervisor', access_code.supervisor
    ) else null end
  );
end
$$;

revoke all on function public.load_quiz_for_learner(uuid, text) from public;
grant execute on function public.load_quiz_for_learner(uuid, text) to anon, authenticated;

create or replace function public.submit_quiz_attempt(
  p_access_code text,
  p_answers jsonb,
  p_idempotency_key uuid,
  p_time_taken integer default 0,
  p_question_timings jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  access_code public.access_codes;
  target_quiz public.quizzes;
  question record;
  supplied_answer jsonb;
  correct_count numeric := 0;
  question_count integer := 0;
  total_correct integer;
  selected_correct integer;
  selected_incorrect integer;
  feedback jsonb := '{}'::jsonb;
  score_fraction double precision;
  result_id bigint;
  upload_token text;
  existing_result public.quiz_results;
  existing_report public.quiz_result_reports;
begin
  if p_access_code is null or btrim(p_access_code) = ''
     or p_idempotency_key is null
     or jsonb_typeof(p_answers) <> 'object'
     or jsonb_typeof(p_question_timings) <> 'object' then
    raise exception 'Invalid submission' using errcode = '22023';
  end if;

  select * into access_code
  from public.access_codes candidate
  where candidate.code_hash = extensions.digest(upper(btrim(p_access_code)), 'sha256')
     or upper(candidate.code) = upper(btrim(p_access_code))
  for update;

  if access_code.id is null then
    raise exception 'Access code is invalid or unavailable' using errcode = '22023';
  end if;

  select * into existing_result
  from public.quiz_results
  where idempotency_key = p_idempotency_key
    and access_code_id = access_code.id;

  if existing_result.id is not null then
    select * into existing_report
    from public.quiz_result_reports
    where result_id = existing_result.id
    for update;

    if existing_report.status in ('pending', 'failed') then
      upload_token := encode(extensions.gen_random_bytes(32), 'hex');
      update public.quiz_result_reports
      set status = 'pending',
          upload_token_hash = extensions.digest(upload_token, 'sha256'),
          upload_token_expires_at = now() + interval '15 minutes',
          error_message = null,
          updated_at = now()
      where result_id = existing_result.id;
    end if;

    return jsonb_build_object(
      'result_id', existing_result.id,
      'score', round((existing_result.score_value * 100)::numeric, 2),
      'correct', split_part(existing_result.score_text, '/', 1)::numeric,
      'total', (
        select count(*)
        from public.quiz_questions relation
        where relation.quiz_id = existing_result.quiz_id
      ),
      'idempotent_replay', true,
      'report_status', coalesce(existing_report.status, 'failed'),
      'report_upload_token', upload_token
    );
  end if;

  if access_code.is_used
     or access_code.revoked_at is not null
     or access_code.attempt_count >= access_code.max_attempts
     or (access_code.expires_at is not null and access_code.expires_at <= now()) then
    raise exception 'Access code is invalid or unavailable' using errcode = '22023';
  end if;

  select * into target_quiz
  from public.quizzes
  where id = access_code.quiz_id and archived_at is null;

  if target_quiz.id is null then
    raise exception 'Quiz is unavailable' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_answers) supplied(question_id)
    where not exists (
      select 1
      from public.quiz_questions relation
      where relation.quiz_id = target_quiz.id
        and relation.question_id::text = supplied.question_id
    )
  ) then
    raise exception 'Submission contains an unknown question' using errcode = '22023';
  end if;

  for question in
    select bank.id, bank.question_type, bank.correct_answer
    from public.quiz_questions relation
    join public.questions bank on bank.id = relation.question_id
    where relation.quiz_id = target_quiz.id
  loop
    question_count := question_count + 1;
    supplied_answer := p_answers -> question.id::text;

    if private.answer_is_correct(
      question.question_type, supplied_answer, question.correct_answer
    ) then
      correct_count := correct_count + 1;
    elsif target_quiz.allow_partial_credit
      and question.question_type = 'check_all_that_apply'
      and jsonb_typeof(supplied_answer) = 'array'
      and jsonb_typeof(question.correct_answer) = 'array' then
      total_correct := jsonb_array_length(question.correct_answer);
      select count(*) into selected_correct
      from jsonb_array_elements(supplied_answer) supplied
      where exists (
        select 1 from jsonb_array_elements(question.correct_answer) expected
        where expected = supplied
      );
      select count(*) into selected_incorrect
      from jsonb_array_elements(supplied_answer) supplied
      where not exists (
        select 1 from jsonb_array_elements(question.correct_answer) expected
        where expected = supplied
      );
      if total_correct > 0 then
        correct_count := correct_count + greatest(
          0,
          (selected_correct - selected_incorrect)::numeric / total_correct
        );
      end if;
    end if;

    feedback := feedback || jsonb_build_object(
      question.id::text,
      jsonb_build_object(
        'is_correct', private.answer_is_correct(
          question.question_type, supplied_answer, question.correct_answer
        )
      )
    );
  end loop;

  if question_count = 0 then
    raise exception 'Quiz has no questions' using errcode = '22023';
  end if;

  score_fraction := correct_count / question_count;

  insert into public.quiz_results (
    quiz_id, access_code_id, idempotency_key, ldap, market, supervisor,
    quiz_type, score_value, score_text, time_taken, date_of_test, answers,
    question_timings, grading_version, graded_at, submitted_by, learner_user_id
  ) values (
    target_quiz.id,
    access_code.id,
    p_idempotency_key,
    access_code.ldap,
    access_code.market,
    access_code.supervisor,
    target_quiz.title,
    score_fraction,
    concat(round(correct_count, 2), '/', question_count, ' (', round(score_fraction * 100, 2), '%)'),
    greatest(coalesce(p_time_taken, 0), 0),
    now(),
    p_answers,
    p_question_timings,
    'server-v1',
    now(),
    (select auth.uid()),
    access_code.learner_user_id
  ) returning id into result_id;

  update public.access_codes
  set attempt_count = attempt_count + 1,
      is_used = attempt_count + 1 >= max_attempts,
      used_at = now()
  where id = access_code.id;

  upload_token := encode(extensions.gen_random_bytes(32), 'hex');
  insert into public.quiz_result_reports (
    result_id, status, upload_token_hash, upload_token_expires_at
  ) values (
    result_id,
    'pending',
    extensions.digest(upload_token, 'sha256'),
    now() + interval '15 minutes'
  );

  insert into public.security_audit_log (
    actor_user_id, action, target_type, target_id, metadata
  ) values (
    (select auth.uid()), 'quiz_attempt.submitted', 'quiz_result', result_id::text,
    jsonb_build_object(
      'quiz_id', target_quiz.id,
      'access_code_id', access_code.id,
      'grading_version', 'server-v1'
    )
  );

  return jsonb_build_object(
    'result_id', result_id,
    'score', round((score_fraction * 100)::numeric, 2),
    'correct', round(correct_count, 2),
    'total', question_count,
    'idempotent_replay', false,
    'report_status', 'pending',
    'report_upload_token', upload_token,
    'feedback', feedback
  );
end
$$;

revoke all on function public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb) from public;
grant execute on function public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb) to anon, authenticated;

create or replace function public.grade_practice_attempt(
  p_quiz_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_quiz public.quizzes;
  question record;
  correct_count integer := 0;
  question_count integer := 0;
  feedback jsonb := '{}'::jsonb;
begin
  if jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Invalid answers' using errcode = '22023';
  end if;

  select * into target_quiz
  from public.quizzes
  where id = p_quiz_id
    and archived_at is null
    and (is_practice or has_practice_mode);

  if target_quiz.id is null then
    raise exception 'Practice quiz is unavailable' using errcode = '22023';
  end if;

  for question in
    select bank.id, bank.question_type, bank.correct_answer, bank.explanation
    from public.quiz_questions relation
    join public.questions bank on bank.id = relation.question_id
    where relation.quiz_id = target_quiz.id
  loop
    question_count := question_count + 1;
    if private.answer_is_correct(
      question.question_type,
      p_answers -> question.id::text,
      question.correct_answer
    ) then
      correct_count := correct_count + 1;
    end if;
    feedback := feedback || jsonb_build_object(
      question.id::text,
      jsonb_build_object(
        'correct_answer', question.correct_answer,
        'explanation', question.explanation
      )
    );
  end loop;

  if question_count = 0 then
    raise exception 'Quiz has no questions' using errcode = '22023';
  end if;

  return jsonb_build_object(
    'score', round((correct_count::numeric / question_count) * 100, 2),
    'correct', correct_count,
    'total', question_count,
    'feedback', feedback
  );
end
$$;

revoke all on function public.grade_practice_attempt(uuid, jsonb) from public;
grant execute on function public.grade_practice_attempt(uuid, jsonb) to anon, authenticated;

-- Close the legacy assessment paths after replacement functions exist.
revoke all on table public.access_codes from anon, authenticated;
revoke insert, update, delete on table public.quiz_results from anon, authenticated;
revoke select on table public.quiz_results from anon;
revoke select on table public.questions from anon;
revoke select on table public.quiz_questions from anon;

alter table public.access_codes enable row level security;
alter table public.quiz_results enable row level security;
alter table public.questions enable row level security;
alter table public.quiz_questions enable row level security;

drop policy if exists "access_codes_select_policy" on public.access_codes;
drop policy if exists "access_codes_insert_policy" on public.access_codes;
drop policy if exists "access_codes_update_policy" on public.access_codes;
drop policy if exists "access_codes_delete_policy" on public.access_codes;
drop policy if exists "quiz_results_insert_policy" on public.quiz_results;

drop policy if exists "questions_select_policy" on public.questions;
create policy "questions_select_content_managers"
on public.questions
for select
to authenticated
using (
  exists (
    select 1
    from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech')
      and (
        profile.role in ('super_admin', 'admin')
        or questions.market_id = profile.market_id
        or questions.created_by = profile.user_id
      )
  )
);

drop policy if exists "quiz_questions_select_policy" on public.quiz_questions;
create policy "quiz_questions_select_content_managers"
on public.quiz_questions
for select
to authenticated
using (
  exists (
    select 1
    from public.user_profiles profile
    join public.quizzes quiz on quiz.id = quiz_questions.quiz_id
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech')
      and (
        profile.role in ('super_admin', 'admin')
        or quiz.market_id = profile.market_id
        or quiz.created_by = profile.user_id
      )
  )
);

drop policy if exists "Authorized managers can read quiz-pdfs" on storage.objects;
create policy "Authorized managers can read quiz-pdfs"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'quiz-pdfs'
  and (storage.foldername(name))[1] ~ '^[0-9]+$'
  and exists (
    select 1
    from public.user_profiles profile
    join public.quiz_results result
      on result.id = ((storage.foldername(name))[1])::bigint
    left join public.markets market on market.id = profile.market_id
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and (
        profile.role in ('super_admin', 'admin')
        or (
          profile.role in ('aom', 'supervisor')
          and result.market = market.name
        )
      )
  )
);

comment on function public.load_quiz_for_learner(uuid, text) is
  'Returns learner-safe quiz data without correct answers; validates official access codes internally.';
comment on function public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb) is
  'Atomically validates and consumes an access code, grades server-side, persists one immutable result, and issues a short-lived report upload token.';
