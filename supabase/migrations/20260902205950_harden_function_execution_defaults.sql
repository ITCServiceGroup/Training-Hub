-- Supabase projects created with legacy Data API defaults grant EXECUTE on
-- newly-created public functions directly to anon and authenticated. Revoking
-- only from PUBLIC therefore leaves privileged RPCs callable. Reset both the
-- future default and every existing public routine before applying a narrow,
-- explicit application allowlist.

alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke all on sequences from public, anon, authenticated;

do $$
declare
  target record;
begin
  for target in
    select p.oid::regprocedure::text as signature
    from pg_catalog.pg_proc p
    join pg_catalog.pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
  loop
    execute format(
      'revoke all on function %s from public, anon, authenticated',
      target.signature
    );
  end loop;
end
$$;

-- Signed-out assessment APIs and the public-content visibility predicate.
grant execute on function
  public.can_view_content(integer, boolean),
  public.load_quiz_for_learner(uuid, text),
  public.submit_quiz_attempt(text, jsonb, uuid, integer, jsonb),
  public.grade_practice_attempt(uuid, jsonb)
to anon, authenticated;

-- Authenticated application APIs and RLS predicates. Each SECURITY DEFINER
-- routine performs its own active-profile, role, hierarchy, and market checks.
grant execute on function
  public.update_managed_user_profile(uuid, text, public.user_role, integer, uuid, boolean),
  public.create_quiz_access_code(uuid, text, text, text, text, integer),
  public.list_quiz_access_codes(uuid),
  public.revoke_quiz_access_code(uuid),
  public.save_training_assignment(uuid, text, text, text, uuid, uuid, boolean, text, timestamptz, timestamptz, integer, integer, text, integer, jsonb),
  public.activate_training_assignment(uuid),
  public.begin_training_enrollment(uuid),
  public.complete_training_enrollment(uuid, bigint),
  public.list_my_training(),
  public.issue_assigned_quiz_access_code(uuid),
  public.list_my_learning_path_progress(),
  public.begin_learning_path_item(uuid, integer),
  public.complete_learning_path_item(uuid, integer, bigint),
  public.issue_learning_path_quiz_code(uuid, integer),
  public.record_quiz_result_adjustment(bigint, double precision, text),
  public.set_training_assignment_prerequisites(uuid, uuid[]),
  public.set_training_assignment_status(uuid, text),
  public.waive_training_enrollment(uuid, text),
  public.set_certification_status(uuid, text, text),
  public.refresh_training_deadlines(),
  public.save_learning_path(uuid, text, text, integer, jsonb),
  public.activate_learning_path(uuid),
  public.create_content_version(uuid, text, jsonb, timestamptz),
  public.submit_content_version_for_review(uuid, uuid),
  public.decide_content_review(uuid, text, text),
  public.publish_content_version(uuid, timestamptz),
  public.get_question_performance(bigint[]),
  public.republish_content_version(uuid, text, timestamptz),
  public.get_user_profile(),
  public.get_user_role(),
  public.get_user_market_id(),
  public.is_admin(),
  public.is_super_admin(),
  public.can_create_content(),
  public.can_edit_content(uuid, integer),
  public.can_manage_user(uuid)
to authenticated;

comment on schema public is
  'Training Hub Data API schema; function execution is deny-by-default with explicit role grants.';
