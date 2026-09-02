-- Close policy-name drift left by the historical hand-managed migration set.
-- PostgreSQL policies are permissive by default, so one surviving legacy
-- policy can reopen a table even when a newer restrictive policy is present.

-- Access codes are RPC-only for every client role.
drop policy if exists "Access codes read access" on public.access_codes;
drop policy if exists "Access codes insert access" on public.access_codes;
drop policy if exists "Access codes update access" on public.access_codes;
drop policy if exists "Access codes delete access" on public.access_codes;
drop policy if exists "access_codes_select_policy" on public.access_codes;
drop policy if exists "access_codes_insert_policy" on public.access_codes;
drop policy if exists "access_codes_update_policy" on public.access_codes;
drop policy if exists "access_codes_delete_policy" on public.access_codes;
revoke all on table public.access_codes from public, anon, authenticated;

-- Official results are written only by the transactional grading function.
drop policy if exists "Allow insert for all" on public.quiz_results;
drop policy if exists "quiz_results_insert_policy" on public.quiz_results;
drop policy if exists "quiz_results_select_policy" on public.quiz_results;
revoke all on table public.quiz_results from public, anon, authenticated;
grant select on table public.quiz_results to authenticated;

create policy "quiz_results_select_authorized_managers"
on public.quiz_results for select to authenticated
using (
  exists (
    select 1
    from public.user_profiles caller
    left join public.markets caller_market on caller_market.id = caller.market_id
    where caller.user_id = (select auth.uid())
      and caller.is_active = true
      and (
        caller.role in ('super_admin', 'admin')
        or (caller.role in ('aom', 'supervisor') and quiz_results.market = caller_market.name)
      )
  )
);

-- Keep report linking mutable while making every assessment and grading field
-- immutable, including to service-role clients and future accidental grants.
create or replace function private.guard_quiz_result_immutability()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception 'quiz_results records are immutable' using errcode = '55000';
  end if;
  if (to_jsonb(new) - 'pdf_url') is distinct from (to_jsonb(old) - 'pdf_url') then
    raise exception 'quiz_results evidence fields are immutable' using errcode = '55000';
  end if;
  return new;
end
$$;

revoke all on function private.guard_quiz_result_immutability() from public;
drop trigger if exists quiz_results_immutable_evidence on public.quiz_results;
create trigger quiz_results_immutable_evidence
before update or delete on public.quiz_results
for each row execute function private.guard_quiz_result_immutability();

-- Remove every known legacy answer-bank policy name. The replacement select
-- policies from the authoritative assessment migration remain in force.
drop policy if exists "Questions read access" on public.questions;
drop policy if exists "Questions insert access" on public.questions;
drop policy if exists "Questions update access" on public.questions;
drop policy if exists "Questions delete access" on public.questions;
drop policy if exists "Quiz questions read access" on public.quiz_questions;
drop policy if exists "Quiz questions insert access" on public.quiz_questions;
drop policy if exists "Quiz questions update access" on public.quiz_questions;
drop policy if exists "Quiz questions delete access" on public.quiz_questions;

revoke all on table public.questions, public.quiz_questions from public, anon, authenticated;
grant select, insert, update, delete on table public.questions, public.quiz_questions to authenticated;

-- Junction writes must be scoped to both the quiz and the question. This
-- prevents an editor from linking answer-bank rows across markets.
drop policy if exists "quiz_questions_insert_policy" on public.quiz_questions;
drop policy if exists "quiz_questions_update_policy" on public.quiz_questions;
drop policy if exists "quiz_questions_delete_policy" on public.quiz_questions;

create policy "quiz_questions_insert_scoped_managers"
on public.quiz_questions for insert to authenticated
with check (
  exists (
    select 1
    from public.quizzes quiz
    join public.questions question on question.id = quiz_questions.question_id
    where quiz.id = quiz_questions.quiz_id
      and public.can_edit_content(quiz.created_by, quiz.market_id)
      and public.can_edit_content(question.created_by, question.market_id)
  )
);

create policy "quiz_questions_update_scoped_managers"
on public.quiz_questions for update to authenticated
using (
  exists (
    select 1 from public.quizzes quiz
    where quiz.id = quiz_questions.quiz_id
      and public.can_edit_content(quiz.created_by, quiz.market_id)
  )
)
with check (
  exists (
    select 1
    from public.quizzes quiz
    join public.questions question on question.id = quiz_questions.question_id
    where quiz.id = quiz_questions.quiz_id
      and public.can_edit_content(quiz.created_by, quiz.market_id)
      and public.can_edit_content(question.created_by, question.market_id)
  )
);

create policy "quiz_questions_delete_scoped_managers"
on public.quiz_questions for delete to authenticated
using (
  exists (
    select 1 from public.quizzes quiz
    where quiz.id = quiz_questions.quiz_id
      and public.can_edit_content(quiz.created_by, quiz.market_id)
  )
);

-- Remove the renamed-table policies that otherwise grant any authenticated
-- user write access to content. The scoped lowercase policies remain active.
drop policy if exists "Questions insert access" on public.questions;
drop policy if exists "Questions update access" on public.questions;
drop policy if exists "Questions delete access" on public.questions;
drop policy if exists "Quizzes insert access" on public.quizzes;
drop policy if exists "Quizzes update access" on public.quizzes;
drop policy if exists "Quizzes delete access" on public.quizzes;
drop policy if exists "Only admins can insert sections" on public.sections;
drop policy if exists "Only admins can update sections" on public.sections;
drop policy if exists "Only admins can delete sections" on public.sections;
drop policy if exists "Only admins can insert categories" on public.categories;
drop policy if exists "Only admins can update categories" on public.categories;
drop policy if exists "Only admins can delete categories" on public.categories;
drop policy if exists "Only admins can insert study_guides" on public.study_guides;
drop policy if exists "Only admins can update study_guides" on public.study_guides;
drop policy if exists "Only admins can delete study_guides" on public.study_guides;
drop policy if exists "Allow authenticated users to INSERT" on public.media_library;
drop policy if exists "Allow authenticated users to UPDATE" on public.media_library;
drop policy if exists "Allow authenticated users to DELETE" on public.media_library;

-- Authorization-bearing profiles are read through one hierarchy-aware policy
-- and changed only through audited APIs.
drop policy if exists "Users can update own profile" on public.user_profiles;
drop policy if exists "user_profiles_update_policy" on public.user_profiles;
drop policy if exists "Managers can update profiles" on public.user_profiles;
drop policy if exists "Admins can create profiles" on public.user_profiles;
drop policy if exists "Super admin can delete profiles" on public.user_profiles;
drop policy if exists "Users can view own profile" on public.user_profiles;
drop policy if exists "Admins can view all profiles" on public.user_profiles;
drop policy if exists "Managers can view regional profiles" on public.user_profiles;
drop policy if exists "user_profiles_select_policy" on public.user_profiles;

revoke all on table public.user_profiles from public, anon, authenticated;
grant select on table public.user_profiles to authenticated;
create policy "user_profiles_read_hierarchy"
on public.user_profiles for select to authenticated
using (
  user_id = (select auth.uid())
  or private.can_manage_training(null, user_id)
);

-- User creation now runs through the Auth Admin API in an authenticated Edge
-- Function, not through direct writes to GoTrue's internal tables.
do $$
begin
  if to_regprocedure('public.admin_create_user(text,text,text,text,integer,uuid)') is not null then
    revoke all on function public.admin_create_user(text, text, text, text, integer, uuid)
    from public, anon, authenticated;
  end if;
end
$$;

comment on function private.guard_quiz_result_immutability() is
  'Prevents updates to authoritative quiz evidence and all result deletion; only the private report object key may change.';
