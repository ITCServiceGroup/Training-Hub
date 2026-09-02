-- Operational workflows layered on top of the training lifecycle foundation.
-- Historical evidence is append-only; state transitions use audited RPCs.

alter table public.access_codes
  add column enrollment_id uuid references public.enrollments(id) on delete restrict,
  add column learning_path_sequence_number integer check (learning_path_sequence_number > 0),
  add constraint access_codes_path_step_requires_enrollment
    check (learning_path_sequence_number is null or enrollment_id is not null);

create unique index access_codes_one_open_enrollment_code
  on public.access_codes (enrollment_id)
  where enrollment_id is not null and revoked_at is null and is_used = false;

create or replace function public.issue_assigned_quiz_access_code(p_enrollment_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  enrollment public.enrollments;
  assignment public.training_assignments;
  learner public.user_profiles;
  market_name text;
  supervisor_name text;
  issued_code text;
  code_expires_at timestamptz;
  created_code_id uuid;
begin
  select * into enrollment
  from public.enrollments
  where id = p_enrollment_id and user_id = (select auth.uid())
  for update;
  if enrollment.id is null or enrollment.status not in ('assigned', 'in_progress', 'overdue') then
    raise exception 'Enrollment is unavailable' using errcode = '42501';
  end if;
  if exists (
    select 1
    from public.training_assignment_prerequisites prerequisite
    left join public.enrollments prerequisite_enrollment
      on prerequisite_enrollment.assignment_id = prerequisite.prerequisite_assignment_id
     and prerequisite_enrollment.user_id = enrollment.user_id
    where prerequisite.assignment_id = enrollment.assignment_id
      and (prerequisite_enrollment.id is null or prerequisite_enrollment.status not in ('completed', 'waived'))
  ) then
    raise exception 'Prerequisite training is incomplete' using errcode = '22023';
  end if;
  select * into assignment from public.training_assignments where id = enrollment.assignment_id;
  if assignment.status <> 'active' or assignment.content_type <> 'quiz' then
    raise exception 'Assigned quiz is unavailable' using errcode = '22023';
  end if;
  select * into learner from public.user_profiles where user_id = enrollment.user_id and is_active = true;
  if learner.user_id is null then
    raise exception 'Learner profile is unavailable' using errcode = '42501';
  end if;
  select name into market_name from public.markets where id = learner.market_id;
  select display_name into supervisor_name from public.user_profiles where user_id = learner.reports_to_user_id;

  update public.access_codes
  set revoked_at = now()
  where enrollment_id = enrollment.id and revoked_at is null and is_used = false;

  issued_code := upper(encode(extensions.gen_random_bytes(8), 'hex'));
  code_expires_at := least(
    now() + interval '2 hours',
    coalesce(enrollment.due_at + make_interval(days => assignment.grace_period_days), now() + interval '2 hours')
  );
  if code_expires_at <= now() then
    code_expires_at := now() + interval '30 minutes';
  end if;

  insert into public.access_codes (
    code, code_hash, quiz_id, ldap, email, market, supervisor,
    expires_at, max_attempts, attempt_count, created_by, learner_user_id, enrollment_id
  ) values (
    null,
    extensions.digest(issued_code, 'sha256'),
    assignment.content_id,
    split_part(learner.email, '@', 1),
    learner.email,
    market_name,
    supervisor_name,
    code_expires_at,
    1,
    0,
    (select auth.uid()),
    learner.user_id,
    enrollment.id
  ) returning id into created_code_id;

  update public.enrollments
  set status = case when status = 'assigned' then 'in_progress' else status end,
      started_at = coalesce(started_at, now()), updated_at = now()
  where id = enrollment.id;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (learner.user_id, 'assigned_quiz.access_issued', 'enrollment', enrollment.id::text,
    jsonb_build_object('access_code_id', created_code_id, 'quiz_id', assignment.content_id));
  return issued_code;
end
$$;

revoke all on function public.issue_assigned_quiz_access_code(uuid) from public;
grant execute on function public.issue_assigned_quiz_access_code(uuid) to authenticated;

create table public.learning_path_progress (
  enrollment_id uuid not null references public.enrollments(id) on delete restrict,
  learning_path_id uuid not null references public.learning_paths(id) on delete restrict,
  sequence_number integer not null,
  content_type text not null check (content_type in ('study_guide', 'quiz')),
  content_id uuid not null,
  is_required boolean not null,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  started_at timestamptz,
  completed_at timestamptz,
  evidence_result_id bigint references public.quiz_results(id) on delete restrict,
  updated_at timestamptz not null default now(),
  primary key (enrollment_id, sequence_number),
  foreign key (learning_path_id, sequence_number)
    references public.learning_path_items(learning_path_id, sequence_number) on delete restrict,
  check (
    (status = 'completed' and completed_at is not null)
    or (status <> 'completed' and completed_at is null)
  )
);

alter table public.learning_path_progress enable row level security;
revoke all on table public.learning_path_progress from public, anon, authenticated;
grant select on table public.learning_path_progress to authenticated;
create policy "learning_path_progress_read_self_or_manager"
on public.learning_path_progress for select to authenticated
using (
  exists (
    select 1 from public.enrollments enrollment
    where enrollment.id = learning_path_progress.enrollment_id
      and (enrollment.user_id = (select auth.uid()) or private.can_manage_training(null, enrollment.user_id))
  )
);

create or replace function private.initialize_learning_path_progress()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.learning_path_progress (
    enrollment_id, learning_path_id, sequence_number, content_type, content_id, is_required
  )
  select new.id, assignment.content_id, item.sequence_number,
         item.content_type, item.content_id, item.is_required
  from public.training_assignments assignment
  join public.learning_path_items item on item.learning_path_id = assignment.content_id
  where assignment.id = new.assignment_id and assignment.content_type = 'learning_path'
  on conflict do nothing;
  return new;
end
$$;

revoke all on function private.initialize_learning_path_progress() from public;
create trigger initialize_learning_path_progress_after_enrollment
after insert on public.enrollments
for each row execute function private.initialize_learning_path_progress();

insert into public.learning_path_progress (
  enrollment_id, learning_path_id, sequence_number, content_type, content_id, is_required
)
select enrollment.id, assignment.content_id, item.sequence_number,
       item.content_type, item.content_id, item.is_required
from public.enrollments enrollment
join public.training_assignments assignment on assignment.id = enrollment.assignment_id
join public.learning_path_items item on item.learning_path_id = assignment.content_id
where assignment.content_type = 'learning_path'
on conflict do nothing;

create or replace function private.guard_learning_path_completion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed'
    and exists (
      select 1
      from public.training_assignments assignment
      where assignment.id = new.assignment_id and assignment.content_type = 'learning_path'
        and exists (
          select 1 from public.learning_path_progress progress
          where progress.enrollment_id = new.id
            and progress.is_required = true
            and progress.status <> 'completed'
        )
    ) then
    raise exception 'Required learning path steps are incomplete' using errcode = '22023';
  end if;
  return new;
end
$$;

revoke all on function private.guard_learning_path_completion() from public;
create trigger guard_learning_path_completion_before_enrollment
before update on public.enrollments
for each row execute function private.guard_learning_path_completion();

create or replace function public.list_my_learning_path_progress()
returns table (
  enrollment_id uuid,
  sequence_number integer,
  content_type text,
  content_id uuid,
  title text,
  is_required boolean,
  status text,
  content_path text
)
language sql
stable
security invoker
set search_path = ''
as $$
  select progress.enrollment_id, progress.sequence_number, progress.content_type,
         progress.content_id,
         coalesce(guide.title, quiz.title), progress.is_required, progress.status,
         case when progress.content_type = 'study_guide' then
           '/study/' || category.section_id::text || '/' || guide.category_id::text || '/' || guide.id::text
         else null end
  from public.learning_path_progress progress
  join public.enrollments enrollment on enrollment.id = progress.enrollment_id
  left join public.study_guides guide
    on progress.content_type = 'study_guide' and guide.id = progress.content_id
  left join public.categories category on category.id = guide.category_id
  left join public.quizzes quiz
    on progress.content_type = 'quiz' and quiz.id = progress.content_id
  where enrollment.user_id = (select auth.uid())
  order by progress.enrollment_id, progress.sequence_number
$$;

revoke all on function public.list_my_learning_path_progress() from public;
grant execute on function public.list_my_learning_path_progress() to authenticated;

create or replace function public.begin_learning_path_item(
  p_enrollment_id uuid,
  p_sequence_number integer
)
returns public.learning_path_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.learning_path_progress;
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
  if exists (
    select 1 from public.learning_path_progress prior
    where prior.enrollment_id = p_enrollment_id
      and prior.sequence_number < p_sequence_number
      and prior.is_required = true
      and prior.status <> 'completed'
  ) then
    raise exception 'Earlier required path steps are incomplete' using errcode = '22023';
  end if;
  update public.learning_path_progress progress
  set status = case when status = 'not_started' then 'in_progress' else status end,
      started_at = coalesce(started_at, now()), updated_at = now()
  from public.enrollments enrollment
  where progress.enrollment_id = p_enrollment_id
    and progress.sequence_number = p_sequence_number
    and enrollment.id = progress.enrollment_id
    and enrollment.user_id = (select auth.uid())
    and enrollment.status in ('assigned', 'in_progress', 'overdue')
  returning progress.* into target;
  if target.enrollment_id is null then
    raise exception 'Learning path step is unavailable' using errcode = '42501';
  end if;
  update public.enrollments
  set status = case when status = 'assigned' then 'in_progress' else status end,
      started_at = coalesce(started_at, now()), updated_at = now()
  where id = p_enrollment_id;
  return target;
end
$$;

revoke all on function public.begin_learning_path_item(uuid, integer) from public;
grant execute on function public.begin_learning_path_item(uuid, integer) to authenticated;

create or replace function public.complete_learning_path_item(
  p_enrollment_id uuid,
  p_sequence_number integer,
  p_evidence_result_id bigint default null
)
returns public.learning_path_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.learning_path_progress;
  updated public.learning_path_progress;
begin
  select progress.* into target
  from public.learning_path_progress progress
  join public.enrollments enrollment on enrollment.id = progress.enrollment_id
  where progress.enrollment_id = p_enrollment_id
    and progress.sequence_number = p_sequence_number
    and enrollment.user_id = (select auth.uid())
  for update of progress;
  if target.enrollment_id is null or target.status = 'completed' then
    raise exception 'Learning path step is unavailable' using errcode = '42501';
  end if;
  if exists (
    select 1 from public.learning_path_progress prior
    where prior.enrollment_id = p_enrollment_id
      and prior.sequence_number < p_sequence_number
      and prior.is_required = true and prior.status <> 'completed'
  ) then
    raise exception 'Earlier required path steps are incomplete' using errcode = '22023';
  end if;
  if target.content_type = 'quiz' and (
    p_evidence_result_id is null or not exists (
      select 1 from public.quiz_results result
      where result.id = p_evidence_result_id
        and result.quiz_id = target.content_id
        and result.learner_user_id = (select auth.uid())
    )
  ) then
    raise exception 'Authoritative quiz evidence is required' using errcode = '22023';
  end if;

  update public.learning_path_progress
  set status = 'completed', started_at = coalesce(started_at, now()), completed_at = now(),
      evidence_result_id = p_evidence_result_id, updated_at = now()
  where enrollment_id = p_enrollment_id and sequence_number = p_sequence_number
  returning * into updated;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'learning_path.step_completed', 'enrollment', p_enrollment_id::text,
    jsonb_build_object('sequence_number', p_sequence_number, 'content_id', target.content_id));

  if not exists (
    select 1 from public.learning_path_progress remaining
    where remaining.enrollment_id = p_enrollment_id
      and remaining.is_required = true and remaining.status <> 'completed'
  ) then
    perform public.complete_training_enrollment(p_enrollment_id, p_evidence_result_id);
  end if;
  return updated;
end
$$;

revoke all on function public.complete_learning_path_item(uuid, integer, bigint) from public;
grant execute on function public.complete_learning_path_item(uuid, integer, bigint) to authenticated;

create or replace function public.issue_learning_path_quiz_code(
  p_enrollment_id uuid,
  p_sequence_number integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  progress public.learning_path_progress;
  enrollment public.enrollments;
  assignment public.training_assignments;
  learner public.user_profiles;
  market_name text;
  supervisor_name text;
  issued_code text;
  code_expires_at timestamptz;
  created_code_id uuid;
begin
  progress := public.begin_learning_path_item(p_enrollment_id, p_sequence_number);
  if progress.content_type <> 'quiz' then
    raise exception 'Learning path step is not a quiz' using errcode = '22023';
  end if;
  select * into enrollment from public.enrollments where id = p_enrollment_id for update;
  select * into assignment from public.training_assignments where id = enrollment.assignment_id;
  select * into learner from public.user_profiles where user_id = enrollment.user_id;
  select name into market_name from public.markets where id = learner.market_id;
  select display_name into supervisor_name from public.user_profiles where user_id = learner.reports_to_user_id;

  update public.access_codes set revoked_at = now()
  where enrollment_id = enrollment.id and revoked_at is null and is_used = false;
  issued_code := upper(encode(extensions.gen_random_bytes(8), 'hex'));
  code_expires_at := least(now() + interval '2 hours',
    coalesce(enrollment.due_at + make_interval(days => assignment.grace_period_days), now() + interval '2 hours'));
  if code_expires_at <= now() then code_expires_at := now() + interval '30 minutes'; end if;

  insert into public.access_codes (
    code, code_hash, quiz_id, ldap, email, market, supervisor, expires_at,
    max_attempts, attempt_count, created_by, learner_user_id, enrollment_id,
    learning_path_sequence_number
  ) values (
    null, extensions.digest(issued_code, 'sha256'), progress.content_id,
    split_part(learner.email, '@', 1), learner.email, market_name, supervisor_name,
    code_expires_at, 1, 0, (select auth.uid()), learner.user_id, enrollment.id,
    progress.sequence_number
  ) returning id into created_code_id;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (learner.user_id, 'learning_path.quiz_access_issued', 'enrollment', enrollment.id::text,
    jsonb_build_object('access_code_id', created_code_id, 'sequence_number', progress.sequence_number));
  return issued_code;
end
$$;

revoke all on function public.issue_learning_path_quiz_code(uuid, integer) from public;
grant execute on function public.issue_learning_path_quiz_code(uuid, integer) to authenticated;

create or replace function private.complete_assigned_quiz_enrollment()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  linked_enrollment_id uuid;
  linked_sequence_number integer;
begin
  select enrollment_id, learning_path_sequence_number
  into linked_enrollment_id, linked_sequence_number
  from public.access_codes where id = new.access_code_id;
  if linked_enrollment_id is not null then
    if linked_sequence_number is null then
      perform public.complete_training_enrollment(linked_enrollment_id, new.id);
    else
      perform public.complete_learning_path_item(linked_enrollment_id, linked_sequence_number, new.id);
    end if;
  end if;
  return new;
end
$$;

revoke all on function private.complete_assigned_quiz_enrollment() from public;
create trigger complete_assigned_quiz_enrollment_after_result
after insert on public.quiz_results
for each row when (new.access_code_id is not null)
execute function private.complete_assigned_quiz_enrollment();

create table public.quiz_result_adjustments (
  id uuid primary key default extensions.gen_random_uuid(),
  quiz_result_id bigint not null references public.quiz_results(id) on delete restrict,
  previous_score_value double precision not null,
  adjusted_score_value double precision not null check (adjusted_score_value between 0 and 1),
  reason text not null check (length(btrim(reason)) between 10 and 2000),
  created_by uuid not null default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

alter table public.quiz_result_adjustments enable row level security;
revoke all on table public.quiz_result_adjustments from public, anon, authenticated;
grant select on table public.quiz_result_adjustments to authenticated;

create policy "quiz_result_adjustments_read_managers"
on public.quiz_result_adjustments for select to authenticated
using (
  exists (
    select 1 from public.quiz_results result
    where result.id = quiz_result_adjustments.quiz_result_id
      and private.can_manage_assessments(result.quiz_id)
  )
);

create or replace function private.reject_historical_record_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  raise exception '% records are append-only', tg_table_name using errcode = '55000';
end
$$;

revoke all on function private.reject_historical_record_mutation() from public;

create trigger security_audit_log_append_only
before update or delete on public.security_audit_log
for each row execute function private.reject_historical_record_mutation();

create trigger training_audit_events_append_only
before update or delete on public.training_audit_events
for each row execute function private.reject_historical_record_mutation();

create trigger completion_records_append_only
before update or delete on public.completion_records
for each row execute function private.reject_historical_record_mutation();

create trigger quiz_result_adjustments_append_only
before update or delete on public.quiz_result_adjustments
for each row execute function private.reject_historical_record_mutation();

create or replace function public.record_quiz_result_adjustment(
  p_quiz_result_id bigint,
  p_adjusted_score_value double precision,
  p_reason text
)
returns public.quiz_result_adjustments
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.quiz_results;
  adjustment public.quiz_result_adjustments;
begin
  select * into target from public.quiz_results where id = p_quiz_result_id for update;
  if target.id is null or not private.can_manage_assessments(target.quiz_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.score_value is null then
    raise exception 'Result has no authoritative score to adjust' using errcode = '22023';
  end if;
  if p_adjusted_score_value < 0 or p_adjusted_score_value > 1 then
    raise exception 'Adjusted score must be between 0 and 1' using errcode = '22023';
  end if;

  insert into public.quiz_result_adjustments (
    quiz_result_id, previous_score_value, adjusted_score_value, reason
  ) values (
    target.id,
    coalesce((
      select prior.adjusted_score_value
      from public.quiz_result_adjustments prior
      where prior.quiz_result_id = target.id
      order by prior.created_at desc, prior.id desc
      limit 1
    ), target.score_value),
    p_adjusted_score_value,
    btrim(p_reason)
  ) returning * into adjustment;

  insert into public.security_audit_log (actor_user_id, action, target_type, target_id, metadata)
  values (
    (select auth.uid()), 'quiz_result.adjusted', 'quiz_result', target.id::text,
    jsonb_build_object(
      'adjustment_id', adjustment.id,
      'previous_score_value', adjustment.previous_score_value,
      'adjusted_score_value', adjustment.adjusted_score_value
    )
  );
  return adjustment;
end
$$;

revoke all on function public.record_quiz_result_adjustment(bigint, double precision, text) from public;
grant execute on function public.record_quiz_result_adjustment(bigint, double precision, text) to authenticated;

create or replace function public.set_training_assignment_prerequisites(
  p_assignment_id uuid,
  p_prerequisite_assignment_ids uuid[]
)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.training_assignments;
  prerequisite_id uuid;
  inserted_count integer;
begin
  select * into target
  from public.training_assignments
  where id = p_assignment_id
  for update;

  if target.id is null or target.status <> 'draft'
    or not (target.created_by = (select auth.uid()) or private.can_manage_training(target.market_id, null)) then
    raise exception 'Draft assignment is unavailable' using errcode = '42501';
  end if;

  if p_assignment_id = any(coalesce(p_prerequisite_assignment_ids, array[]::uuid[])) then
    raise exception 'An assignment cannot require itself' using errcode = '22023';
  end if;

  delete from public.training_assignment_prerequisites where assignment_id = p_assignment_id;
  foreach prerequisite_id in array coalesce(p_prerequisite_assignment_ids, array[]::uuid[])
  loop
    if not exists (
      select 1 from public.training_assignments prerequisite
      where prerequisite.id = prerequisite_id
        and (target.market_id is null or prerequisite.market_id is null or prerequisite.market_id = target.market_id)
    ) then
      raise exception 'Prerequisite assignment is unavailable' using errcode = '22023';
    end if;
    insert into public.training_assignment_prerequisites (assignment_id, prerequisite_assignment_id)
    values (p_assignment_id, prerequisite_id)
    on conflict do nothing;
  end loop;

  if exists (
    with recursive dependency(assignment_id, prerequisite_assignment_id) as (
      select assignment_id, prerequisite_assignment_id
      from public.training_assignment_prerequisites
      where assignment_id = p_assignment_id
      union all
      select next_edge.assignment_id, next_edge.prerequisite_assignment_id
      from public.training_assignment_prerequisites next_edge
      join dependency current_edge on next_edge.assignment_id = current_edge.prerequisite_assignment_id
    )
    select 1 from dependency where prerequisite_assignment_id = p_assignment_id
  ) then
    raise exception 'Prerequisites cannot contain a cycle' using errcode = '22023';
  end if;

  select count(*) into inserted_count
  from public.training_assignment_prerequisites where assignment_id = p_assignment_id;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'training_assignment.prerequisites_set', 'training_assignment', p_assignment_id::text,
    jsonb_build_object('prerequisite_count', inserted_count));
  return inserted_count;
end
$$;

revoke all on function public.set_training_assignment_prerequisites(uuid, uuid[]) from public;
grant execute on function public.set_training_assignment_prerequisites(uuid, uuid[]) to authenticated;

create or replace function public.set_training_assignment_status(
  p_assignment_id uuid,
  p_status text
)
returns public.training_assignments
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.training_assignments;
  updated public.training_assignments;
begin
  select * into target from public.training_assignments where id = p_assignment_id for update;
  if target.id is null
    or not (target.created_by = (select auth.uid()) or private.can_manage_training(target.market_id, null)) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_status not in ('closed', 'cancelled') then
    raise exception 'Unsupported assignment status' using errcode = '22023';
  end if;
  if p_status = 'closed' and target.status <> 'active' then
    raise exception 'Only active assignments can be closed' using errcode = '22023';
  end if;
  if p_status = 'cancelled' and target.status not in ('draft', 'active') then
    raise exception 'Only draft or active assignments can be cancelled' using errcode = '22023';
  end if;

  update public.training_assignments
  set status = p_status,
      closed_at = case when p_status = 'closed' then now() else closed_at end,
      updated_at = now()
  where id = target.id
  returning * into updated;

  if p_status = 'cancelled' then
    update public.enrollments
    set status = 'cancelled', updated_at = now()
    where assignment_id = target.id and status in ('assigned', 'in_progress', 'overdue');
  end if;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'training_assignment.' || p_status, 'training_assignment', target.id::text,
    jsonb_build_object('previous_status', target.status));
  return updated;
end
$$;

revoke all on function public.set_training_assignment_status(uuid, text) from public;
grant execute on function public.set_training_assignment_status(uuid, text) to authenticated;

create or replace function public.waive_training_enrollment(
  p_enrollment_id uuid,
  p_reason text
)
returns public.enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.enrollments;
  assignment public.training_assignments;
  updated public.enrollments;
begin
  select * into target from public.enrollments where id = p_enrollment_id for update;
  if target.id is null then
    raise exception 'Enrollment is unavailable' using errcode = '22023';
  end if;
  select * into assignment from public.training_assignments where id = target.assignment_id;
  if not private.can_manage_training(assignment.market_id, target.user_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if target.status not in ('assigned', 'in_progress', 'overdue') then
    raise exception 'Enrollment cannot be waived in its current state' using errcode = '22023';
  end if;
  if length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'A meaningful waiver reason is required' using errcode = '22023';
  end if;

  update public.enrollments
  set status = 'waived', waived_by = (select auth.uid()), waiver_reason = btrim(p_reason),
      progress_percent = 100, updated_at = now()
  where id = target.id
  returning * into updated;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'enrollment.waived', 'enrollment', target.id::text,
    jsonb_build_object('assignment_id', target.assignment_id, 'user_id', target.user_id));
  return updated;
end
$$;

revoke all on function public.waive_training_enrollment(uuid, text) from public;
grant execute on function public.waive_training_enrollment(uuid, text) to authenticated;

create or replace function public.set_certification_status(
  p_certification_id uuid,
  p_status text,
  p_reason text default null
)
returns public.certifications
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.certifications;
  updated public.certifications;
begin
  select * into target from public.certifications where id = p_certification_id for update;
  if target.id is null or not private.can_manage_training(null, target.user_id) then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_status not in ('active', 'suspended', 'revoked') then
    raise exception 'Unsupported certification status' using errcode = '22023';
  end if;
  if target.status = 'revoked' then
    raise exception 'A revoked certification cannot be restored' using errcode = '22023';
  end if;
  if p_status = 'active' and (target.status <> 'suspended' or target.expires_at <= now()) then
    raise exception 'Only a current suspended certification can be restored' using errcode = '22023';
  end if;
  if p_status = 'active' and exists (
    select 1 from public.certifications current_certificate
    where current_certificate.user_id = target.user_id
      and current_certificate.certification_type = target.certification_type
      and current_certificate.status = 'active'
      and current_certificate.id <> target.id
  ) then
    raise exception 'A newer active certification already exists' using errcode = '23505';
  end if;
  if p_status = 'revoked' and length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'A meaningful revocation reason is required' using errcode = '22023';
  end if;

  update public.certifications
  set status = p_status,
      suspended_at = case when p_status = 'suspended' then now() else null end,
      revoked_at = case when p_status = 'revoked' then now() else null end,
      revoked_by = case when p_status = 'revoked' then (select auth.uid()) else null end,
      revocation_reason = case when p_status = 'revoked' then btrim(p_reason) else null end,
      updated_at = now()
  where id = target.id
  returning * into updated;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values ((select auth.uid()), 'certification.' || p_status, 'certification', target.id::text,
    jsonb_build_object('previous_status', target.status, 'user_id', target.user_id));
  return updated;
end
$$;

revoke all on function public.set_certification_status(uuid, text, text) from public;
grant execute on function public.set_certification_status(uuid, text, text) to authenticated;

create or replace function public.refresh_training_deadlines()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  overdue_count integer;
  expired_count integer;
begin
  caller := private.current_profile();
  if caller.user_id is null or caller.role not in ('super_admin', 'admin', 'aom', 'supervisor') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;

  update public.enrollments enrollment
  set status = 'overdue', updated_at = now()
  from public.training_assignments assignment, public.user_profiles learner
  where enrollment.assignment_id = assignment.id
    and learner.user_id = enrollment.user_id
    and enrollment.status in ('assigned', 'in_progress')
    and enrollment.due_at is not null
    and enrollment.due_at + make_interval(days => assignment.grace_period_days) < now()
    and (caller.role in ('super_admin', 'admin') or learner.market_id = caller.market_id);
  get diagnostics overdue_count = row_count;

  update public.certifications certification
  set status = 'expired', updated_at = now()
  from public.user_profiles learner
  where learner.user_id = certification.user_id
    and certification.status = 'active'
    and certification.expires_at <= now()
    and (caller.role in ('super_admin', 'admin') or learner.market_id = caller.market_id);
  get diagnostics expired_count = row_count;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (caller.user_id, 'training_deadlines.refreshed', 'training_system', 'current',
    jsonb_build_object('overdue_enrollments', overdue_count, 'expired_certifications', expired_count));
  return jsonb_build_object('overdue_enrollments', overdue_count, 'expired_certifications', expired_count);
end
$$;

revoke all on function public.refresh_training_deadlines() from public;
grant execute on function public.refresh_training_deadlines() to authenticated;

create or replace function public.save_learning_path(
  p_learning_path_id uuid,
  p_title text,
  p_description text,
  p_market_id integer,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  saved_id uuid;
  item jsonb;
  item_market_id integer;
begin
  caller := private.current_profile();
  if caller.user_id is null or caller.role not in ('super_admin', 'admin', 'aom', 'supervisor') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if caller.role in ('aom', 'supervisor') and p_market_id is distinct from caller.market_id then
    raise exception 'Learning path must remain in your market' using errcode = '42501';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'At least one learning path item is required' using errcode = '22023';
  end if;

  if p_learning_path_id is null then
    insert into public.learning_paths (title, description, market_id, created_by)
    values (btrim(p_title), nullif(btrim(p_description), ''), p_market_id, caller.user_id)
    returning id into saved_id;
  else
    select id into saved_id from public.learning_paths
    where id = p_learning_path_id and status = 'draft'
      and (created_by = caller.user_id or private.can_manage_training(market_id, null))
    for update;
    if saved_id is null then
      raise exception 'Draft learning path is unavailable' using errcode = '42501';
    end if;
    update public.learning_paths
    set title = btrim(p_title), description = nullif(btrim(p_description), ''),
        market_id = p_market_id, updated_at = now()
    where id = saved_id;
    delete from public.learning_path_items where learning_path_id = saved_id;
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    if (item ->> 'content_type') not in ('study_guide', 'quiz') then
      raise exception 'Unsupported learning path content type' using errcode = '22023';
    end if;
    if ((item ->> 'content_type') = 'study_guide' and not exists (
      select 1 from public.study_guides where id = (item ->> 'content_id')::uuid
    )) or ((item ->> 'content_type') = 'quiz' and not exists (
      select 1 from public.quizzes where id = (item ->> 'content_id')::uuid
    )) then
      raise exception 'Learning path content is unavailable' using errcode = '22023';
    end if;
    if (item ->> 'content_type') = 'study_guide' then
      select market_id into item_market_id
      from public.study_guides where id = (item ->> 'content_id')::uuid;
    else
      select market_id into item_market_id
      from public.quizzes where id = (item ->> 'content_id')::uuid;
    end if;
    if caller.role in ('aom', 'supervisor') and item_market_id is distinct from caller.market_id then
      raise exception 'Learning path content must belong to your market' using errcode = '42501';
    end if;
    insert into public.learning_path_items (
      learning_path_id, sequence_number, content_type, content_id, is_required
    ) values (
      saved_id,
      (item ->> 'sequence_number')::integer,
      item ->> 'content_type',
      (item ->> 'content_id')::uuid,
      coalesce((item ->> 'is_required')::boolean, true)
    );
  end loop;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id)
  values (caller.user_id, 'learning_path.saved', 'learning_path', saved_id::text);
  return saved_id;
end
$$;

revoke all on function public.save_learning_path(uuid, text, text, integer, jsonb) from public;
grant execute on function public.save_learning_path(uuid, text, text, integer, jsonb) to authenticated;

create or replace function public.activate_learning_path(p_learning_path_id uuid)
returns public.learning_paths
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.learning_paths;
begin
  update public.learning_paths path
  set status = 'active', updated_at = now()
  where path.id = p_learning_path_id and path.status = 'draft'
    and (path.created_by = (select auth.uid()) or private.can_manage_training(path.market_id, null))
  returning * into target;
  if target.id is null then
    raise exception 'Draft learning path is unavailable' using errcode = '42501';
  end if;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id)
  values ((select auth.uid()), 'learning_path.activated', 'learning_path', target.id::text);
  return target;
end
$$;

revoke all on function public.activate_learning_path(uuid) from public;
grant execute on function public.activate_learning_path(uuid) to authenticated;

create or replace function public.create_content_version(
  p_study_guide_id uuid,
  p_title text,
  p_content jsonb,
  p_review_due_at timestamptz default null
)
returns public.content_versions
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  guide public.study_guides;
  next_version integer;
  created public.content_versions;
begin
  caller := private.current_profile();
  if caller.user_id is null or caller.role not in ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  select * into guide from public.study_guides where id = p_study_guide_id;
  if guide.id is null then
    raise exception 'Study guide is unavailable' using errcode = '22023';
  end if;
  if caller.role not in ('super_admin', 'admin') and not (
    guide.market_id = caller.market_id
    and (caller.role in ('aom', 'supervisor') or guide.created_by = caller.user_id)
  ) then
    raise exception 'Study guide is outside your content scope' using errcode = '42501';
  end if;
  perform pg_advisory_xact_lock(hashtextextended(p_study_guide_id::text, 0));
  select coalesce(max(version_number), 0) + 1 into next_version
  from public.content_versions where study_guide_id = p_study_guide_id;

  insert into public.content_versions (
    study_guide_id, version_number, title, content, owner_user_id, review_due_at
  ) values (
    p_study_guide_id, next_version, btrim(p_title), p_content, caller.user_id, p_review_due_at
  ) returning * into created;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (caller.user_id, 'content_version.created', 'content_version', created.id::text,
    jsonb_build_object('study_guide_id', p_study_guide_id, 'version_number', next_version));
  return created;
end
$$;

revoke all on function public.create_content_version(uuid, text, jsonb, timestamptz) from public;
grant execute on function public.create_content_version(uuid, text, jsonb, timestamptz) to authenticated;

create or replace function public.submit_content_version_for_review(
  p_content_version_id uuid,
  p_assigned_to uuid default null
)
returns public.content_reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  version public.content_versions;
  review public.content_reviews;
begin
  select * into version from public.content_versions where id = p_content_version_id for update;
  if version.id is null or version.status <> 'draft'
    or not (version.owner_user_id = (select auth.uid()) or private.can_manage_training(null, version.owner_user_id)) then
    raise exception 'Draft content version is unavailable' using errcode = '42501';
  end if;
  if p_assigned_to is not null and not exists (
    select 1 from public.user_profiles reviewer
    where reviewer.user_id = p_assigned_to and reviewer.is_active = true
      and reviewer.role in ('super_admin', 'admin')
  ) then
    raise exception 'Reviewer is unavailable' using errcode = '22023';
  end if;
  update public.content_versions set status = 'in_review', updated_at = now() where id = version.id;
  insert into public.content_reviews (content_version_id, assigned_to)
  values (version.id, p_assigned_to) returning * into review;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id)
  values ((select auth.uid()), 'content_version.review_requested', 'content_version', version.id::text);
  return review;
end
$$;

revoke all on function public.submit_content_version_for_review(uuid, uuid) from public;
grant execute on function public.submit_content_version_for_review(uuid, uuid) to authenticated;

create or replace function public.decide_content_review(
  p_review_id uuid,
  p_decision text,
  p_comments text default null
)
returns public.content_reviews
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller public.user_profiles;
  target public.content_reviews;
  updated public.content_reviews;
begin
  caller := private.current_profile();
  select * into target from public.content_reviews where id = p_review_id for update;
  if caller.user_id is null or target.id is null or target.status <> 'pending'
    or caller.role not in ('super_admin', 'admin')
    or (target.assigned_to is not null and target.assigned_to <> caller.user_id and caller.role <> 'super_admin') then
    raise exception 'Not authorized' using errcode = '42501';
  end if;
  if p_decision not in ('approved', 'changes_requested') then
    raise exception 'Unsupported review decision' using errcode = '22023';
  end if;
  if p_decision = 'changes_requested' and length(btrim(coalesce(p_comments, ''))) < 10 then
    raise exception 'Change requests require meaningful comments' using errcode = '22023';
  end if;

  update public.content_reviews
  set status = p_decision, comments = nullif(btrim(p_comments), ''),
      decided_by = caller.user_id, decided_at = now(), updated_at = now()
  where id = target.id
  returning * into updated;

  if p_decision = 'approved' then
    update public.content_versions
    set status = 'approved', approved_by = caller.user_id, approved_at = now(), updated_at = now()
    where id = target.content_version_id;
  else
    update public.content_versions set status = 'draft', updated_at = now()
    where id = target.content_version_id;
  end if;
  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (caller.user_id, 'content_review.' || p_decision, 'content_review', target.id::text,
    jsonb_build_object('content_version_id', target.content_version_id));
  return updated;
end
$$;

revoke all on function public.decide_content_review(uuid, text, text) from public;
grant execute on function public.decide_content_review(uuid, text, text) to authenticated;

create or replace function public.publish_content_version(
  p_content_version_id uuid,
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
  published public.content_versions;
begin
  caller := private.current_profile();
  select * into target from public.content_versions where id = p_content_version_id for update;
  if caller.user_id is null or caller.role not in ('super_admin', 'admin')
    or target.id is null or target.status <> 'approved' then
    raise exception 'Approved content version is unavailable' using errcode = '42501';
  end if;

  update public.content_versions
  set status = 'superseded', updated_at = now()
  where study_guide_id = target.study_guide_id and status = 'published' and id <> target.id;
  update public.content_versions
  set status = 'published',
      published_by = caller.user_id,
      published_at = now(),
      effective_at = coalesce(p_effective_at, now()),
      updated_at = now()
  where id = target.id returning * into published;
  update public.study_guides set content = published.content::text where id = published.study_guide_id;

  insert into public.training_audit_events (actor_user_id, action, target_type, target_id, metadata)
  values (caller.user_id, 'content_version.published', 'content_version', target.id::text,
    jsonb_build_object('study_guide_id', target.study_guide_id, 'version_number', target.version_number));
  return published;
end
$$;

revoke all on function public.publish_content_version(uuid, timestamptz) from public;
grant execute on function public.publish_content_version(uuid, timestamptz) to authenticated;

comment on table public.quiz_result_adjustments is
  'Append-only administrative score corrections that preserve the original authoritative result.';
comment on function public.refresh_training_deadlines() is
  'Idempotently marks overdue enrollments and expired certifications within the caller management scope.';
