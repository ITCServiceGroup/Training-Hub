begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(40);

select ok(
  has_function_privilege(
    'authenticated',
    'private.can_manage_training(integer,uuid)',
    'execute'
  ),
  'authenticated sessions can evaluate training RLS policies'
);
select ok(
  has_function_privilege(
    'authenticated',
    'private.can_manage_assessments(uuid)',
    'execute'
  ),
  'authenticated sessions can evaluate assessment RLS policies'
);
select ok(
  has_function_privilege(
    'authenticated',
    'private.is_supervisor_managed_user(uuid,uuid)',
    'execute'
  ),
  'authenticated sessions can evaluate supervisor-tree RLS policies'
);
select ok(
  not has_function_privilege(
    'anon',
    'private.can_manage_training(integer,uuid)',
    'execute'
  ),
  'anonymous sessions cannot execute the private training helper'
);
select ok(
  not has_function_privilege(
    'anon',
    'private.can_manage_assessments(uuid)',
    'execute'
  ),
  'anonymous sessions cannot execute the private assessment helper'
);
select ok(
  not has_function_privilege(
    'anon',
    'private.is_supervisor_managed_user(uuid,uuid)',
    'execute'
  ),
  'anonymous sessions cannot execute the private hierarchy helper'
);
select ok(
  not has_schema_privilege('authenticated', 'private', 'usage'),
  'authenticated sessions cannot address functions in the private schema directly'
);

-- Synthetic identities and records are transaction-scoped and always rolled
-- back. The hierarchy spans two markets and includes a peer supervisor tree.
insert into public.markets (name)
values ('RBAC Market A'), ('RBAC Market B');

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
)
select
  '00000000-0000-0000-0000-000000000000'::uuid,
  fixture.id,
  'authenticated',
  'authenticated',
  fixture.email,
  '',
  now(),
  '{}'::jsonb,
  '{}'::jsonb,
  now(),
  now()
from (values
  ('00000000-0000-4000-8000-000000000401'::uuid, 'rbac-admin@example.invalid'),
  ('00000000-0000-4000-8000-000000000402'::uuid, 'rbac-aom-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000403'::uuid, 'rbac-supervisor-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000404'::uuid, 'rbac-lead-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000405'::uuid, 'rbac-indirect-tech-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000406'::uuid, 'rbac-direct-tech-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000407'::uuid, 'rbac-peer-supervisor-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000408'::uuid, 'rbac-peer-tech-a@example.invalid'),
  ('00000000-0000-4000-8000-000000000409'::uuid, 'rbac-aom-b@example.invalid'),
  ('00000000-0000-4000-8000-000000000410'::uuid, 'rbac-supervisor-b@example.invalid'),
  ('00000000-0000-4000-8000-000000000411'::uuid, 'rbac-tech-b@example.invalid'),
  ('00000000-0000-4000-8000-000000000412'::uuid, 'rbac-inactive-aom@example.invalid')
) as fixture(id, email);

insert into public.user_profiles (
  user_id, role, market_id, reports_to_user_id,
  display_name, email, is_active
)
values
  (
    '00000000-0000-4000-8000-000000000401', 'super_admin', null, null,
    'RBAC Admin', 'rbac-admin@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000402', 'aom',
    (select id from public.markets where name = 'RBAC Market A'), null,
    'RBAC AOM A', 'rbac-aom-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000403', 'supervisor',
    (select id from public.markets where name = 'RBAC Market A'),
    '00000000-0000-4000-8000-000000000402',
    'RBAC Supervisor A', 'rbac-supervisor-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000404', 'lead_tech',
    (select id from public.markets where name = 'RBAC Market A'),
    '00000000-0000-4000-8000-000000000403',
    'RBAC Lead A', 'rbac-lead-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000405', 'technician',
    (select id from public.markets where name = 'RBAC Market A'),
    '00000000-0000-4000-8000-000000000404',
    'RBAC Indirect Tech A', 'rbac-indirect-tech-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000406', 'technician',
    (select id from public.markets where name = 'RBAC Market A'),
    '00000000-0000-4000-8000-000000000403',
    'RBAC Direct Tech A', 'rbac-direct-tech-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000407', 'supervisor',
    (select id from public.markets where name = 'RBAC Market A'),
    '00000000-0000-4000-8000-000000000402',
    'RBAC Peer Supervisor A', 'rbac-peer-supervisor-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000408', 'technician',
    (select id from public.markets where name = 'RBAC Market A'),
    '00000000-0000-4000-8000-000000000407',
    'RBAC Peer Tech A', 'rbac-peer-tech-a@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000409', 'aom',
    (select id from public.markets where name = 'RBAC Market B'), null,
    'RBAC AOM B', 'rbac-aom-b@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000410', 'supervisor',
    (select id from public.markets where name = 'RBAC Market B'),
    '00000000-0000-4000-8000-000000000409',
    'RBAC Supervisor B', 'rbac-supervisor-b@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000411', 'technician',
    (select id from public.markets where name = 'RBAC Market B'),
    '00000000-0000-4000-8000-000000000410',
    'RBAC Tech B', 'rbac-tech-b@example.invalid', true
  ),
  (
    '00000000-0000-4000-8000-000000000412', 'aom',
    (select id from public.markets where name = 'RBAC Market A'), null,
    'RBAC Inactive AOM', 'rbac-inactive-aom@example.invalid', false
  );

insert into public.user_preferences (user_id, preferences)
values
  ('00000000-0000-4000-8000-000000000405', '{"theme":"dark"}'::jsonb),
  ('00000000-0000-4000-8000-000000000408', '{"theme":"light"}'::jsonb);

insert into public.quiz_results (
  ldap, quiz_type, score_text, score_value, supervisor, market,
  learner_user_id
)
values
  (
    'rbac-direct-tech-a', 'RBAC Fixture', '100%', 1,
    'RBAC Supervisor A', 'RBAC Market A',
    '00000000-0000-4000-8000-000000000406'
  ),
  (
    'rbac-indirect-tech-a', 'RBAC Fixture', '100%', 1,
    'RBAC Supervisor A', 'RBAC Market A',
    '00000000-0000-4000-8000-000000000405'
  ),
  (
    'rbac-peer-tech-a', 'RBAC Fixture', '100%', 1,
    'RBAC Peer Supervisor A', 'RBAC Market A',
    '00000000-0000-4000-8000-000000000408'
  ),
  (
    'rbac-tech-b', 'RBAC Fixture', '100%', 1,
    'RBAC Supervisor B', 'RBAC Market B',
    '00000000-0000-4000-8000-000000000411'
  );

insert into public.training_assignments (
  id, title, content_type, content_id, market_id, created_by
)
values (
  '00000000-0000-4000-8000-000000000420',
  'RBAC assignment',
  'quiz',
  '00000000-0000-4000-8000-000000000421',
  (select id from public.markets where name = 'RBAC Market A'),
  '00000000-0000-4000-8000-000000000401'
);

insert into public.enrollments (assignment_id, user_id)
values
  ('00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000406'),
  ('00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000405'),
  ('00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000408'),
  ('00000000-0000-4000-8000-000000000420', '00000000-0000-4000-8000-000000000411');

-- Supervisor A: self plus the direct lead, direct technician, and the
-- lead-mediated technician. The peer supervisor tree and market B stay hidden.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000403","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select is(
  (select count(*)::bigint from public.user_profiles),
  4::bigint,
  'a supervisor sees only self and their reporting tree'
);
select ok(
  exists (
    select 1 from public.user_profiles
    where user_id = '00000000-0000-4000-8000-000000000405'
  ),
  'a supervisor sees a technician through their lead technician'
);
select ok(
  not exists (
    select 1 from public.user_profiles
    where user_id = '00000000-0000-4000-8000-000000000408'
  ),
  'a supervisor cannot see a peer supervisor team'
);
select is(
  (select count(*)::bigint from public.quiz_results),
  2::bigint,
  'a supervisor sees results only for direct and lead-mediated reports'
);
select is(
  (select count(*)::bigint from public.enrollments),
  2::bigint,
  'a supervisor sees enrollments only for direct and lead-mediated reports'
);
select ok(
  public.can_manage_user('00000000-0000-4000-8000-000000000406'),
  'a supervisor can manage a direct technician'
);
select ok(
  public.can_manage_user('00000000-0000-4000-8000-000000000405'),
  'a supervisor can manage a lead-mediated technician'
);
select ok(
  not public.can_manage_user('00000000-0000-4000-8000-000000000408'),
  'a supervisor cannot manage a peer supervisor technician'
);
select ok(
  not public.can_manage_user('00000000-0000-4000-8000-000000000411'),
  'a supervisor cannot manage a technician in another market'
);
select ok(
  public.can_create_content(),
  'an active supervisor retains content-authoring capability'
);
select lives_ok(
  $$
    select public.update_managed_user_profile(
      '00000000-0000-4000-8000-000000000406',
      'RBAC Direct Tech A Updated',
      'technician',
      (select id from public.markets where name = 'RBAC Market A'),
      '00000000-0000-4000-8000-000000000403',
      true
    )
  $$,
  'a supervisor can update a direct report through the audited API'
);
reset role;
select is(
  (
    select display_name from public.user_profiles
    where user_id = '00000000-0000-4000-8000-000000000406'
  ),
  'RBAC Direct Tech A Updated',
  'the authorized managed-profile update persists inside the transaction'
);
select ok(
  exists (
    select 1 from public.security_audit_log
    where actor_user_id = '00000000-0000-4000-8000-000000000403'
      and action = 'user_profile.updated'
      and target_id = '00000000-0000-4000-8000-000000000406'
  ),
  'the authorized profile update writes an audit event'
);

-- AOM A: all regional identities and evidence are visible, but market B is not.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000402","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select is(
  (select count(*)::bigint from public.user_profiles),
  8::bigint,
  'an AOM sees every profile in their market, including inactive profiles'
);
select ok(
  not exists (
    select 1 from public.user_profiles
    where user_id = '00000000-0000-4000-8000-000000000411'
  ),
  'an AOM cannot see another market profile'
);
select is(
  (select count(*)::bigint from public.quiz_results),
  3::bigint,
  'an AOM sees quiz results only in their market'
);
select is(
  (select count(*)::bigint from public.enrollments),
  3::bigint,
  'an AOM sees enrollments only in their market'
);
select ok(
  public.can_manage_user('00000000-0000-4000-8000-000000000408'),
  'an AOM can manage a regional peer-team technician'
);
select ok(
  not public.can_manage_user('00000000-0000-4000-8000-000000000411'),
  'an AOM cannot manage another market technician'
);
select throws_ok(
  $$
    select public.update_managed_user_profile(
      '00000000-0000-4000-8000-000000000411',
      'RBAC Tech B Changed',
      'technician',
      (select id from public.markets where name = 'RBAC Market B'),
      '00000000-0000-4000-8000-000000000410',
      true
    )
  $$,
  '42501',
  'Not authorized',
  'an AOM cannot update a profile in another market'
);
reset role;

-- AOM B proves the inverse market boundary on official results.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000409","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select is(
  (select count(*)::bigint from public.quiz_results),
  1::bigint,
  'the second-market AOM sees only the second-market result'
);
reset role;

-- Ordinary learner: only their own profile, preferences, and enrollment are
-- visible, and no management or authoring capability is inherited.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000405","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select is(
  (select count(*)::bigint from public.user_profiles),
  1::bigint,
  'a technician sees only their own authorization-bearing profile'
);
select is(
  (select count(*)::bigint from public.enrollments),
  1::bigint,
  'a technician sees only their own enrollment'
);
select is(
  (select count(*)::bigint from public.user_preferences),
  1::bigint,
  'a technician sees only their own preferences row'
);
select ok(
  not exists (
    select 1 from public.user_preferences
    where user_id = '00000000-0000-4000-8000-000000000408'
  ),
  'a technician cannot read another user preferences'
);
select ok(
  not public.can_manage_user('00000000-0000-4000-8000-000000000406'),
  'a technician cannot manage another user'
);
select ok(
  not public.can_create_content(),
  'a technician cannot create managed content'
);
select throws_ok(
  $$
    select public.update_managed_user_profile(
      '00000000-0000-4000-8000-000000000408',
      'RBAC Peer Tech Changed',
      'technician',
      (select id from public.markets where name = 'RBAC Market A'),
      '00000000-0000-4000-8000-000000000407',
      true
    )
  $$,
  '42501',
  'Not authorized',
  'a technician cannot update another profile through the managed API'
);
reset role;

-- An inactive privileged profile may read itself for account-state display,
-- but all privileged evidence access and actions are removed.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000000412","role":"authenticated","aal":"aal1"}',
  true
);
set local role authenticated;
select is(
  (select count(*)::bigint from public.user_profiles),
  1::bigint,
  'an inactive privileged user can read only their own profile'
);
select is(
  (select count(*)::bigint from public.quiz_results),
  0::bigint,
  'an inactive privileged user cannot read quiz results'
);
select is(
  (select count(*)::bigint from public.enrollments),
  0::bigint,
  'an inactive privileged user cannot read managed enrollments'
);
select ok(
  not public.can_manage_user('00000000-0000-4000-8000-000000000406'),
  'an inactive privileged user cannot manage a regional user'
);
select ok(
  not public.can_create_content(),
  'an inactive privileged user cannot create content'
);
reset role;

select * from finish();
rollback;
