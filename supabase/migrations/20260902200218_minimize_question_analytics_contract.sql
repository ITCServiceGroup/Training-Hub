-- Managers need aggregate performance, not the official answer bank. Replace
-- the RPC signature so correct_answer is used only inside the database.

drop function public.get_question_performance(bigint[]);

create function public.get_question_performance(p_result_ids bigint[])
returns table (
  question_id uuid,
  question_text text,
  question_type text,
  options jsonb,
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

revoke all on function public.get_question_performance(bigint[])
  from public, anon, authenticated;
grant execute on function public.get_question_performance(bigint[]) to authenticated;

comment on function public.get_question_performance(bigint[]) is
  'Returns hierarchy-scoped aggregate question performance without learner answers, timing maps, or official correct answers.';
