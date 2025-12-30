-- =====================================================================
-- Migration 27: Fix Function Search Path Security Issues
-- =====================================================================
-- Description: Add explicit search_path to all SECURITY DEFINER functions
--              to prevent schema injection attacks
-- Author: Training Hub Security Fix
-- Date: 2025-12-30
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- =====================================================================

-- =====================================================================
-- PART 1: FIX RBAC HELPER FUNCTIONS (from migration 21)
-- =====================================================================

-- Get current user's profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS user_profiles AS $$
  SELECT * FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION get_user_profile() IS 'Returns the full user profile for the currently authenticated user';

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION get_user_role() IS 'Returns the role of the currently authenticated user';

-- Get current user's market_id
CREATE OR REPLACE FUNCTION get_user_market_id()
RETURNS INTEGER AS $$
  SELECT market_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION get_user_market_id() IS 'Returns the market_id of the currently authenticated user';

-- Check if current user is an admin (Super Admin or Admin)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION is_admin() IS 'Returns TRUE if the current user is a Super Admin or Admin';

-- Check if current user is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION is_super_admin() IS 'Returns TRUE if the current user is a Super Admin';

-- Check if user can VIEW content based on visibility rules
CREATE OR REPLACE FUNCTION can_view_content(
  content_market_id INTEGER,
  content_is_nationwide BOOLEAN
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
  v_market INTEGER;
BEGIN
  -- Get user's role and market
  SELECT role, market_id INTO v_role, v_market
  FROM user_profiles WHERE user_id = auth.uid();

  -- No profile = no access (except for public content handling elsewhere)
  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super Admin and Admin can view everything
  IF v_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- Everyone can view nationwide content
  IF content_is_nationwide = TRUE THEN
    RETURN TRUE;
  END IF;

  -- Regional users can view content from their market
  IF content_market_id = v_market THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION can_view_content(INTEGER, BOOLEAN) IS 'Checks if the current user can view content based on market and nationwide visibility';

-- Check if user can EDIT content
CREATE OR REPLACE FUNCTION can_edit_content(
  content_created_by UUID,
  content_market_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role;
  v_market INTEGER;
BEGIN
  SELECT role, market_id INTO v_role, v_market
  FROM user_profiles WHERE user_id = auth.uid();

  IF v_role IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Super Admin and Admin can edit everything
  IF v_role IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- AOM and Supervisor can edit content in their market
  IF v_role IN ('aom', 'supervisor') AND content_market_id = v_market THEN
    RETURN TRUE;
  END IF;

  -- Lead Tech can only edit their own content
  IF v_role = 'lead_tech' AND content_created_by = auth.uid() THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION can_edit_content(UUID, INTEGER) IS 'Checks if the current user can edit content based on ownership and market';

-- Check if user can CREATE content (and determine visibility)
CREATE OR REPLACE FUNCTION can_create_content()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin', 'aom', 'supervisor', 'lead_tech')
    AND is_active = TRUE
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION can_create_content() IS 'Checks if the current user can create new content';

-- Check if user can manage another user
CREATE OR REPLACE FUNCTION can_manage_user(target_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_my_role user_role;
  v_my_market INTEGER;
  v_target_role user_role;
  v_target_market INTEGER;
BEGIN
  -- Get my profile
  SELECT role, market_id INTO v_my_role, v_my_market
  FROM user_profiles WHERE user_id = auth.uid();

  -- Get target profile
  SELECT role, market_id INTO v_target_role, v_target_market
  FROM user_profiles WHERE user_id = target_user_id;

  -- Super Admin can manage everyone except themselves
  IF v_my_role = 'super_admin' AND target_user_id != auth.uid() THEN
    RETURN TRUE;
  END IF;

  -- Admin can manage non-super users
  IF v_my_role = 'admin' AND v_target_role NOT IN ('super_admin', 'admin') THEN
    RETURN TRUE;
  END IF;

  -- AOM can manage Supervisors and Lead Techs in their market
  IF v_my_role = 'aom'
     AND v_target_role IN ('supervisor', 'lead_tech', 'technician')
     AND v_target_market = v_my_market THEN
    RETURN TRUE;
  END IF;

  -- Supervisor can manage Lead Techs and Technicians in their market
  IF v_my_role = 'supervisor'
     AND v_target_role IN ('lead_tech', 'technician')
     AND v_target_market = v_my_market THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE
SET search_path = public, auth;

COMMENT ON FUNCTION can_manage_user(UUID) IS 'Checks if the current user can manage (view/edit) another user based on role hierarchy and market';

-- =====================================================================
-- PART 2: FIX TRIGGER FUNCTIONS (from migration 09)
-- =====================================================================

-- Function: Update updated_at column timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Ensure single default dashboard per user
CREATE OR REPLACE FUNCTION ensure_single_default_dashboard()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a dashboard as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE user_dashboards
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Ensure single default configuration (legacy support)
CREATE OR REPLACE FUNCTION ensure_single_default_configuration()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a configuration as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE dashboard_configurations
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Ensure single default layout (legacy support)
CREATE OR REPLACE FUNCTION ensure_single_default_layout()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting a layout as default, unset all other defaults for this user
    IF NEW.is_default = true THEN
        UPDATE dashboard_layouts
        SET is_default = false
        WHERE user_id = NEW.user_id
          AND id != NEW.id
          AND is_default = true;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Set timestamp trigger function (alias for compatibility)
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Update dashboard configurations updated_at (legacy support)
CREATE OR REPLACE FUNCTION update_dashboard_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Update dashboard layouts updated_at (legacy support)
CREATE OR REPLACE FUNCTION update_dashboard_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Function: Migrate existing users to simple dashboards
CREATE OR REPLACE FUNCTION migrate_existing_users_to_simple_dashboards()
RETURNS TABLE(user_id UUID, dashboards_created INTEGER, success BOOLEAN) AS $$
DECLARE
    user_record RECORD;
    template_record RECORD;
    dashboards_count INTEGER;
BEGIN
    -- Loop through all users who don't have dashboards yet
    FOR user_record IN
        SELECT DISTINCT u.id as uid
        FROM auth.users u
        LEFT JOIN user_dashboards ud ON u.id = ud.user_id AND ud.is_template = false
        WHERE ud.user_id IS NULL
    LOOP
        dashboards_count := 0;

        -- Copy each template to this user
        FOR template_record IN
            SELECT * FROM user_dashboards WHERE is_template = true
        LOOP
            INSERT INTO user_dashboards (
                user_id, name, description, tiles, filters, layout, is_template
            ) VALUES (
                user_record.uid,
                template_record.name,
                template_record.description,
                template_record.tiles,
                template_record.filters,
                template_record.layout,
                false
            );
            dashboards_count := dashboards_count + 1;
        END LOOP;

        -- Mark user as initialized
        INSERT INTO user_initialization (user_id, dashboard_templates_copied)
        VALUES (user_record.uid, true)
        ON CONFLICT (user_id) DO UPDATE SET
            dashboard_templates_copied = true,
            updated_at = NOW();

        -- Return result for this user
        RETURN QUERY SELECT user_record.uid, dashboards_count, true;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql
SET search_path = public, auth;

-- =====================================================================
-- VERIFICATION COMMENTS
-- =====================================================================

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to update updated_at timestamp - SECURITY: search_path set';
COMMENT ON FUNCTION ensure_single_default_dashboard() IS 'Ensures only one default dashboard per user - SECURITY: search_path set';
COMMENT ON FUNCTION ensure_single_default_configuration() IS 'Legacy: Ensures only one default configuration per user - SECURITY: search_path set';
COMMENT ON FUNCTION ensure_single_default_layout() IS 'Legacy: Ensures only one default layout per user - SECURITY: search_path set';
COMMENT ON FUNCTION trigger_set_timestamp() IS 'Alias for update_updated_at_column - SECURITY: search_path set';
COMMENT ON FUNCTION update_dashboard_configurations_updated_at() IS 'Legacy: Update dashboard configurations timestamp - SECURITY: search_path set';
COMMENT ON FUNCTION update_dashboard_layouts_updated_at() IS 'Legacy: Update dashboard layouts timestamp - SECURITY: search_path set';
COMMENT ON FUNCTION migrate_existing_users_to_simple_dashboards() IS 'Migrates existing users to new dashboard system - SECURITY: search_path set';
