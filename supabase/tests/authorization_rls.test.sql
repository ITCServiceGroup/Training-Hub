begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(131);

select ok(
  (select relrowsecurity from pg_class where oid = 'public.user_profiles'::regclass),
  'user_profiles has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.access_codes'::regclass),
  'access_codes has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.quiz_results'::regclass),
  'quiz_results has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.questions'::regclass),
  'questions has RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.quiz_result_reports'::regclass),
  'quiz_result_reports has RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.access_codes', 'select'),
  'anonymous callers cannot enumerate access codes'
);
select ok(
  not has_table_privilege('anon', 'public.access_codes', 'update'),
  'anonymous callers cannot consume access codes directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.access_codes', 'select'),
  'authenticated clients use scoped code-management functions'
);
select ok(
  not has_table_privilege('anon', 'public.quiz_results', 'insert'),
  'anonymous callers cannot insert official results directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.quiz_results', 'update'),
  'authenticated callers cannot rewrite official results'
);
select ok(
  not has_table_privilege('authenticated', 'public.quiz_results', 'delete'),
  'authenticated callers cannot delete official results'
);
select ok(
  not has_table_privilege('anon', 'public.questions', 'select'),
  'anonymous callers cannot read answer-bearing question rows'
);
select ok(
  not has_table_privilege('anon', 'public.quiz_questions', 'select'),
  'anonymous callers cannot enumerate the official question bank'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_profiles', 'update'),
  'authenticated users cannot update authorization-bearing profiles directly'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_profiles', 'insert'),
  'authenticated callers cannot create profiles outside the audited user workflow'
);
select ok(
  not has_table_privilege('authenticated', 'public.user_profiles', 'delete'),
  'authenticated callers cannot delete historical user profiles'
);
select ok(
  not has_table_privilege('anon', 'public.security_audit_log', 'select'),
  'anonymous callers cannot read the security ledger'
);
select ok(
  not has_table_privilege('authenticated', 'public.security_audit_log', 'insert'),
  'authenticated callers cannot forge security events'
);
select ok(
  not has_table_privilege('authenticated', 'public.quiz_result_reports', 'select'),
  'report authorization records are internal'
);

select ok(
  has_function_privilege('anon', 'public.load_quiz_for_learner(uuid,text)', 'execute'),
  'anonymous learners may load a learner-safe quiz through the narrow function'
);
select ok(
  has_function_privilege('anon', 'public.submit_quiz_attempt(text,jsonb,uuid,integer,jsonb)', 'execute'),
  'anonymous learners may submit through the transactional grading function'
);
select ok(
  not has_function_privilege('anon', 'public.create_quiz_access_code(uuid,text,text,text,text,integer)', 'execute'),
  'anonymous callers cannot create access codes'
);
select ok(
  has_function_privilege('authenticated', 'public.create_quiz_access_code(uuid,text,text,text,text,integer)', 'execute'),
  'authenticated managers can reach the code function, which performs business-role authorization'
);

select is(
  (select public from storage.buckets where id = 'quiz-pdfs'),
  false,
  'quiz-pdfs is private'
);
select is(
  (select file_size_limit from storage.buckets where id = 'quiz-pdfs'),
  10485760::bigint,
  'quiz-pdfs enforces a 10 MiB limit'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'quiz-pdfs'),
  array['application/pdf']::text[],
  'quiz-pdfs accepts PDF content only'
);

select ok((select relrowsecurity from pg_class where oid = 'public.training_assignments'::regclass),
  'training_assignments has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.assignment_audiences'::regclass),
  'assignment_audiences has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.enrollments'::regclass),
  'enrollments has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.completion_records'::regclass),
  'completion_records has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.certifications'::regclass),
  'certifications has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.content_versions'::regclass),
  'content_versions has RLS enabled');

select ok(not has_table_privilege('authenticated', 'public.training_assignments', 'insert'),
  'clients cannot bypass the assignment-management function');
select ok(not has_table_privilege('authenticated', 'public.enrollments', 'update'),
  'learners cannot arbitrarily change enrollment state');
select ok(not has_table_privilege('authenticated', 'public.completion_records', 'insert'),
  'learners cannot forge immutable completion evidence');
select ok(not has_table_privilege('authenticated', 'public.certifications', 'insert'),
  'learners cannot issue certifications directly');
select ok(not has_table_privilege('authenticated', 'public.training_audit_events', 'insert'),
  'clients cannot forge training audit events');

select ok(has_function_privilege('authenticated', 'public.list_my_training()', 'execute'),
  'authenticated learners can list their own training');
select ok(has_function_privilege('authenticated', 'public.begin_training_enrollment(uuid)', 'execute'),
  'authenticated learners can begin their own enrollment through the narrow function');
select ok(has_function_privilege('authenticated', 'public.complete_training_enrollment(uuid,bigint)', 'execute'),
  'authenticated learners can submit completion through the evidence-validating function');
select ok(has_function_privilege('authenticated', 'public.activate_training_assignment(uuid)', 'execute'),
  'authenticated managers can reach the assignment activation authorization boundary');
select ok(has_function_privilege(
  'authenticated',
  'public.save_training_assignment(uuid,text,text,text,uuid,uuid,boolean,text,timestamp with time zone,timestamp with time zone,integer,integer,text,integer,jsonb)',
  'execute'
), 'authenticated managers can reach the assignment save authorization boundary');
select ok(not has_function_privilege('anon', 'public.list_my_training()', 'execute'),
  'anonymous callers cannot list training enrollments');
select ok(not has_function_privilege('anon', 'public.complete_training_enrollment(uuid,bigint)', 'execute'),
  'anonymous callers cannot create completion evidence');

select ok((select relrowsecurity from pg_class where oid = 'public.learning_path_progress'::regclass),
  'learning_path_progress has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.quiz_result_adjustments'::regclass),
  'quiz_result_adjustments has RLS enabled');
select ok(not has_table_privilege('authenticated', 'public.learning_path_progress', 'insert'),
  'learners cannot forge learning path progress');
select ok(not has_table_privilege('authenticated', 'public.learning_path_progress', 'update'),
  'learners cannot bypass ordered path transitions');
select ok(not has_table_privilege('authenticated', 'public.quiz_result_adjustments', 'insert'),
  'clients cannot forge score adjustments');

select ok(has_function_privilege('authenticated', 'public.issue_assigned_quiz_access_code(uuid)', 'execute'),
  'authenticated learners can request a short-lived code for their own assigned quiz');
select ok(not has_function_privilege('anon', 'public.issue_assigned_quiz_access_code(uuid)', 'execute'),
  'anonymous callers cannot issue assigned quiz codes');
select ok(has_function_privilege('authenticated', 'public.list_my_learning_path_progress()', 'execute'),
  'authenticated learners can list their own learning path progress');
select ok(has_function_privilege('authenticated', 'public.begin_learning_path_item(uuid,integer)', 'execute'),
  'authenticated learners can begin an ordered path step');
select ok(has_function_privilege('authenticated', 'public.complete_learning_path_item(uuid,integer,bigint)', 'execute'),
  'authenticated learners can complete a path step through the evidence boundary');
select ok(has_function_privilege('authenticated', 'public.issue_learning_path_quiz_code(uuid,integer)', 'execute'),
  'authenticated learners can request a scoped path quiz code');
select ok(not has_function_privilege('anon', 'public.issue_learning_path_quiz_code(uuid,integer)', 'execute'),
  'anonymous callers cannot issue path quiz codes');

select ok(has_function_privilege('authenticated', 'public.waive_training_enrollment(uuid,text)', 'execute'),
  'managers can reach the audited enrollment waiver boundary');
select ok(has_function_privilege('authenticated', 'public.set_certification_status(uuid,text,text)', 'execute'),
  'managers can reach the audited certification transition boundary');
select ok(has_function_privilege('authenticated', 'public.refresh_training_deadlines()', 'execute'),
  'managers can refresh scoped overdue and expiry state');
select ok(has_function_privilege('authenticated', 'public.save_learning_path(uuid,text,text,integer,jsonb)', 'execute'),
  'managers can reach the learning path save boundary');
select ok(has_function_privilege(
  'authenticated',
  'public.create_content_version(uuid,text,jsonb,timestamp with time zone)',
  'execute'
), 'content authors can reach the version snapshot boundary');
select ok(has_function_privilege('authenticated', 'public.decide_content_review(uuid,text,text)', 'execute'),
  'administrators can reach the content review decision boundary');
select ok(has_function_privilege(
  'authenticated',
  'public.publish_content_version(uuid,timestamp with time zone)',
  'execute'
), 'administrators can reach the content publication boundary');

select ok(exists (
  select 1 from pg_trigger where tgrelid = 'public.security_audit_log'::regclass
    and tgname = 'security_audit_log_append_only' and not tgisinternal
), 'security audit history has an append-only trigger');
select ok(exists (
  select 1 from pg_trigger where tgrelid = 'public.completion_records'::regclass
    and tgname = 'completion_records_append_only' and not tgisinternal
), 'completion evidence has an append-only trigger');

select ok(not exists (
  select 1 from pg_policy where polrelid = 'public.access_codes'::regclass
    and polname in ('Access codes read access', 'access_codes_select_policy')
), 'legacy permissive access-code policies are absent');
select ok(not exists (
  select 1 from pg_policy where polrelid = 'public.questions'::regclass
    and polname = 'Questions read access'
), 'legacy public answer-bank policy is absent');
select ok(not exists (
  select 1 from pg_policy where polrelid = 'public.user_profiles'::regclass
    and polname in ('Users can update own profile', 'user_profiles_update_policy')
), 'legacy self-service authorization profile updates are absent');
select ok(
  to_regprocedure('public.admin_create_user(text,text,text,text,integer,uuid)') is null
  or not coalesce(has_function_privilege(
    'authenticated',
    to_regprocedure('public.admin_create_user(text,text,text,text,integer,uuid)'),
    'execute'
  ), false),
  'clients cannot write directly to Auth internal tables through the legacy function'
);
select ok(exists (
  select 1 from pg_trigger where tgrelid = 'public.quiz_results'::regclass
    and tgname = 'quiz_results_immutable_evidence' and not tgisinternal
), 'official result evidence has an immutability trigger');

select throws_ok(
  $$select private.answer_is_correct('check_all_that_apply', '[1,1]'::jsonb, '[1]'::jsonb)$$,
  '22023',
  'Duplicate multi-select option',
  'duplicate multi-select answers are rejected before grading'
);
select is(
  private.answer_is_correct('check_all_that_apply', '[2,1]'::jsonb, '[1,2]'::jsonb),
  true,
  'unique multi-select answers are compared without order sensitivity'
);
select ok(exists (
  select 1 from pg_constraint
  where conrelid = 'public.quiz_results'::regclass
    and conname = 'quiz_results_score_value_range_check'
    and convalidated
), 'official score range constraint is present and validated');
select ok(exists (
  select 1 from pg_constraint
  where conrelid = 'public.access_codes'::regclass
    and conname = 'access_codes_plaintext_code_forbidden_check'
    and convalidated
), 'plaintext access codes are forbidden by a validated constraint');
select ok(not exists (
  select 1 from public.access_codes where code is not null
), 'no plaintext access codes remain');
select ok((
  select prosrc ilike '%is_active = true%'
  from pg_proc
  where oid = 'public.get_user_role()'::regprocedure
), 'role lookup requires an active profile');
select ok((
  select prosrc ilike '%is_supervisor_managed_user%'
  from pg_proc
  where oid = 'private.can_manage_training(integer,uuid)'::regprocedure
), 'training management uses the reporting hierarchy for supervisors');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.user_profiles'::regclass
    and tgname = 'user_profiles_guard_reporting_hierarchy'
    and not tgisinternal
), 'profile updates preserve supervisor reporting hierarchy');
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.assignment_audiences'::regclass
    and tgname = 'assignment_audiences_guard_reporting_hierarchy'
    and not tgisinternal
), 'assignment audiences preserve supervisor reporting hierarchy');
select is(
  (select public from storage.buckets where id = 'media-library'),
  true,
  'learner media remains publicly readable'
);
select is(
  (select file_size_limit from storage.buckets where id = 'media-library'),
  52428800::bigint,
  'media-library enforces a 50 MiB limit'
);
select is(
  (select allowed_mime_types from storage.buckets where id = 'media-library'),
  array[
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/ogg'
  ]::text[],
  'media-library accepts only the supported training formats'
);
select ok(not exists (
  select 1 from pg_policy
  where polrelid = 'storage.objects'::regclass
    and polname in (
      'Allow authenticated users to insert media-library',
      'Allow authenticated users to update media-library',
      'Allow authenticated users to delete media-library'
    )
), 'legacy broad media-library write policies are absent');
select ok(not exists (
  select 1 from pg_policy
  where polrelid = 'storage.objects'::regclass
    and polname = 'media_library_objects_update'
), 'browser clients cannot overwrite media objects in place');
select is(
  (select count(*)::integer from pg_policy
   where polrelid = 'storage.objects'::regclass
     and polname in ('media_library_objects_insert', 'media_library_objects_delete')),
  2,
  'media-library has only scoped insert and delete write policies'
);
select ok(
  not has_column_privilege('authenticated', 'public.quiz_results', 'answers', 'select'),
  'bulk result readers cannot retrieve submitted answers'
);
select ok(
  has_column_privilege('authenticated', 'public.quiz_results', 'id', 'select'),
  'bulk result readers retain access to the safe result identifier'
);
select is(
  (select count(*)::integer from pg_policy
   where polrelid = 'public.study_guide_templates'::regclass
     and polname in (
       'study_guide_templates_select_policy',
       'study_guide_templates_insert_policy',
       'study_guide_templates_update_policy',
       'study_guide_templates_delete_policy'
     )),
  4,
  'shared templates use four active content-manager policies'
);
select ok(
  has_function_privilege(
    'service_role',
    'public.finalize_quiz_report_upload(bigint,text)',
    'execute'
  ),
  'the report finalization transaction is available to the service role'
);
select ok(
  not has_function_privilege(
    'authenticated',
    'public.finalize_quiz_report_upload(bigint,text)',
    'execute'
  ),
  'browser clients cannot finalize report metadata'
);
select ok((
  select pg_get_expr(polqual, polrelid) ilike '%is_supervisor_managed_user%'
  from pg_policy
  where polrelid = 'public.quiz_results'::regclass
    and polname = 'quiz_results_select_authorized_managers'
), 'supervisor result reads are restricted to their reporting hierarchy');
select ok((
  select convalidated
    and pg_get_constraintdef(oid) ilike '%score_value%>=%0%'
    and pg_get_constraintdef(oid) ilike '%score_value%<=%1%'
  from pg_constraint
  where conrelid = 'public.quiz_results'::regclass
    and conname = 'quiz_results_score_value_range_check'
), 'official score evidence is constrained to the zero-to-one range');
select ok(
  case
    when to_regclass('public.v2_quiz_results') is null then true
    else not has_table_privilege(
      'authenticated', to_regclass('public.v2_quiz_results'), 'select'
    )
  end,
  'the deprecated raw result table is unavailable to browser clients'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.media_library'::regclass),
  'media metadata has RLS enabled'
);
select ok(exists (
  select 1 from pg_trigger
  where tgrelid = 'public.media_library'::regclass
    and tgname = 'media_library_immutable_scope'
    and not tgisinternal
), 'media ownership and storage scope have an immutability trigger');
select is(
  (select count(*)::integer from pg_policy
   where polrelid = 'public.media_library'::regclass
     and polname in (
       'media_library_select_policy',
       'media_library_insert_policy',
       'media_library_update_policy',
       'media_library_delete_policy'
     )),
  4,
  'media metadata uses four scoped policies'
);
select ok(
  has_function_privilege(
    'authenticated', 'public.get_question_performance(bigint[])', 'execute'
  ),
  'authorized dashboard users can reach the aggregate question-performance boundary'
);
select ok(
  not has_function_privilege(
    'anon', 'public.get_question_performance(bigint[])', 'execute'
  ),
  'anonymous callers cannot request question-performance aggregates'
);
select ok((
  select prosrc ilike '%is_supervisor_managed_user%'
    and prosrc ilike '%answer_is_correct%'
  from pg_proc
  where oid = 'public.get_question_performance(bigint[])'::regprocedure
), 'question-performance aggregation enforces hierarchy and grades inside the database');
select ok((
  select not ('correct_answer' = any(proargnames))
  from pg_proc
  where oid = 'public.get_question_performance(bigint[])'::regprocedure
), 'question-performance responses omit the official correct answer');

select ok(
  (select relrowsecurity from pg_class where oid = 'private.assessment_validation_secrets'::regclass),
  'assessment validation secrets have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'private.assessment_validation_buckets'::regclass),
  'assessment validation buckets have RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'private.assessment_validation_secrets', 'select'),
  'anonymous callers cannot inspect validation secrets'
);
select ok(
  not has_table_privilege('anon', 'private.assessment_validation_buckets', 'select'),
  'anonymous callers cannot inspect validation buckets'
);
select ok(
  has_function_privilege('anon', 'public.load_quiz_for_learner(uuid,text)', 'execute'),
  'anonymous learners can use the rate-limited quiz loader'
);
select ok(
  not has_function_privilege('anon', 'public.load_quiz_for_learner_unthrottled(uuid,text)', 'execute'),
  'anonymous callers cannot bypass loader rate limits'
);
select ok(
  has_function_privilege('anon', 'public.submit_quiz_attempt(text,jsonb,uuid,integer,jsonb)', 'execute'),
  'anonymous learners can use the rate-limited submission wrapper'
);
select ok(
  not has_function_privilege('anon', 'public.submit_quiz_attempt_unthrottled(text,jsonb,uuid,integer,jsonb)', 'execute'),
  'anonymous callers cannot bypass submission rate limits'
);
select ok((
  select proconfig @> array['search_path=""']
  from pg_proc
  where oid = 'private.allow_assessment_code_candidate(text,uuid)'::regprocedure
), 'validation rate-limit helper has an empty search path');
select ok((
  select prosrc ilike '%failure_count >= 7%'
    and prosrc ilike '%interval ''30 minutes''%'
  from pg_proc
  where oid = 'private.allow_assessment_code_candidate(text,uuid)'::regprocedure
), 'validation rate-limit helper blocks the eighth failure for thirty minutes');
select ok((
  select prosrc ilike '%extensions.hmac%'
    and prosrc ilike '%result.idempotency_key = p_idempotency_key%'
    and prosrc ilike '%candidate.revoked_at is null%'
    and prosrc not ilike '%insert into public%'
  from pg_proc
  where oid = 'private.allow_assessment_code_candidate(text,uuid)'::regprocedure
), 'validation buckets retain no submitted code and clear only for usable codes or matching replays');
select ok((
  select prosrc ilike '%updated_at < now() - interval ''7 days''%'
  from pg_proc
  where oid = 'private.allow_assessment_code_candidate(text,uuid)'::regprocedure
), 'stale pseudonymous validation buckets are deleted after seven days');
select ok(
  has_function_privilege(
    'authenticated',
    'public.republish_content_version(uuid,text,timestamptz)',
    'execute'
  ),
  'authenticated administrators can reach the guarded republish workflow'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.republish_content_version(uuid,text,timestamptz)',
    'execute'
  ),
  'anonymous callers cannot republish content versions'
);
select ok((
  select prosrc ilike '%target.status <> ''superseded''%'
    and prosrc ilike '%meaningful republish reason%'
    and prosrc ilike '%from public.study_guides guide%for update%'
    and prosrc ilike '%content_version.republished%'
  from pg_proc
  where oid = 'public.republish_content_version(uuid,text,timestamptz)'::regprocedure
), 'republishing is serialized, limited to superseded versions, and writes an audited reason');

select is(
  (
    select count(*)::integer
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and has_function_privilege('anon', p.oid, 'execute')
      and p.oid not in (
        'public.can_view_content(integer,boolean)'::regprocedure,
        'public.load_quiz_for_learner(uuid,text)'::regprocedure,
        'public.submit_quiz_attempt(text,jsonb,uuid,integer,jsonb)'::regprocedure,
        'public.grade_practice_attempt(uuid,jsonb)'::regprocedure
      )
  ),
  0,
  'anonymous callers can execute only the explicit learner and public-content function allowlist'
);
select is(
  (
    select count(*)::integer
    from unnest(array[
      'public.admin_create_user(text,text,text,text,integer,uuid)'::regprocedure,
      'public.finalize_quiz_report_upload(bigint,text)'::regprocedure,
      'public.load_quiz_for_learner_unthrottled(uuid,text)'::regprocedure,
      'public.submit_quiz_attempt_unthrottled(text,jsonb,uuid,integer,jsonb)'::regprocedure,
      'public.ensure_single_default_configuration()'::regprocedure,
      'public.ensure_single_default_dashboard()'::regprocedure,
      'public.ensure_single_default_layout()'::regprocedure,
      'public.migrate_existing_users_to_simple_dashboards()'::regprocedure
    ]) as blocked(signature)
    where has_function_privilege('authenticated', blocked.signature, 'execute')
  ),
  0,
  'authenticated callers cannot execute internal, maintenance, or service-only functions'
);
select ok(
  not exists (
    select 1
    from pg_default_acl defaults
    join pg_namespace n on n.oid = defaults.defaclnamespace
    cross join lateral aclexplode(defaults.defaclacl) privilege
    where n.nspname = 'public'
      and defaults.defaclrole = 'postgres'::regrole
      and defaults.defaclobjtype = 'f'
      and privilege.privilege_type = 'EXECUTE'
      and privilege.grantee in (0, 'anon'::regrole, 'authenticated'::regrole)
  ),
  'future public functions are not executable by API roles unless explicitly granted'
);
select ok(
  not exists (
    select 1
    from pg_default_acl defaults
    join pg_namespace n on n.oid = defaults.defaclnamespace
    cross join lateral aclexplode(defaults.defaclacl) privilege
    where n.nspname = 'public'
      and defaults.defaclrole = 'postgres'::regrole
      and defaults.defaclobjtype in ('r', 'S')
      and privilege.grantee in (0, 'anon'::regrole, 'authenticated'::regrole)
  ),
  'future public tables and sequences require explicit API-role grants'
);

-- Execute the public learner boundary with fully synthetic rows. The outer
-- transaction rolls everything back, so these fixtures never persist locally
-- or resemble production identities.
insert into public.quizzes (
  id, title, category_ids, passing_score, is_practice, is_nationwide
) values (
  '00000000-0000-4000-8000-000000000201',
  'pgTAP authoritative assessment fixture',
  '[]'::jsonb,
  0.8,
  false,
  true
);

insert into public.questions (
  id, question_text, question_type, options, correct_answer, is_nationwide
) values (
  '00000000-0000-4000-8000-000000000202',
  'Which fixture answer is correct?',
  'multiple_choice',
  '["A", "B"]'::jsonb,
  '"A"'::jsonb,
  true
);

insert into public.quiz_questions (quiz_id, question_id, order_index)
values (
  '00000000-0000-4000-8000-000000000201',
  '00000000-0000-4000-8000-000000000202',
  0
);

insert into public.access_codes (
  id, quiz_id, code, code_hash, ldap, email, supervisor, market,
  is_used, attempt_count, max_attempts
) values (
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000201',
  null,
  extensions.digest('BEHAVE01', 'sha256'),
  'local-pgtap-fixture',
  'fixture@example.invalid',
  'Local Fixture Supervisor',
  'Local Fixture Market',
  false,
  0,
  1
);

create temporary table assessment_test_state (
  first_submission jsonb not null
) on commit drop;

select ok(
  public.load_quiz_for_learner(
    '00000000-0000-4000-8000-000000000201', 'BEHAVE01'
  ) #>> '{questions,0,correct_answer}' is null,
  'official learner payloads do not expose correct answers at runtime'
);
select is(
  public.load_quiz_for_learner(
    '00000000-0000-4000-8000-000000000201', 'BEHAVE01'
  ) ->> 'id',
  '00000000-0000-4000-8000-000000000201',
  'official learner payloads resolve the quiz bound to the access code'
);

insert into assessment_test_state (first_submission)
select public.submit_quiz_attempt(
  'BEHAVE01',
  '{"00000000-0000-4000-8000-000000000202": "A"}'::jsonb,
  '00000000-0000-4000-8000-000000000204',
  12,
  '{}'::jsonb
);

select is(
  (select (first_submission ->> 'score')::numeric from assessment_test_state),
  100::numeric,
  'authoritative submission grades the synthetic correct answer on the server'
);
select is(
  (select (first_submission ->> 'idempotent_replay')::boolean from assessment_test_state),
  false,
  'the initial authoritative submission is not marked as a replay'
);
select is(
  (select count(*)::integer from public.quiz_results
   where idempotency_key = '00000000-0000-4000-8000-000000000204'),
  1,
  'authoritative submission creates exactly one result'
);
select ok((
  select result.score_value = 1
    and result.grading_version = 'server-v1'
    and result.graded_at is not null
  from public.quiz_results result
  where result.idempotency_key = '00000000-0000-4000-8000-000000000204'
), 'the committed result contains server-authored grading evidence');
select ok((
  select code.is_used
    and code.attempt_count = 1
    and code.code is null
  from public.access_codes code
  where code.id = '00000000-0000-4000-8000-000000000203'
), 'result creation and hash-only access-code consumption commit together');
select ok((
  with replay as (
    select public.submit_quiz_attempt(
      'BEHAVE01',
      '{"00000000-0000-4000-8000-000000000202": "A"}'::jsonb,
      '00000000-0000-4000-8000-000000000204',
      12,
      '{}'::jsonb
    ) as payload
  )
  select (replay.payload ->> 'idempotent_replay')::boolean
    and replay.payload ->> 'result_id' =
      (select first_submission ->> 'result_id' from assessment_test_state)
    and (
      select count(*)
      from public.quiz_results
      where idempotency_key = '00000000-0000-4000-8000-000000000204'
    ) = 1
  from replay
), 'idempotent replay returns the original result without creating a duplicate');

update public.quizzes
set has_practice_mode = true
where id = '00000000-0000-4000-8000-000000000201';

select ok(
  public.load_quiz_for_learner(
    '00000000-0000-4000-8000-000000000201', null
  ) #>> '{questions,0,correct_answer}' is null,
  'practice learner payloads do not expose correct answers before submission'
);
select is(
  jsonb_object_length(
    public.grade_practice_attempt(
      '00000000-0000-4000-8000-000000000201',
      '{"00000000-0000-4000-8000-000000000202": "A"}'::jsonb
    ) -> 'feedback'
  ),
  1,
  'practice grading returns feedback only for the submitted question'
);
select ok((
  with graded as (
    select public.grade_practice_attempt(
      '00000000-0000-4000-8000-000000000201',
      '{"00000000-0000-4000-8000-000000000202": "A"}'::jsonb
    ) as payload
  )
  select (payload #>> '{feedback,00000000-0000-4000-8000-000000000202,is_correct}')::boolean
    and payload #>> '{feedback,00000000-0000-4000-8000-000000000202,correct_answer}' = 'A'
  from graded
), 'practice grading returns authoritative correctness and answer feedback after submission');
select is(
  jsonb_object_length(
    public.grade_practice_attempt(
      '00000000-0000-4000-8000-000000000201',
      '{}'::jsonb
    ) -> 'feedback'
  ),
  0,
  'practice grading does not disclose unsubmitted question answers'
);

select * from finish();
rollback;
