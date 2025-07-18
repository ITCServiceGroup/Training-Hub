-- Fix RLS policies for dashboard_layouts table to work with Supabase auth

-- Drop existing policies
DROP POLICY IF EXISTS dashboard_layouts_user_isolation ON dashboard_layouts;
DROP POLICY IF EXISTS dashboard_layouts_user_insert ON dashboard_layouts;
DROP POLICY IF EXISTS dashboard_layouts_user_update ON dashboard_layouts;
DROP POLICY IF EXISTS dashboard_layouts_user_delete ON dashboard_layouts;

-- Create new policies using auth.uid()
CREATE POLICY dashboard_layouts_user_isolation ON dashboard_layouts
  FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY dashboard_layouts_user_insert ON dashboard_layouts
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

CREATE POLICY dashboard_layouts_user_update ON dashboard_layouts
  FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY dashboard_layouts_user_delete ON dashboard_layouts
  FOR DELETE USING (user_id = auth.uid()::text);

-- Ensure RLS is enabled
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_layouts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
