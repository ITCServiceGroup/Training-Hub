-- Remediate validated security-review findings without rewriting historical
-- evidence. This migration is intentionally fail-closed: prerequisite or
-- legacy-data drift aborts the rollout instead of leaving mixed controls.

do $$
declare
  required_table text;
begin
  foreach required_table in array array[
    'public.user_profiles',
    'public.access_codes',
    'public.quiz_results',
    'public.questions',
    'public.quiz_questions',
    'public.study_guide_templates',
    'public.media_library',
    'public.assignment_audiences',
    'public.quiz_result_reports',
    'storage.buckets',
    'storage.objects'
  ] loop
    if to_regclass(required_table) is null then
      raise exception 'Required Training Hub table % is missing', required_table;
    end if;
  end loop;
end
$$;

-- Official scores are bounded evidence. Existing drift stops deployment so an
-- operator can reconcile it through the adjustment workflow first.
alter table public.quiz_results
  drop constraint if exists quiz_results_score_value_range_check;
alter table public.quiz_results
  add constraint quiz_results_score_value_range_check
  check (score_value is null or score_value between 0::double precision and 1::double precision)
  not valid;
alter table public.quiz_results
  validate constraint quiz_results_score_value_range_check;

-- Reject duplicate and malformed multi-select representations before the
-- partial-credit branch can count them more than once.
create or replace function private.answer_is_correct(
  p_question_type text,
  p_answer jsonb,
  p_correct_answer jsonb
)
returns boolean
language plpgsql
immutable
security definer
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

  if jsonb_typeof(p_answer) <> 'array'
     or jsonb_typeof(p_correct_answer) <> 'array'
     or jsonb_array_length(p_answer) > 100
     or jsonb_array_length(p_correct_answer) > 100 then
    raise exception 'Invalid multi-select answer' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_answer) supplied(value)
    where jsonb_typeof(supplied.value) <> 'number'
       or case
         when jsonb_typeof(supplied.value) = 'number' then
           (supplied.value #>> '{}')::numeric <> trunc((supplied.value #>> '{}')::numeric)
           or (supplied.value #>> '{}')::numeric < 0
           or (supplied.value #>> '{}')::numeric > 1000
         else false
       end
  ) or exists (
    select 1
    from jsonb_array_elements(p_correct_answer) expected(value)
    where jsonb_typeof(expected.value) <> 'number'
       or case
         when jsonb_typeof(expected.value) = 'number' then
           (expected.value #>> '{}')::numeric <> trunc((expected.value #>> '{}')::numeric)
           or (expected.value #>> '{}')::numeric < 0
           or (expected.value #>> '{}')::numeric > 1000
         else false
       end
  ) then
    raise exception 'Invalid multi-select answer' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_answer) supplied(value)
    group by supplied.value
    having count(*) > 1
  ) or exists (
    select 1
    from jsonb_array_elements(p_correct_answer) expected(value)
    group by expected.value
    having count(*) > 1
  ) then
    raise exception 'Duplicate multi-select option' using errcode = '22023';
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

-- Complete the legacy access-code conversion. The existing learner functions
-- retain a null-only compatibility predicate, but plaintext can no longer be
-- stored or matched.
update public.access_codes
set code_hash = extensions.digest(upper(code), 'sha256')
where code is not null and code_hash is null;

update public.access_codes
set code = null
where code is not null;

alter table public.access_codes
  drop constraint if exists access_codes_plaintext_code_forbidden_check;
alter table public.access_codes
  add constraint access_codes_plaintext_code_forbidden_check
  check (code is null);

-- Retire the deprecated result table if it is still present in an upgraded
-- project. Its legacy policies exposed raw answers and accepted direct writes.
do $$
declare
  legacy_policy record;
begin
  if to_regclass('public.v2_quiz_results') is not null then
    for legacy_policy in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = 'v2_quiz_results'
    loop
      execute format('drop policy %I on public.v2_quiz_results', legacy_policy.policyname);
    end loop;
    execute 'revoke all on table public.v2_quiz_results from public, anon, authenticated';
  end if;
end
$$;

-- Active-profile versions of the historical helpers used by content RLS.
create or replace function public.get_user_profile()
returns public.user_profiles
language sql
stable
security definer
set search_path = ''
as $$
  select profile
  from public.user_profiles profile
  where profile.user_id = (select auth.uid())
    and profile.is_active = true
$$;
revoke all on function public.get_user_profile() from public;

create or replace function public.get_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = ''
as $$
  select profile.role
  from public.user_profiles profile
  where profile.user_id = (select auth.uid())
    and profile.is_active = true
$$;
revoke all on function public.get_user_role() from public;

create or replace function public.get_user_market_id()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select profile.market_id
  from public.user_profiles profile
  where profile.user_id = (select auth.uid())
    and profile.is_active = true
$$;
revoke all on function public.get_user_market_id() from public;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin')
  )
$$;
revoke all on function public.is_admin() from public;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role = 'super_admin'
  )
$$;
revoke all on function public.is_super_admin() from public;

create or replace function public.can_view_content(
  content_market_id integer,
  content_is_nationwide boolean
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and (
        profile.role in ('super_admin', 'admin')
        or content_is_nationwide = true
        or profile.market_id = content_market_id
      )
  )
$$;
revoke all on function public.can_view_content(integer, boolean) from public;

create or replace function public.can_edit_content(
  content_created_by uuid,
  content_market_id integer
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and (
        profile.role in ('super_admin', 'admin')
        or (profile.role in ('aom', 'supervisor') and profile.market_id = content_market_id)
        or (profile.role = 'lead_tech' and profile.user_id = content_created_by)
      )
  )
$$;
revoke all on function public.can_edit_content(uuid, integer) from public;

create or replace function public.can_create_content()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech')
  )
$$;
revoke all on function public.can_create_content() from public;

create or replace function private.is_supervisor_managed_user(
  p_supervisor_user_id uuid,
  p_target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles target
    where target.user_id = p_target_user_id
      and target.is_active = true
      and target.role in ('lead_tech', 'technician')
      and (
        target.reports_to_user_id = p_supervisor_user_id
        or exists (
          select 1
          from public.user_profiles lead
          where lead.user_id = target.reports_to_user_id
            and lead.is_active = true
            and lead.role = 'lead_tech'
            and lead.reports_to_user_id = p_supervisor_user_id
        )
      )
  )
$$;

revoke all on function private.is_supervisor_managed_user(uuid, uuid) from public;

create or replace function public.can_manage_user(target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles caller
    join public.user_profiles target on target.user_id = $1
    where caller.user_id = (select auth.uid())
      and caller.is_active = true
      and caller.user_id <> target.user_id
      and (
        caller.role = 'super_admin'
        or (
          caller.role = 'admin'
          and target.role not in ('super_admin', 'admin')
        )
        or (
          caller.role = 'aom'
          and target.market_id = caller.market_id
          and target.role in ('supervisor', 'lead_tech', 'technician')
        )
        or (
          caller.role = 'supervisor'
          and private.is_supervisor_managed_user(caller.user_id, target.user_id)
        )
      )
  )
$$;
revoke all on function public.can_manage_user(uuid) from public;

revoke all on function public.get_user_profile(), public.get_user_role(),
  public.get_user_market_id(), public.is_admin(), public.is_super_admin(),
  public.can_view_content(integer, boolean), public.can_edit_content(uuid, integer),
  public.can_create_content(), public.can_manage_user(uuid)
from public;
grant execute on function public.can_view_content(integer, boolean) to anon, authenticated;
grant execute on function public.get_user_profile(), public.get_user_role(),
  public.get_user_market_id(), public.is_admin(), public.is_super_admin(),
  public.can_edit_content(uuid, integer), public.can_create_content(),
  public.can_manage_user(uuid)
to authenticated;

-- Role-aware training authorization: AOMs retain market scope, while a
-- supervisor receives only their direct or lead-mediated reporting tree.
create or replace function private.can_manage_training(
  p_market_id integer default null,
  p_user_id uuid default null
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_profiles caller
    left join public.user_profiles target on target.user_id = p_user_id
    where caller.user_id = (select auth.uid())
      and caller.is_active = true
      and (
        caller.role in ('super_admin', 'admin')
        or (
          caller.role = 'aom'
          and coalesce(target.market_id, p_market_id) = caller.market_id
        )
        or (
          caller.role = 'supervisor'
          and p_user_id is not null
          and private.is_supervisor_managed_user(caller.user_id, p_user_id)
        )
      )
  )
$$;

revoke all on function private.can_manage_training(integer, uuid) from public;

create or replace function private.guard_profile_hierarchy_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
begin
  caller := private.current_profile();
  if caller.user_id is null or caller.role <> 'supervisor' then
    return new;
  end if;

  if not private.is_supervisor_managed_user(caller.user_id, old.user_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if new.role = 'lead_tech' and new.reports_to_user_id <> caller.user_id then
    raise exception 'Lead technicians must remain in your reporting hierarchy' using errcode = '42501';
  end if;
  if new.role = 'technician' and not (
    new.reports_to_user_id = caller.user_id
    or exists (
      select 1 from public.user_profiles lead
      where lead.user_id = new.reports_to_user_id
        and lead.is_active = true
        and lead.role = 'lead_tech'
        and lead.reports_to_user_id = caller.user_id
    )
  ) then
    raise exception 'Technicians must remain in your reporting hierarchy' using errcode = '42501';
  end if;

  return new;
end
$$;

revoke all on function private.guard_profile_hierarchy_update() from public;
drop trigger if exists user_profiles_guard_reporting_hierarchy on public.user_profiles;
create trigger user_profiles_guard_reporting_hierarchy
before update on public.user_profiles
for each row execute function private.guard_profile_hierarchy_update();

create or replace function private.guard_assignment_audience_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
begin
  caller := private.current_profile();
  if caller.user_id is null or caller.role <> 'supervisor' then
    return new;
  end if;

  if new.audience_type = 'user'
     and new.audience_user_id is not null
     and private.is_supervisor_managed_user(caller.user_id, new.audience_user_id) then
    return new;
  end if;

  if new.audience_type = 'supervisor'
     and new.audience_user_id = caller.user_id then
    return new;
  end if;

  raise exception 'Assignment audience is outside your reporting hierarchy' using errcode = '42501';
end
$$;

revoke all on function private.guard_assignment_audience_scope() from public;
drop trigger if exists assignment_audiences_guard_reporting_hierarchy on public.assignment_audiences;
create trigger assignment_audiences_guard_reporting_hierarchy
before insert or update on public.assignment_audiences
for each row execute function private.guard_assignment_audience_scope();

-- The browser reporting surface receives a column-minimized result summary.
revoke select on table public.quiz_results from authenticated;
grant select (
  id, quiz_id, ldap, market, supervisor, quiz_type, score_value, score_text,
  time_taken, date_of_test, pdf_url, grading_version, graded_at, learner_user_id
) on table public.quiz_results to authenticated;

drop policy if exists "quiz_results_select_authorized_managers" on public.quiz_results;
create policy "quiz_results_select_authorized_managers"
on public.quiz_results for select to authenticated
using (
  exists (
    select 1
    from public.user_profiles caller
    where caller.user_id = (select auth.uid())
      and caller.is_active = true
      and (
        caller.role in ('super_admin', 'admin')
        or (
          caller.role = 'aom'
          and exists (
            select 1 from public.markets caller_market
            where caller_market.id = caller.market_id
              and caller_market.name = quiz_results.market
          )
        )
        or (
          caller.role = 'supervisor'
          and quiz_results.learner_user_id is not null
          and private.is_supervisor_managed_user(caller.user_id, quiz_results.learner_user_id)
        )
      )
  )
);

-- Shared authoring templates require an active content-manager profile.
drop policy if exists "study_guide_templates_select_policy" on public.study_guide_templates;
drop policy if exists "study_guide_templates_insert_policy" on public.study_guide_templates;
drop policy if exists "study_guide_templates_update_policy" on public.study_guide_templates;
drop policy if exists "study_guide_templates_delete_policy" on public.study_guide_templates;

create policy "study_guide_templates_select_policy"
on public.study_guide_templates for select to authenticated
using ((select public.can_create_content()));
create policy "study_guide_templates_insert_policy"
on public.study_guide_templates for insert to authenticated
with check ((select public.can_create_content()));
create policy "study_guide_templates_update_policy"
on public.study_guide_templates for update to authenticated
using ((select public.can_create_content()))
with check ((select public.can_create_content()));
create policy "study_guide_templates_delete_policy"
on public.study_guide_templates for delete to authenticated
using ((select public.can_create_content()));

revoke all on table public.study_guide_templates from public, anon, authenticated;
grant select, insert, update, delete on table public.study_guide_templates to authenticated;

-- Question-level analytics are aggregated inside the authorization boundary;
-- browser clients never receive each learner's answers or timing map.
create or replace function public.get_question_performance(p_result_ids bigint[])
returns table (
  question_id uuid,
  question_text text,
  question_type text,
  options jsonb,
  correct_answer jsonb,
  quiz_id uuid,
  quiz_title text,
  category_name text,
  section_name text,
  total_attempts bigint,
  correct_attempts bigint,
  average_time_seconds numeric
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_result_ids is null or cardinality(p_result_ids) > 1000 then
    raise exception 'Result selection is invalid' using errcode = '22023';
  end if;

  return query
  with caller as (
    select profile.*
    from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin', 'aom', 'supervisor')
  ), authorized_results as (
    select result.*
    from public.quiz_results result
    cross join caller
    where result.id = any(p_result_ids)
      and (
        caller.role in ('super_admin', 'admin')
        or (
          caller.role = 'aom'
          and exists (
            select 1 from public.markets market
            where market.id = caller.market_id and market.name = result.market
          )
        )
        or (
          caller.role = 'supervisor'
          and result.learner_user_id is not null
          and private.is_supervisor_managed_user(caller.user_id, result.learner_user_id)
        )
      )
  )
  select
    question.id,
    question.question_text,
    question.question_type::text,
    question.options,
    question.correct_answer,
    quiz.id,
    quiz.title::text,
    category.name::text,
    section.name::text,
    count(*) filter (where result.answers ? question.id::text),
    count(*) filter (
      where result.answers ? question.id::text
        and private.answer_is_correct(
          question.question_type::text,
          result.answers -> question.id::text,
          question.correct_answer
        )
    ),
    round(avg(
      case
        when jsonb_typeof(result.question_timings -> question.id::text) = 'number' then
          case
            when (result.question_timings ->> question.id::text)::numeric between 0 and 3600
              then (result.question_timings ->> question.id::text)::numeric
            else null
          end
        else null
      end
    ), 1)
  from authorized_results result
  join public.quizzes quiz on quiz.id = result.quiz_id
  join public.quiz_questions relation on relation.quiz_id = quiz.id
  join public.questions question on question.id = relation.question_id
  left join public.categories category on category.id = question.category_id
  left join public.sections section on section.id = category.section_id
  group by question.id, question.question_text, question.question_type,
    question.options, question.correct_answer, quiz.id, quiz.title,
    category.name, section.name
  having count(*) filter (where result.answers ? question.id::text) > 0;
end
$$;

revoke all on function public.get_question_performance(bigint[]) from public, anon, authenticated;
grant execute on function public.get_question_performance(bigint[]) to authenticated;

-- Public training media remains public for learners, but every write is scoped
-- and bounded independently from UI behavior.
alter table public.media_library enable row level security;

do $$
declare
  media_policy record;
begin
  for media_policy in
    select policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'media_library'
  loop
    execute format('drop policy %I on public.media_library', media_policy.policyname);
  end loop;
end
$$;

create policy "media_library_select_policy"
on public.media_library for select to authenticated
using ((select public.can_view_content(market_id, is_nationwide)));
create policy "media_library_insert_policy"
on public.media_library for insert to authenticated
with check (
  (select public.can_create_content())
  and created_by = (select auth.uid())
  and uploaded_by = (select auth.uid())
  and (
    ((select public.is_admin()) and is_nationwide = true and market_id is null)
    or (
      not (select public.is_admin())
      and is_nationwide = false
      and market_id = (select public.get_user_market_id())
    )
  )
);
create policy "media_library_update_policy"
on public.media_library for update to authenticated
using ((select public.can_edit_content(created_by, market_id)))
with check ((select public.can_edit_content(created_by, market_id)));
create policy "media_library_delete_policy"
on public.media_library for delete to authenticated
using ((select public.can_edit_content(created_by, market_id)));

revoke all on table public.media_library from public, anon, authenticated;
grant select, insert, update, delete on table public.media_library to authenticated;

create or replace function private.guard_media_library_scope()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.created_by is distinct from old.created_by
     or new.uploaded_by is distinct from old.uploaded_by
     or new.storage_path is distinct from old.storage_path
     or new.public_url is distinct from old.public_url
     or new.mime_type is distinct from old.mime_type
     or new.size is distinct from old.size
     or new.market_id is distinct from old.market_id
     or new.is_nationwide is distinct from old.is_nationwide
     or new.approved_by is distinct from old.approved_by
     or new.approved_at is distinct from old.approved_at then
    raise exception 'Media ownership and storage scope are immutable' using errcode = '55000';
  end if;
  return new;
end
$$;

revoke all on function private.guard_media_library_scope() from public;
drop trigger if exists media_library_immutable_scope on public.media_library;
create trigger media_library_immutable_scope
before update on public.media_library
for each row execute function private.guard_media_library_scope();

insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'media-library',
  'media-library',
  true,
  52428800,
  array[
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ]::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types,
    updated_at = now();

drop policy if exists "Allow authenticated users to read media-library" on storage.objects;
drop policy if exists "Allow authenticated users to insert media-library" on storage.objects;
drop policy if exists "Allow authenticated users to update media-library" on storage.objects;
drop policy if exists "Allow authenticated users to delete media-library" on storage.objects;
drop policy if exists "media_library_objects_insert" on storage.objects;
drop policy if exists "media_library_objects_update" on storage.objects;
drop policy if exists "media_library_objects_delete" on storage.objects;

create policy "media_library_objects_insert"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'media-library'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and profile.role in ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech')
  )
);

create policy "media_library_objects_delete"
on storage.objects for delete to authenticated
using (
  bucket_id = 'media-library'
  and exists (
    select 1 from public.user_profiles profile
    where profile.user_id = (select auth.uid())
      and profile.is_active = true
      and (
        profile.role in ('super_admin', 'admin')
        or exists (
          select 1 from public.media_library media
          where media.storage_path = storage.objects.name
            and public.can_edit_content(media.created_by, media.market_id)
        )
      )
  )
);

-- Finalize report metadata and its audit event in one transaction. Only the
-- service role used by upload-quiz-pdf can execute this boundary.
create or replace function public.finalize_quiz_report_upload(
  p_result_id bigint,
  p_object_key text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_result_id is null
     or p_object_key !~ ('^' || p_result_id::text || '/[0-9a-f-]{36}[.]pdf$') then
    raise exception 'Invalid report object key' using errcode = '22023';
  end if;

  update public.quiz_results
  set pdf_url = p_object_key
  where id = p_result_id;
  if not found then
    raise exception 'Quiz result is unavailable' using errcode = '22023';
  end if;

  update public.quiz_result_reports
  set object_key = p_object_key,
      status = 'ready',
      uploaded_at = now(),
      updated_at = now(),
      upload_token_hash = null,
      upload_token_expires_at = null,
      error_message = null
  where result_id = p_result_id and status = 'uploading';
  if not found then
    raise exception 'Report is not awaiting finalization' using errcode = '22023';
  end if;

  insert into public.security_audit_log (
    actor_user_id, action, target_type, target_id, metadata
  ) values (
    null, 'quiz_report.ready', 'quiz_result', p_result_id::text,
    jsonb_build_object('object_key', p_object_key)
  );

  return true;
end
$$;

revoke all on function public.finalize_quiz_report_upload(bigint, text)
from public, anon, authenticated;
grant execute on function public.finalize_quiz_report_upload(bigint, text)
to service_role;

comment on function private.is_supervisor_managed_user(uuid, uuid) is
  'True only for an active lead technician or technician in a supervisor direct or lead-mediated reporting tree.';
comment on function public.finalize_quiz_report_upload(bigint, text) is
  'Service-only atomic result/report/audit finalization after a private PDF upload.';
