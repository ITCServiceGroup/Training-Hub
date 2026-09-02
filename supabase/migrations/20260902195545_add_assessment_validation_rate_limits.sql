-- Bound failed access-code validation attempts without storing raw client
-- addresses, user agents, or submitted code candidates.

create table private.assessment_validation_secrets (
  singleton boolean primary key default true check (singleton),
  secret bytea not null default extensions.gen_random_bytes(32),
  created_at timestamptz not null default now()
);

insert into private.assessment_validation_secrets (singleton) values (true);
alter table private.assessment_validation_secrets enable row level security;
revoke all on table private.assessment_validation_secrets from public, anon, authenticated;

create table private.assessment_validation_buckets (
  bucket_key bytea primary key,
  window_started_at timestamptz not null default now(),
  failure_count integer not null default 0 check (failure_count >= 0),
  blocked_until timestamptz,
  updated_at timestamptz not null default now()
);

create index assessment_validation_buckets_updated_at_idx
  on private.assessment_validation_buckets (updated_at);

alter table private.assessment_validation_buckets enable row level security;
revoke all on table private.assessment_validation_buckets from public, anon, authenticated;

create or replace function private.assessment_validation_subject()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  headers jsonb := '{}'::jsonb;
  raw_headers text;
  subject text;
begin
  if (select auth.uid()) is not null then
    return 'user:' || (select auth.uid())::text;
  end if;

  raw_headers := current_setting('request.headers', true);
  if nullif(raw_headers, '') is not null then
    begin
      headers := raw_headers::jsonb;
    exception when others then
      headers := '{}'::jsonb;
    end;
  end if;

  subject := coalesce(
    nullif(headers ->> 'cf-connecting-ip', ''),
    nullif(headers ->> 'x-real-ip', ''),
    nullif(split_part(headers ->> 'x-forwarded-for', ',', 1), ''),
    nullif(headers ->> 'user-agent', ''),
    'anonymous'
  );

  return 'anonymous:' || subject;
end
$$;

revoke all on function private.assessment_validation_subject() from public, anon, authenticated;

create or replace function private.allow_assessment_code_candidate(
  p_access_code text,
  p_idempotency_key uuid default null
)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  normalized_code text := upper(btrim(coalesce(p_access_code, '')));
  candidate_hash bytea;
  bucket_hash bytea;
  bucket private.assessment_validation_buckets;
  candidate_exists boolean;
begin
  -- Buckets are an abuse-control cache, not an audit record. Remove stale
  -- pseudonymous subjects so the table cannot become an indefinite identity
  -- history. The indexed timestamp keeps this bounded as the table grows.
  delete from private.assessment_validation_buckets
  where updated_at < now() - interval '7 days';

  if normalized_code !~ '^[A-Z0-9-]{6,64}$' then
    normalized_code := left(normalized_code, 64);
  end if;

  candidate_hash := extensions.digest(normalized_code, 'sha256');
  select extensions.hmac(
    convert_to(private.assessment_validation_subject(), 'UTF8'),
    rate_secret.secret,
    'sha256'
  ) into bucket_hash
  from private.assessment_validation_secrets rate_secret
  where rate_secret.singleton;

  select * into bucket
  from private.assessment_validation_buckets current_bucket
  where current_bucket.bucket_key = bucket_hash
  for update;

  if bucket.blocked_until is not null and bucket.blocked_until > now() then
    return false;
  end if;

  select exists (
    select 1
    from public.access_codes candidate
    where (
      candidate.code_hash = candidate_hash
      or upper(candidate.code) = normalized_code
    )
      and (
        (
          not candidate.is_used
          and candidate.revoked_at is null
          and candidate.attempt_count < candidate.max_attempts
          and (candidate.expires_at is null or candidate.expires_at > now())
        )
        or (
          p_idempotency_key is not null
          and exists (
            select 1
            from public.quiz_results result
            where result.access_code_id = candidate.id
              and result.idempotency_key = p_idempotency_key
          )
        )
      )
  ) into candidate_exists;

  if candidate_exists then
    delete from private.assessment_validation_buckets
    where bucket_key = bucket_hash;
    return true;
  end if;

  insert into private.assessment_validation_buckets (
    bucket_key, window_started_at, failure_count, blocked_until, updated_at
  ) values (
    bucket_hash, now(), 1, null, now()
  )
  on conflict (bucket_key) do update
  set window_started_at = case
        when private.assessment_validation_buckets.window_started_at < now() - interval '15 minutes'
          then now()
        else private.assessment_validation_buckets.window_started_at
      end,
      failure_count = case
        when private.assessment_validation_buckets.window_started_at < now() - interval '15 minutes'
          then 1
        else private.assessment_validation_buckets.failure_count + 1
      end,
      blocked_until = case
        when private.assessment_validation_buckets.window_started_at >= now() - interval '15 minutes'
         and private.assessment_validation_buckets.failure_count >= 7
          then now() + interval '30 minutes'
        else null
      end,
      updated_at = now();

  return false;
end
$$;

revoke all on function private.allow_assessment_code_candidate(text, uuid) from public, anon, authenticated;

alter function public.load_quiz_for_learner(uuid, text)
  rename to load_quiz_for_learner_unthrottled;
revoke all on function public.load_quiz_for_learner_unthrottled(uuid, text)
  from public, anon, authenticated;

create function public.load_quiz_for_learner(
  p_quiz_id uuid default null,
  p_access_code text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_access_code is not null
     and not private.allow_assessment_code_candidate(p_access_code) then
    return jsonb_build_object('error_code', 'access_code_unavailable');
  end if;

  return public.load_quiz_for_learner_unthrottled(p_quiz_id, p_access_code);
end
$$;

revoke all on function public.load_quiz_for_learner(uuid, text) from public, anon, authenticated;
grant execute on function public.load_quiz_for_learner(uuid, text) to anon, authenticated;

alter function public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb)
  rename to submit_quiz_attempt_unthrottled;
revoke all on function public.submit_quiz_attempt_unthrottled(text, jsonb, uuid, integer, jsonb)
  from public, anon, authenticated;

create function public.submit_quiz_attempt(
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
begin
  if not private.allow_assessment_code_candidate(p_access_code, p_idempotency_key) then
    return jsonb_build_object('error_code', 'access_code_unavailable');
  end if;

  return public.submit_quiz_attempt_unthrottled(
    p_access_code,
    p_answers,
    p_idempotency_key,
    p_time_taken,
    p_question_timings
  );
end
$$;

revoke all on function public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb)
  to anon, authenticated;

comment on table private.assessment_validation_buckets is
  'Keyed per-caller validation failure buckets. No raw address, user agent, or access code is retained.';
comment on function private.allow_assessment_code_candidate(text, uuid) is
  'Allows currently usable code candidates or matching idempotent replays and blocks other candidates after eight failures in fifteen minutes.';
