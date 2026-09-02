-- The production baseline includes this one-time legacy maintenance helper.
-- Qualify every relation and use the named primary-key constraint so its
-- table-return output parameter does not conflict with user_id column names.

create or replace function public.migrate_existing_users_to_simple_dashboards()
returns table (
  user_id uuid,
  dashboards_created integer,
  success boolean
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  user_record record;
  template_record record;
  dashboards_count integer;
begin
  for user_record in
    select distinct auth_user.id as uid
    from auth.users auth_user
    left join public.user_dashboards dashboard
      on auth_user.id = dashboard.user_id
     and dashboard.is_template = false
    where dashboard.user_id is null
  loop
    dashboards_count := 0;

    for template_record in
      select *
      from public.user_dashboards dashboard_template
      where dashboard_template.is_template = true
    loop
      insert into public.user_dashboards (
        user_id, name, description, tiles, filters, layout, is_template
      ) values (
        user_record.uid,
        template_record.name,
        template_record.description,
        template_record.tiles,
        template_record.filters,
        template_record.layout,
        false
      );
      dashboards_count := dashboards_count + 1;
    end loop;

    insert into public.user_initialization (
      user_id, dashboard_templates_copied
    ) values (
      user_record.uid, true
    )
    on conflict on constraint user_initialization_pkey do update
    set dashboard_templates_copied = true,
        updated_at = now();

    return query select user_record.uid, dashboards_count, true;
  end loop;

  return;
end
$$;

revoke all on function public.migrate_existing_users_to_simple_dashboards()
from public, anon, authenticated;
