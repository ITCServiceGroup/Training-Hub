-- Allow an administrator to restore a previously published version without
-- rewriting its historical approval or the current version's evidence.

create function public.republish_content_version(
  p_content_version_id uuid,
  p_reason text,
  p_effective_at timestamptz default now()
)
returns public.content_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  target public.content_versions;
  current_published_id uuid;
  republished public.content_versions;
begin
  caller := private.current_profile();
  select * into target
  from public.content_versions
  where id = p_content_version_id
  for update;

  if caller.user_id is null
     or caller.role not in ('super_admin', 'admin')
     or target.id is null
     or target.status <> 'superseded' then
    raise exception 'Superseded content version is unavailable' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'A meaningful republish reason is required' using errcode = '22023';
  end if;

  -- Serialize publication state changes per guide. Locking only the selected
  -- historical version would allow two administrators to republish different
  -- versions concurrently and leave more than one version published.
  perform 1
  from public.study_guides guide
  where guide.id = target.study_guide_id
  for update;

  select version.id into current_published_id
  from public.content_versions version
  where version.study_guide_id = target.study_guide_id
    and version.status = 'published'
    and version.id <> target.id
  for update;

  update public.content_versions
  set status = 'superseded', updated_at = now()
  where id = current_published_id;

  update public.content_versions
  set status = 'published',
      published_by = caller.user_id,
      published_at = now(),
      effective_at = coalesce(p_effective_at, now()),
      updated_at = now()
  where id = target.id
  returning * into republished;

  update public.study_guides
  set content = republished.content::text
  where id = republished.study_guide_id;

  insert into public.training_audit_events (
    actor_user_id, action, target_type, target_id, metadata
  ) values (
    caller.user_id,
    'content_version.republished',
    'content_version',
    target.id::text,
    jsonb_build_object(
      'study_guide_id', target.study_guide_id,
      'version_number', target.version_number,
      'replaced_version_id', current_published_id,
      'reason', btrim(p_reason)
    )
  );

  return republished;
end
$$;

revoke all on function public.republish_content_version(uuid, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.republish_content_version(uuid, text, timestamptz)
  to authenticated;

comment on function public.republish_content_version(uuid, text, timestamptz) is
  'Republishes a superseded approved version with a required reason while preserving both version histories.';
