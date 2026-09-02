-- Training Hub Phase 0 read-only catalog inventory
--
-- Purpose:
--   Capture schema, grants, RLS, privileged functions, triggers, views,
--   Storage bucket configuration, and migration history without selecting
--   application rows or personally identifiable data.
--
-- Safety:
--   This script contains SELECT statements only. Run it using an authorized
--   project owner/read-only catalog session in the Supabase SQL editor or an
--   equivalent trusted database connection. Review all output before sharing.
--
-- Tracking:
--   IMPLEMENTATION_PLAN.md Phase 0 / TH-001

-- ---------------------------------------------------------------------------
-- 01. Server and Data API context
-- ---------------------------------------------------------------------------

select
  current_database() as database_name,
  current_user as executing_role,
  current_setting('server_version') as postgres_version,
  current_setting('pgrst.db_schemas', true) as postgrest_exposed_schemas,
  current_setting('pgrst.db_anon_role', true) as postgrest_anon_role;

-- ---------------------------------------------------------------------------
-- 02. Schemas and owners
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  pg_get_userbyid(n.nspowner) as owner
from pg_catalog.pg_namespace as n
where n.nspname not like 'pg\_%' escape '\'
  and n.nspname <> 'information_schema'
order by n.nspname;

-- ---------------------------------------------------------------------------
-- 03. Tables, owners, and RLS state
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  c.relname as table_name,
  pg_get_userbyid(c.relowner) as owner,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced,
  c.relpersistence as persistence
from pg_catalog.pg_class as c
join pg_catalog.pg_namespace as n
  on n.oid = c.relnamespace
where c.relkind in ('r', 'p')
  and n.nspname in ('public', 'storage')
order by n.nspname, c.relname;

-- ---------------------------------------------------------------------------
-- 04. Columns and defaults (metadata only)
-- ---------------------------------------------------------------------------

select
  cols.table_schema,
  cols.table_name,
  cols.ordinal_position,
  cols.column_name,
  cols.data_type,
  cols.udt_schema,
  cols.udt_name,
  cols.is_nullable,
  cols.column_default,
  cols.is_identity,
  cols.identity_generation
from information_schema.columns as cols
where cols.table_schema in ('public', 'storage')
order by cols.table_schema, cols.table_name, cols.ordinal_position;

-- ---------------------------------------------------------------------------
-- 05. Constraints
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  c.relname as table_name,
  con.conname as constraint_name,
  con.contype as constraint_type,
  pg_get_constraintdef(con.oid, true) as definition
from pg_catalog.pg_constraint as con
join pg_catalog.pg_class as c
  on c.oid = con.conrelid
join pg_catalog.pg_namespace as n
  on n.oid = c.relnamespace
where n.nspname in ('public', 'storage')
order by n.nspname, c.relname, con.conname;

-- ---------------------------------------------------------------------------
-- 06. Indexes
-- ---------------------------------------------------------------------------

select
  schemaname as schema_name,
  tablename as table_name,
  indexname as index_name,
  indexdef as definition
from pg_catalog.pg_indexes
where schemaname in ('public', 'storage')
order by schemaname, tablename, indexname;

-- ---------------------------------------------------------------------------
-- 07. RLS policies
-- ---------------------------------------------------------------------------

select
  schemaname as schema_name,
  tablename as table_name,
  policyname as policy_name,
  permissive,
  roles,
  cmd as command,
  qual as using_expression,
  with_check as with_check_expression
from pg_catalog.pg_policies
where schemaname in ('public', 'storage')
order by schemaname, tablename, command, policyname;

-- ---------------------------------------------------------------------------
-- 08. Table grants for API and operational roles
-- ---------------------------------------------------------------------------

select
  grantor,
  grantee,
  table_schema,
  table_name,
  privilege_type,
  is_grantable
from information_schema.role_table_grants
where table_schema in ('public', 'storage')
  and grantee in (
    'PUBLIC',
    'anon',
    'authenticated',
    'service_role',
    'supabase_auth_admin',
    'supabase_storage_admin'
  )
order by table_schema, table_name, grantee, privilege_type;

-- ---------------------------------------------------------------------------
-- 09. Column grants
-- ---------------------------------------------------------------------------

select
  grantor,
  grantee,
  table_schema,
  table_name,
  column_name,
  privilege_type,
  is_grantable
from information_schema.column_privileges
where table_schema in ('public', 'storage')
  and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
order by table_schema, table_name, column_name, grantee, privilege_type;

-- ---------------------------------------------------------------------------
-- 10. Sequence grants
-- ---------------------------------------------------------------------------

select
  grantor,
  grantee,
  object_schema as sequence_schema,
  object_name as sequence_name,
  privilege_type,
  is_grantable
from information_schema.usage_privileges
where object_type = 'SEQUENCE'
  and object_schema = 'public'
  and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
order by object_name, grantee, privilege_type;

-- ---------------------------------------------------------------------------
-- 11. Functions, security mode, configuration, and ACL
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as identity_arguments,
  pg_get_function_result(p.oid) as result_type,
  l.lanname as language,
  pg_get_userbyid(p.proowner) as owner,
  p.prosecdef as security_definer,
  p.proleakproof as leakproof,
  p.provolatile as volatility,
  p.proconfig as runtime_configuration,
  p.proacl as access_control_list
from pg_catalog.pg_proc as p
join pg_catalog.pg_namespace as n
  on n.oid = p.pronamespace
join pg_catalog.pg_language as l
  on l.oid = p.prolang
where n.nspname in ('public', 'storage')
order by n.nspname, p.proname, identity_arguments;

-- ---------------------------------------------------------------------------
-- 12. Explicit routine grants
-- ---------------------------------------------------------------------------

select
  grantor,
  grantee,
  specific_schema,
  routine_name,
  privilege_type,
  is_grantable
from information_schema.routine_privileges
where specific_schema in ('public', 'storage')
  and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
order by specific_schema, routine_name, grantee, privilege_type;

-- ---------------------------------------------------------------------------
-- 13. Triggers
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  c.relname as table_name,
  t.tgname as trigger_name,
  t.tgenabled as enabled_state,
  pg_get_triggerdef(t.oid, true) as definition
from pg_catalog.pg_trigger as t
join pg_catalog.pg_class as c
  on c.oid = t.tgrelid
join pg_catalog.pg_namespace as n
  on n.oid = c.relnamespace
where not t.tgisinternal
  and n.nspname in ('public', 'storage', 'auth')
order by n.nspname, c.relname, t.tgname;

-- ---------------------------------------------------------------------------
-- 14. Views and materialized views
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  c.relname as view_name,
  case c.relkind
    when 'v' then 'view'
    when 'm' then 'materialized_view'
  end as view_type,
  pg_get_userbyid(c.relowner) as owner,
  c.reloptions,
  pg_get_viewdef(c.oid, true) as definition
from pg_catalog.pg_class as c
join pg_catalog.pg_namespace as n
  on n.oid = c.relnamespace
where c.relkind in ('v', 'm')
  and n.nspname in ('public', 'storage')
order by n.nspname, c.relname;

-- ---------------------------------------------------------------------------
-- 15. Enum values and ordering
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  t.typname as enum_name,
  e.enumsortorder,
  e.enumlabel
from pg_catalog.pg_type as t
join pg_catalog.pg_enum as e
  on e.enumtypid = t.oid
join pg_catalog.pg_namespace as n
  on n.oid = t.typnamespace
where n.nspname = 'public'
order by n.nspname, t.typname, e.enumsortorder;

-- ---------------------------------------------------------------------------
-- 16. Default privileges
-- ---------------------------------------------------------------------------

select
  pg_get_userbyid(d.defaclrole) as owner,
  n.nspname as schema_name,
  d.defaclobjtype as object_type,
  d.defaclacl as access_control_list
from pg_catalog.pg_default_acl as d
left join pg_catalog.pg_namespace as n
  on n.oid = d.defaclnamespace
order by owner, schema_name nulls first, object_type;

-- ---------------------------------------------------------------------------
-- 17. Storage bucket metadata (no object names or application files)
-- ---------------------------------------------------------------------------

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  avif_autodetection
from storage.buckets
order by id;

-- ---------------------------------------------------------------------------
-- 18. Supabase migration ledger
-- ---------------------------------------------------------------------------

select
  version,
  name
from supabase_migrations.schema_migrations
order by version;

-- ---------------------------------------------------------------------------
-- 19. Catalog objects whose names are especially security-sensitive
-- ---------------------------------------------------------------------------

select
  n.nspname as schema_name,
  c.relname as object_name,
  c.relkind as object_kind,
  pg_get_userbyid(c.relowner) as owner
from pg_catalog.pg_class as c
join pg_catalog.pg_namespace as n
  on n.oid = c.relnamespace
where n.nspname in ('public', 'storage')
  and c.relname in (
    'access_codes',
    'questions',
    'quiz_results',
    'user_profiles',
    'content_approval_requests',
    'objects',
    'buckets'
  )
order by n.nspname, c.relname;
