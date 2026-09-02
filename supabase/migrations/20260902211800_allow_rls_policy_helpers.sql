-- RLS policies execute with the caller's privileges. These helpers are stored
-- in the non-exposed private schema, but authenticated callers still need
-- EXECUTE on the functions for PostgreSQL to evaluate the saved policy
-- expressions. USAGE on private remains revoked, so clients cannot invoke the
-- helpers directly through SQL or PostgREST.

revoke all on function private.can_manage_training(integer, uuid)
from public, anon, authenticated;
revoke all on function private.can_manage_assessments(uuid)
from public, anon, authenticated;
revoke all on function private.is_supervisor_managed_user(uuid, uuid)
from public, anon, authenticated;

grant execute on function private.can_manage_training(integer, uuid)
to authenticated;
grant execute on function private.can_manage_assessments(uuid)
to authenticated;
grant execute on function private.is_supervisor_managed_user(uuid, uuid)
to authenticated;

comment on function private.can_manage_training(integer, uuid) is
  'Private RLS policy helper. Authenticated has EXECUTE only so saved policies can evaluate it; private schema USAGE remains revoked.';
comment on function private.can_manage_assessments(uuid) is
  'Private RLS policy helper. Authenticated has EXECUTE only so saved policies can evaluate it; private schema USAGE remains revoked.';
comment on function private.is_supervisor_managed_user(uuid, uuid) is
  'Private RLS policy helper. Authenticated has EXECUTE only so saved policies can evaluate it; private schema USAGE remains revoked.';
