-- Phase 1 security boundary for the deployed Training Hub schema.
-- This migration intentionally asserts its prerequisites so schema drift cannot
-- produce a partially-hardened production database.

do $$
declare
  required_table text;
begin
  foreach required_table in array array[
    'public.user_profiles',
    'public.access_codes',
    'public.questions',
    'public.quiz_results',
    'storage.buckets',
    'storage.objects'
  ] loop
    if to_regclass(required_table) is null then
      raise exception 'Required Training Hub table % is missing', required_table;
    end if;
  end loop;
end
$$;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists public.security_audit_log (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  action text not null,
  target_type text not null,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

alter table public.security_audit_log enable row level security;
revoke all on table public.security_audit_log from public, anon, authenticated;

create or replace function private.current_profile()
returns public.user_profiles
language sql
stable
security definer
set search_path = ''
as $$
  select profile
  from public.user_profiles as profile
  where profile.user_id = (select auth.uid())
    and profile.is_active = true
$$;

revoke all on function private.current_profile() from public;

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

insert into public.user_preferences (user_id, preferences)
select user_id, coalesce(preferences, '{}'::jsonb)
from public.user_profiles
on conflict (user_id) do update
set preferences = excluded.preferences,
    updated_at = now();

alter table public.user_preferences enable row level security;
drop policy if exists "user_preferences_select_own" on public.user_preferences;
drop policy if exists "user_preferences_insert_own" on public.user_preferences;
drop policy if exists "user_preferences_update_own" on public.user_preferences;

create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (user_id = (select auth.uid()));

create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (user_id = (select auth.uid()));

create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

revoke all on table public.user_preferences from public, anon;
grant select, insert, update (preferences, updated_at)
on table public.user_preferences to authenticated;

-- Direct profile updates are removed from client roles. Administrative fields
-- can only change through the narrow, audited function below.
revoke insert, update, delete on table public.user_profiles from anon, authenticated;

create or replace function public.update_managed_user_profile(
  p_target_user_id uuid,
  p_display_name text,
  p_role public.user_role,
  p_market_id integer,
  p_reports_to_user_id uuid,
  p_is_active boolean
)
returns public.user_profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  target public.user_profiles;
  updated_profile public.user_profiles;
begin
  caller := private.current_profile();

  if caller.user_id is null then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  select * into target
  from public.user_profiles
  where user_id = p_target_user_id
  for update;

  if target.user_id is null or target.user_id = caller.user_id then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if not (
    caller.role = 'super_admin'
    or (
      caller.role = 'admin'
      and target.role not in ('super_admin', 'admin')
      and p_role not in ('super_admin', 'admin')
    )
    or (
      caller.role = 'aom'
      and target.market_id = caller.market_id
      and p_market_id = caller.market_id
      and target.role in ('supervisor', 'lead_tech', 'technician')
      and p_role in ('supervisor', 'lead_tech', 'technician')
    )
    or (
      caller.role = 'supervisor'
      and target.market_id = caller.market_id
      and p_market_id = caller.market_id
      and target.role in ('lead_tech', 'technician')
      and p_role in ('lead_tech', 'technician')
    )
  ) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  if p_role in ('super_admin', 'admin') and p_market_id is not null then
    raise exception 'Nationwide roles cannot have a market';
  end if;

  if p_role not in ('super_admin', 'admin') and p_market_id is null then
    raise exception 'Regional roles require a market';
  end if;

  if p_role in ('super_admin', 'admin', 'aom') and p_reports_to_user_id is not null then
    raise exception 'This role cannot have a reporting manager' using errcode = '22023';
  end if;

  if p_role = 'supervisor' and not exists (
    select 1 from public.user_profiles manager
    where manager.user_id = p_reports_to_user_id
      and manager.is_active = true
      and manager.role = 'aom'
      and manager.market_id = p_market_id
  ) then
    raise exception 'Supervisors must report to an active AOM in the same market' using errcode = '22023';
  end if;

  if p_role = 'lead_tech' and not exists (
    select 1 from public.user_profiles manager
    where manager.user_id = p_reports_to_user_id
      and manager.is_active = true
      and manager.role = 'supervisor'
      and manager.market_id = p_market_id
  ) then
    raise exception 'Lead technicians must report to an active supervisor in the same market' using errcode = '22023';
  end if;

  if p_role = 'technician' and not exists (
    select 1 from public.user_profiles manager
    where manager.user_id = p_reports_to_user_id
      and manager.is_active = true
      and manager.role in ('supervisor', 'lead_tech')
      and manager.market_id = p_market_id
  ) then
    raise exception 'Technicians must report to an active supervisor or lead technician in the same market' using errcode = '22023';
  end if;

  update public.user_profiles
  set display_name = nullif(btrim(p_display_name), ''),
      role = p_role,
      market_id = p_market_id,
      reports_to_user_id = p_reports_to_user_id,
      is_active = p_is_active,
      updated_at = now()
  where user_id = p_target_user_id
  returning * into updated_profile;

  insert into public.security_audit_log (
    actor_user_id, action, target_type, target_id, metadata
  ) values (
    caller.user_id,
    'user_profile.updated',
    'user_profile',
    p_target_user_id::text,
    jsonb_build_object(
      'previous_role', target.role,
      'new_role', updated_profile.role,
      'previous_market_id', target.market_id,
      'new_market_id', updated_profile.market_id,
      'previous_active', target.is_active,
      'new_active', updated_profile.is_active
    )
  );

  return updated_profile;
end
$$;

revoke all on function public.update_managed_user_profile(
  uuid, text, public.user_role, integer, uuid, boolean
) from public;
grant execute on function public.update_managed_user_profile(
  uuid, text, public.user_role, integer, uuid, boolean
) to authenticated;

-- Result reports are private evidence, not public assets.
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) values (
  'quiz-pdfs', 'quiz-pdfs', false, 10485760,
  array['application/pdf']::text[]
)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types,
    updated_at = now();

drop policy if exists "Allow public to read quiz-pdfs" on storage.objects;
drop policy if exists "Allow authenticated users to insert quiz-pdfs" on storage.objects;
drop policy if exists "Allow authenticated users to update quiz-pdfs" on storage.objects;
drop policy if exists "Allow authenticated users to delete quiz-pdfs" on storage.objects;

comment on table public.security_audit_log is
  'Append-only security and administrative audit events; client roles have no direct access.';
comment on table public.user_preferences is
  'Self-service user preferences separated from authorization-bearing user profile fields.';
