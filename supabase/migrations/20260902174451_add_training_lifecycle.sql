-- Assignment, completion, certification, and content-governance foundation.
-- Mutations flow through narrow RPCs; authenticated clients receive only
-- self or management-scoped records through RLS.

create table public.content_versions (
  id uuid primary key default extensions.gen_random_uuid(),
  study_guide_id uuid not null references public.study_guides(id) on delete restrict,
  version_number integer not null check (version_number > 0),
  title text not null,
  content jsonb not null,
  status text not null default 'draft'
    check (status in ('draft', 'in_review', 'approved', 'published', 'superseded', 'archived')),
  owner_user_id uuid not null references auth.users(id),
  created_by uuid not null default auth.uid() references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  published_by uuid references auth.users(id),
  published_at timestamptz,
  effective_at timestamptz,
  review_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (study_guide_id, version_number),
  check ((status in ('approved', 'published', 'superseded')) = (approved_by is not null and approved_at is not null)),
  check ((status in ('published', 'superseded')) = (published_by is not null and published_at is not null))
);

create table public.content_reviews (
  id uuid primary key default extensions.gen_random_uuid(),
  content_version_id uuid not null references public.content_versions(id) on delete cascade,
  requested_by uuid not null default auth.uid() references auth.users(id),
  assigned_to uuid references auth.users(id),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'changes_requested', 'cancelled')),
  comments text,
  decided_by uuid references auth.users(id),
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status in ('approved', 'changes_requested')) = (decided_by is not null and decided_at is not null))
);

create table public.learning_paths (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 200),
  description text,
  market_id integer references public.markets(id),
  status text not null default 'draft' check (status in ('draft', 'active', 'archived')),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.learning_path_items (
  learning_path_id uuid not null references public.learning_paths(id) on delete cascade,
  sequence_number integer not null check (sequence_number > 0),
  content_type text not null check (content_type in ('study_guide', 'quiz')),
  content_id uuid not null,
  is_required boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (learning_path_id, sequence_number),
  unique (learning_path_id, content_type, content_id)
);

create table public.training_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  title text not null check (length(btrim(title)) between 1 and 200),
  description text,
  content_type text not null check (content_type in ('study_guide', 'quiz', 'learning_path')),
  content_id uuid not null,
  content_version_id uuid references public.content_versions(id) on delete restrict,
  is_required boolean not null default true,
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  available_from timestamptz not null default now(),
  due_at timestamptz,
  grace_period_days integer not null default 0 check (grace_period_days between 0 and 365),
  market_id integer references public.markets(id),
  status text not null default 'draft' check (status in ('draft', 'active', 'closed', 'cancelled')),
  certification_type text,
  certification_valid_months integer check (certification_valid_months between 1 and 120),
  created_by uuid not null default auth.uid() references auth.users(id),
  activated_by uuid references auth.users(id),
  activated_at timestamptz,
  closed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (due_at is null or due_at >= available_from),
  check ((certification_type is null) = (certification_valid_months is null)),
  check ((status = 'active') = (activated_by is not null and activated_at is not null) or status <> 'active')
);

create table public.assignment_audiences (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.training_assignments(id) on delete cascade,
  audience_type text not null check (audience_type in ('user', 'supervisor', 'market', 'role')),
  audience_user_id uuid references auth.users(id),
  market_id integer references public.markets(id),
  role public.user_role,
  created_at timestamptz not null default now(),
  check (
    (audience_type = 'user' and audience_user_id is not null and market_id is null and role is null)
    or (audience_type = 'supervisor' and audience_user_id is not null and market_id is null and role is null)
    or (audience_type = 'market' and audience_user_id is null and market_id is not null and role is null)
    or (audience_type = 'role' and audience_user_id is null and market_id is null and role is not null)
  )
);

create table public.training_assignment_prerequisites (
  assignment_id uuid not null references public.training_assignments(id) on delete cascade,
  prerequisite_assignment_id uuid not null references public.training_assignments(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (assignment_id, prerequisite_assignment_id),
  check (assignment_id <> prerequisite_assignment_id)
);

create table public.enrollments (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.training_assignments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  status text not null default 'assigned'
    check (status in ('assigned', 'in_progress', 'completed', 'waived', 'overdue', 'cancelled')),
  assigned_at timestamptz not null default now(),
  started_at timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  progress_percent numeric(5,2) not null default 0 check (progress_percent between 0 and 100),
  evidence_result_id bigint references public.quiz_results(id) on delete restrict,
  waived_by uuid references auth.users(id),
  waiver_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, user_id),
  check ((status = 'completed') = (completed_at is not null and progress_percent = 100) or status <> 'completed'),
  check ((status = 'waived') = (waived_by is not null and nullif(btrim(waiver_reason), '') is not null) or status <> 'waived')
);

create table public.completion_records (
  id uuid primary key default extensions.gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments(id) on delete restrict,
  assignment_id uuid not null references public.training_assignments(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  content_version_id uuid references public.content_versions(id) on delete restrict,
  evidence_result_id bigint references public.quiz_results(id) on delete restrict,
  completed_at timestamptz not null,
  recorded_by uuid references auth.users(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.certifications (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  certification_type text not null,
  status text not null default 'active' check (status in ('active', 'expired', 'suspended', 'revoked')),
  completion_record_id uuid not null references public.completion_records(id) on delete restrict,
  certificate_number text not null unique,
  issued_at timestamptz not null,
  expires_at timestamptz not null,
  suspended_at timestamptz,
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id),
  revocation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (expires_at > issued_at),
  check ((status = 'revoked') = (revoked_at is not null and revoked_by is not null and nullif(btrim(revocation_reason), '') is not null) or status <> 'revoked')
);

create unique index certifications_one_active_per_type
  on public.certifications (user_id, certification_type)
  where status = 'active';

create table public.certification_renewals (
  id uuid primary key default extensions.gen_random_uuid(),
  certification_id uuid not null references public.certifications(id) on delete restrict,
  completion_record_id uuid not null references public.completion_records(id) on delete restrict,
  previous_expires_at timestamptz not null,
  new_expires_at timestamptz not null,
  renewed_by uuid references auth.users(id),
  renewed_at timestamptz not null default now(),
  unique (certification_id, completion_record_id),
  check (new_expires_at > previous_expires_at)
);

create table public.training_audit_events (
  id bigint generated always as identity primary key,
  actor_user_id uuid,
  action text not null,
  target_type text not null,
  target_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create index training_assignments_active_due_idx
  on public.training_assignments (status, due_at) where status = 'active';
create index enrollments_user_status_due_idx on public.enrollments (user_id, status, due_at);
create index enrollments_assignment_status_idx on public.enrollments (assignment_id, status);
create index certifications_user_status_expiry_idx on public.certifications (user_id, status, expires_at);
create index content_versions_review_due_idx on public.content_versions (status, review_due_at);

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
          caller.role in ('aom', 'supervisor')
          and coalesce(target.market_id, p_market_id) = caller.market_id
        )
      )
  )
$$;

revoke all on function private.can_manage_training(integer, uuid) from public;

alter table public.content_versions enable row level security;
alter table public.content_reviews enable row level security;
alter table public.learning_paths enable row level security;
alter table public.learning_path_items enable row level security;
alter table public.training_assignments enable row level security;
alter table public.assignment_audiences enable row level security;
alter table public.training_assignment_prerequisites enable row level security;
alter table public.enrollments enable row level security;
alter table public.completion_records enable row level security;
alter table public.certifications enable row level security;
alter table public.certification_renewals enable row level security;
alter table public.training_audit_events enable row level security;

create policy "content_versions_read_scoped"
on public.content_versions for select to authenticated
using (
  (
    status = 'published'
    and exists (
      select 1
      from public.study_guides guide
      left join public.user_profiles viewer on viewer.user_id = (select auth.uid())
      where guide.id = content_versions.study_guide_id
        and (
          guide.is_nationwide = true
          or viewer.role in ('super_admin', 'admin')
          or (viewer.is_active = true and guide.market_id = viewer.market_id)
        )
    )
  )
  or owner_user_id = (select auth.uid())
  or private.can_manage_training(null, owner_user_id)
);

create policy "content_reviews_read_scoped"
on public.content_reviews for select to authenticated
using (
  requested_by = (select auth.uid())
  or assigned_to = (select auth.uid())
  or private.can_manage_training(null, assigned_to)
);

create policy "learning_paths_read_scoped"
on public.learning_paths for select to authenticated
using (
  (
    status = 'active'
    and (
      market_id is null
      or exists (
        select 1 from public.user_profiles viewer
        where viewer.user_id = (select auth.uid())
          and viewer.is_active = true
          and (viewer.role in ('super_admin', 'admin') or viewer.market_id = learning_paths.market_id)
      )
    )
  )
  or created_by = (select auth.uid())
  or private.can_manage_training(market_id, null)
);

create policy "learning_path_items_read_scoped"
on public.learning_path_items for select to authenticated
using (
  exists (
    select 1 from public.learning_paths path
    where path.id = learning_path_items.learning_path_id
      and (
        (
          path.status = 'active'
          and (
            path.market_id is null
            or exists (
              select 1 from public.user_profiles viewer
              where viewer.user_id = (select auth.uid())
                and viewer.is_active = true
                and (viewer.role in ('super_admin', 'admin') or viewer.market_id = path.market_id)
            )
          )
        )
        or path.created_by = (select auth.uid())
        or private.can_manage_training(path.market_id, null)
      )
  )
);

create policy "training_assignments_read_scoped"
on public.training_assignments for select to authenticated
using (
  created_by = (select auth.uid())
  or private.can_manage_training(market_id, null)
  or exists (
    select 1 from public.enrollments enrollment
    where enrollment.assignment_id = training_assignments.id
      and enrollment.user_id = (select auth.uid())
  )
);

create policy "assignment_audiences_read_managers"
on public.assignment_audiences for select to authenticated
using (
  exists (
    select 1 from public.training_assignments assignment
    where assignment.id = assignment_audiences.assignment_id
      and (assignment.created_by = (select auth.uid()) or private.can_manage_training(assignment.market_id, null))
  )
);

create policy "training_prerequisites_read_enrolled_or_manager"
on public.training_assignment_prerequisites for select to authenticated
using (
  exists (
    select 1 from public.training_assignments assignment
    where assignment.id = training_assignment_prerequisites.assignment_id
      and (
        assignment.created_by = (select auth.uid())
        or private.can_manage_training(assignment.market_id, null)
        or exists (
          select 1 from public.enrollments enrollment
          where enrollment.assignment_id = assignment.id and enrollment.user_id = (select auth.uid())
        )
      )
  )
);

create policy "enrollments_read_self_or_manager"
on public.enrollments for select to authenticated
using (user_id = (select auth.uid()) or private.can_manage_training(null, user_id));

create policy "completion_records_read_self_or_manager"
on public.completion_records for select to authenticated
using (user_id = (select auth.uid()) or private.can_manage_training(null, user_id));

create policy "certifications_read_self_or_manager"
on public.certifications for select to authenticated
using (user_id = (select auth.uid()) or private.can_manage_training(null, user_id));

create policy "certification_renewals_read_scoped"
on public.certification_renewals for select to authenticated
using (
  exists (
    select 1 from public.certifications certification
    where certification.id = certification_renewals.certification_id
      and (
        certification.user_id = (select auth.uid())
        or private.can_manage_training(null, certification.user_id)
      )
  )
);

revoke all on table public.content_versions, public.content_reviews,
  public.learning_paths, public.learning_path_items,
  public.training_assignments, public.assignment_audiences,
  public.training_assignment_prerequisites, public.enrollments,
  public.completion_records, public.certifications,
  public.certification_renewals, public.training_audit_events
from public, anon, authenticated;

grant select on table public.content_versions, public.content_reviews,
  public.learning_paths, public.learning_path_items,
  public.training_assignments, public.assignment_audiences,
  public.training_assignment_prerequisites, public.enrollments,
  public.completion_records, public.certifications,
  public.certification_renewals
to authenticated;

create or replace function private.refresh_assignment_enrollments(p_assignment_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  inserted_count integer;
begin
  insert into public.enrollments (assignment_id, user_id, due_at)
  select distinct p_assignment_id, profile.user_id, assignment.due_at
  from public.training_assignments assignment
  join public.assignment_audiences audience on audience.assignment_id = assignment.id
  join public.user_profiles profile on profile.is_active = true and (
    (audience.audience_type = 'user' and profile.user_id = audience.audience_user_id)
    or (audience.audience_type = 'supervisor' and profile.reports_to_user_id = audience.audience_user_id)
    or (audience.audience_type = 'market' and profile.market_id = audience.market_id)
    or (audience.audience_type = 'role' and profile.role = audience.role)
  )
  where assignment.id = p_assignment_id
    and assignment.status = 'active'
    and (assignment.market_id is null or profile.market_id = assignment.market_id)
  on conflict (assignment_id, user_id) do nothing;

  get diagnostics inserted_count = row_count;
  return inserted_count;
end
$$;

revoke all on function private.refresh_assignment_enrollments(uuid) from public;

create or replace function public.save_training_assignment(
  p_assignment_id uuid,
  p_title text,
  p_description text,
  p_content_type text,
  p_content_id uuid,
  p_content_version_id uuid,
  p_is_required boolean,
  p_priority text,
  p_available_from timestamptz,
  p_due_at timestamptz,
  p_grace_period_days integer,
  p_market_id integer,
  p_certification_type text,
  p_certification_valid_months integer,
  p_audiences jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  saved_assignment_id uuid;
  audience jsonb;
  content_market_id integer;
begin
  caller := private.current_profile();
  if caller.user_id is null or caller.role not in ('super_admin', 'admin', 'aom', 'supervisor') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if caller.role in ('aom', 'supervisor') and p_market_id is distinct from caller.market_id then
    raise exception 'Assignment must remain in your market' using errcode = '42501';
  end if;
  if jsonb_typeof(p_audiences) <> 'array' or jsonb_array_length(p_audiences) = 0 then
    raise exception 'At least one audience is required' using errcode = '22023';
  end if;
  if (p_content_type = 'study_guide' and not exists (
      select 1 from public.study_guides where id = p_content_id
    )) or (p_content_type = 'quiz' and not exists (
      select 1 from public.quizzes where id = p_content_id
    )) or (p_content_type = 'learning_path' and not exists (
      select 1 from public.learning_paths where id = p_content_id and status <> 'archived'
    )) then
    raise exception 'Assignment content is unavailable' using errcode = '22023';
  end if;

  if p_content_type = 'study_guide' then
    select market_id into content_market_id from public.study_guides where id = p_content_id;
  elsif p_content_type = 'quiz' then
    select market_id into content_market_id from public.quizzes where id = p_content_id;
  else
    select market_id into content_market_id from public.learning_paths where id = p_content_id;
  end if;
  if caller.role in ('aom', 'supervisor') and content_market_id is distinct from caller.market_id then
    raise exception 'Assignment content must belong to your market' using errcode = '42501';
  end if;

  if p_assignment_id is null then
    insert into public.training_assignments (
      title, description, content_type, content_id, content_version_id,
      is_required, priority, available_from, due_at, grace_period_days,
      market_id, certification_type, certification_valid_months, created_by
    ) values (
      p_title, p_description, p_content_type, p_content_id, p_content_version_id,
      p_is_required, p_priority, coalesce(p_available_from, now()), p_due_at,
      p_grace_period_days, p_market_id, nullif(btrim(p_certification_type), ''),
      p_certification_valid_months, caller.user_id
    ) returning id into saved_assignment_id;
  else
    select id into saved_assignment_id
    from public.training_assignments
    where id = p_assignment_id and status = 'draft'
      and (created_by = caller.user_id or private.can_manage_training(market_id, null))
    for update;
    if saved_assignment_id is null then
      raise exception 'Draft assignment is unavailable' using errcode = '42501';
    end if;
    update public.training_assignments
    set title = p_title,
        description = p_description,
        content_type = p_content_type,
        content_id = p_content_id,
        content_version_id = p_content_version_id,
        is_required = p_is_required,
        priority = p_priority,
        available_from = coalesce(p_available_from, now()),
        due_at = p_due_at,
        grace_period_days = p_grace_period_days,
        market_id = p_market_id,
        certification_type = nullif(btrim(p_certification_type), ''),
        certification_valid_months = p_certification_valid_months,
        updated_at = now()
    where id = saved_assignment_id;
    delete from public.assignment_audiences audience_row
    where audience_row.assignment_id = saved_assignment_id;
  end if;

  for audience in select value from jsonb_array_elements(p_audiences)
  loop
    insert into public.assignment_audiences (
      assignment_id, audience_type, audience_user_id, market_id, role
    ) values (
      saved_assignment_id,
      audience ->> 'type',
      nullif(audience ->> 'user_id', '')::uuid,
      nullif(audience ->> 'market_id', '')::integer,
      nullif(audience ->> 'role', '')::public.user_role
    );
  end loop;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id)
  values (caller.user_id, 'training_assignment.saved', 'training_assignment', saved_assignment_id::text);
  return saved_assignment_id;
end
$$;

revoke all on function public.save_training_assignment(
  uuid, text, text, text, uuid, uuid, boolean, text, timestamptz,
  timestamptz, integer, integer, text, integer, jsonb
) from public;
grant execute on function public.save_training_assignment(
  uuid, text, text, text, uuid, uuid, boolean, text, timestamptz,
  timestamptz, integer, integer, text, integer, jsonb
) to authenticated;

create or replace function public.activate_training_assignment(p_assignment_id uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  assignment public.training_assignments;
  enrollment_count integer;
begin
  select * into assignment from public.training_assignments
  where id = p_assignment_id for update;
  if assignment.id is null
    or assignment.status <> 'draft'
    or not (assignment.created_by = (select auth.uid()) or private.can_manage_training(assignment.market_id, null)) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update public.training_assignments
  set status = 'active', activated_by = (select auth.uid()), activated_at = now(), updated_at = now()
  where id = p_assignment_id;
  enrollment_count := private.refresh_assignment_enrollments(p_assignment_id);
  if enrollment_count = 0 then
    raise exception 'Assignment audience did not resolve to any active users' using errcode = '22023';
  end if;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'training_assignment.activated', 'training_assignment', p_assignment_id::text,
    jsonb_build_object('enrollments_created', enrollment_count));
  return enrollment_count;
end
$$;

revoke all on function public.activate_training_assignment(uuid) from public;
grant execute on function public.activate_training_assignment(uuid) to authenticated;

create or replace function public.begin_training_enrollment(p_enrollment_id uuid)
returns public.enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated public.enrollments;
begin
  if exists (
    select 1
    from public.enrollments current_enrollment
    join public.training_assignment_prerequisites prerequisite
      on prerequisite.assignment_id = current_enrollment.assignment_id
    left join public.enrollments prerequisite_enrollment
      on prerequisite_enrollment.assignment_id = prerequisite.prerequisite_assignment_id
     and prerequisite_enrollment.user_id = current_enrollment.user_id
    where current_enrollment.id = p_enrollment_id
      and (prerequisite_enrollment.id is null or prerequisite_enrollment.status not in ('completed', 'waived'))
  ) then
    raise exception 'Prerequisite training is incomplete' using errcode = '22023';
  end if;

  update public.enrollments
  set status = 'in_progress', started_at = coalesce(started_at, now()), updated_at = now()
  where id = p_enrollment_id and user_id = (select auth.uid()) and status = 'assigned'
  returning * into updated;
  if updated.id is null then
    raise exception 'Enrollment is unavailable' using errcode = '42501';
  end if;
  return updated;
end
$$;

revoke all on function public.begin_training_enrollment(uuid) from public;
grant execute on function public.begin_training_enrollment(uuid) to authenticated;

create or replace function public.complete_training_enrollment(
  p_enrollment_id uuid,
  p_evidence_result_id bigint default null
)
returns public.completion_records
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment public.enrollments;
  assignment public.training_assignments;
  completion public.completion_records;
  issued_at timestamptz := now();
  previous_certification public.certifications;
  new_expiry timestamptz;
begin
  select * into enrollment from public.enrollments
  where id = p_enrollment_id and user_id = (select auth.uid()) for update;
  if enrollment.id is null or enrollment.status not in ('assigned', 'in_progress', 'overdue') then
    raise exception 'Enrollment is unavailable' using errcode = '42501';
  end if;
  select * into assignment from public.training_assignments where id = enrollment.assignment_id;

  if assignment.content_type = 'quiz' then
    if p_evidence_result_id is null or not exists (
      select 1 from public.quiz_results result
      where result.id = p_evidence_result_id
        and result.quiz_id = assignment.content_id
        and (result.learner_user_id = enrollment.user_id
          or result.submitted_by = enrollment.user_id
          or result.ldap = (
          select split_part(profile.email, '@', 1) from public.user_profiles profile where profile.user_id = enrollment.user_id
        ))
    ) then
      raise exception 'Authoritative quiz evidence is required' using errcode = '22023';
    end if;
  end if;

  update public.enrollments
  set status = 'completed', completed_at = issued_at, progress_percent = 100,
      evidence_result_id = p_evidence_result_id, updated_at = issued_at
  where id = enrollment.id;

  insert into public.completion_records (
    enrollment_id, assignment_id, user_id, content_version_id,
    evidence_result_id, completed_at, recorded_by
  ) values (
    enrollment.id, assignment.id, enrollment.user_id, assignment.content_version_id,
    p_evidence_result_id, issued_at, (select auth.uid())
  ) returning * into completion;

  if assignment.certification_type is not null then
    select * into previous_certification
    from public.certifications
    where user_id = enrollment.user_id
      and certification_type = assignment.certification_type
      and status = 'active'
    for update;

    new_expiry := greatest(issued_at, previous_certification.expires_at)
      + make_interval(months => assignment.certification_valid_months);

    update public.certifications
    set status = 'expired', updated_at = issued_at
    where user_id = enrollment.user_id
      and certification_type = assignment.certification_type
      and status = 'active';

    insert into public.certifications (
      user_id, certification_type, completion_record_id, certificate_number,
      issued_at, expires_at
    ) values (
      enrollment.user_id,
      assignment.certification_type,
      completion.id,
      'TH-' || upper(substr(encode(extensions.gen_random_bytes(12), 'hex'), 1, 16)),
      issued_at,
      new_expiry
    );

    if previous_certification.id is not null then
      insert into public.certification_renewals (
        certification_id, completion_record_id, previous_expires_at,
        new_expires_at, renewed_by
      ) values (
        previous_certification.id, completion.id, previous_certification.expires_at,
        new_expiry, (select auth.uid())
      );
    end if;
  end if;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'enrollment.completed', 'enrollment', enrollment.id::text,
    jsonb_build_object('assignment_id', assignment.id, 'evidence_result_id', p_evidence_result_id));
  return completion;
end
$$;

revoke all on function public.complete_training_enrollment(uuid, bigint) from public;
grant execute on function public.complete_training_enrollment(uuid, bigint) to authenticated;

create or replace function public.list_my_training()
returns table (
  enrollment_id uuid,
  assignment_id uuid,
  title text,
  description text,
  content_type text,
  content_id uuid,
  is_required boolean,
  priority text,
  status text,
  progress_percent numeric,
  available_from timestamptz,
  due_at timestamptz,
  completed_at timestamptz,
  content_path text,
  is_locked boolean
)
language sql
stable
security invoker
set search_path = ''
as $$
  select enrollment.id, assignment.id, assignment.title, assignment.description,
         assignment.content_type, assignment.content_id, assignment.is_required,
         assignment.priority, enrollment.status, enrollment.progress_percent,
         assignment.available_from, enrollment.due_at, enrollment.completed_at,
         case
           when assignment.content_type = 'study_guide' and guide.id is not null then
             '/study/' || category.section_id::text || '/' || guide.category_id::text || '/' || guide.id::text
           when assignment.content_type = 'quiz' then '/quiz/' || assignment.content_id::text
           else '/study'
         end,
         exists (
           select 1
           from public.training_assignment_prerequisites prerequisite
           left join public.enrollments prerequisite_enrollment
             on prerequisite_enrollment.assignment_id = prerequisite.prerequisite_assignment_id
            and prerequisite_enrollment.user_id = enrollment.user_id
           where prerequisite.assignment_id = assignment.id
             and (prerequisite_enrollment.id is null or prerequisite_enrollment.status not in ('completed', 'waived'))
         )
  from public.enrollments enrollment
  join public.training_assignments assignment on assignment.id = enrollment.assignment_id
  left join public.study_guides guide
    on assignment.content_type = 'study_guide' and guide.id = assignment.content_id
  left join public.categories category on category.id = guide.category_id
  where enrollment.user_id = (select auth.uid())
    and assignment.status = 'active'
  order by
    case enrollment.status when 'in_progress' then 0 when 'assigned' then 1 when 'overdue' then 2 else 3 end,
    enrollment.due_at nulls last,
    assignment.priority desc
$$;

revoke all on function public.list_my_training() from public;
grant execute on function public.list_my_training() to authenticated;

comment on table public.training_assignments is
  'Version-aware required or optional learning assigned to explicit audiences.';
comment on table public.completion_records is
  'Immutable evidence that an enrollment completed a particular assignment and content version.';
comment on table public.certifications is
  'Issued, expiring, suspended, or revoked certification state backed by completion evidence.';
