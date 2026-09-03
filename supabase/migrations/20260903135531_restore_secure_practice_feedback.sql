-- Restore the pre-hardening practice-quiz feedback experience without putting
-- answer keys back into the initial learner quiz payload. The same endpoint is
-- used for a single answer and for the final attempt; it only reveals feedback
-- for questions the learner actually submitted.
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
  answer_correct boolean;
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
    answer_correct := p_answers ? question.id::text
      and private.answer_is_correct(
        question.question_type,
        p_answers -> question.id::text,
        question.correct_answer
      );

    if answer_correct then
      correct_count := correct_count + 1;
    end if;

    if p_answers ? question.id::text then
      feedback := feedback || jsonb_build_object(
        question.id::text,
        jsonb_build_object(
          'correct_answer', question.correct_answer,
          'explanation', question.explanation,
          'is_correct', answer_correct
        )
      );
    end if;
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
