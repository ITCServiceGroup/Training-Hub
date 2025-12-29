-- =====================================================================
-- Migration 21: Create RBAC RLS Policies and Helper Functions
-- =====================================================================
-- Description: Row Level Security policies and helper functions for RBAC
-- Author: Training Hub RBAC Implementation
-- Date: 2025-12-29
-- =====================================================================

-- =====================================================================
-- PART 1: CREATE HELPER FUNCTIONS
-- =====================================================================

-- Get current user's profile
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS user_profiles AS $$
  SELECT * FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_profile() IS 'Returns the full user profile for the currently authenticated user';

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_role() IS 'Returns the role of the currently authenticated user';

-- Get current user's market_id
CREATE OR REPLACE FUNCTION get_user_market_id()
RETURNS INTEGER AS $$
  SELECT market_id FROM user_profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION get_user_market_id() IS 'Returns the market_id of the currently authenticated user';

-- Check if current user is an admin (Super Admin or Admin)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role IN ('super_admin', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION is_admin() IS 'Returns TRUE if the current user is a Super Admin or Admin';

-- Check if current user is Super Admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'super_admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

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
$$ LANGUAGE sql SECURITY DEFINER STABLE;

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
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION can_manage_user(UUID) IS 'Checks if the current user can manage (view/edit) another user based on role hierarchy and market';

-- =====================================================================
-- PART 2: RLS POLICIES FOR USER_PROFILES
-- =====================================================================

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Managers can view regional profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Managers can update profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admin can delete profiles" ON user_profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (user_id = auth.uid());

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (is_admin());

-- Regional managers can view profiles in their market
CREATE POLICY "Managers can view regional profiles" ON user_profiles
  FOR SELECT USING (
    get_user_role() IN ('aom', 'supervisor')
    AND market_id = get_user_market_id()
  );

-- Only admins can insert new profiles (user creation)
CREATE POLICY "Admins can create profiles" ON user_profiles
  FOR INSERT WITH CHECK (is_admin());

-- Users with management permission can update profiles
CREATE POLICY "Managers can update profiles" ON user_profiles
  FOR UPDATE USING (can_manage_user(user_id));

-- Only super admin can delete profiles
CREATE POLICY "Super admin can delete profiles" ON user_profiles
  FOR DELETE USING (is_super_admin());

-- =====================================================================
-- PART 3: RLS POLICIES FOR CONTENT TABLES
-- =====================================================================

-- Function to create standard RLS policies for content tables
-- This will be called for each content table

-- SECTIONS TABLE
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sections_select_policy" ON sections;
DROP POLICY IF EXISTS "sections_insert_policy" ON sections;
DROP POLICY IF EXISTS "sections_update_policy" ON sections;
DROP POLICY IF EXISTS "sections_delete_policy" ON sections;

-- SELECT: View accessible content
CREATE POLICY "sections_select_policy" ON sections
  FOR SELECT USING (
    -- Public read for nationwide content (for quiz takers)
    is_nationwide = TRUE
    OR
    -- Authenticated users follow visibility rules
    can_view_content(market_id, is_nationwide)
  );

-- INSERT: Create content with proper ownership
CREATE POLICY "sections_insert_policy" ON sections
  FOR INSERT WITH CHECK (
    can_create_content()
    AND created_by = auth.uid()
    AND (
      -- Admins create nationwide content
      (is_admin() AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      -- Regional users create regional content
      (NOT is_admin() AND is_nationwide = FALSE AND market_id = get_user_market_id())
    )
  );

-- UPDATE: Edit permitted content
CREATE POLICY "sections_update_policy" ON sections
  FOR UPDATE USING (
    can_edit_content(created_by, market_id)
  );

-- DELETE: Delete permitted content
CREATE POLICY "sections_delete_policy" ON sections
  FOR DELETE USING (
    can_edit_content(created_by, market_id)
  );

-- CATEGORIES TABLE
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;

CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    can_view_content(market_id, is_nationwide)
  );

CREATE POLICY "categories_insert_policy" ON categories
  FOR INSERT WITH CHECK (
    can_create_content()
    AND created_by = auth.uid()
    AND (
      (is_admin() AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT is_admin() AND is_nationwide = FALSE AND market_id = get_user_market_id())
    )
  );

CREATE POLICY "categories_update_policy" ON categories
  FOR UPDATE USING (
    can_edit_content(created_by, market_id)
  );

CREATE POLICY "categories_delete_policy" ON categories
  FOR DELETE USING (
    can_edit_content(created_by, market_id)
  );

-- STUDY_GUIDES TABLE
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "study_guides_select_policy" ON study_guides;
DROP POLICY IF EXISTS "study_guides_insert_policy" ON study_guides;
DROP POLICY IF EXISTS "study_guides_update_policy" ON study_guides;
DROP POLICY IF EXISTS "study_guides_delete_policy" ON study_guides;

CREATE POLICY "study_guides_select_policy" ON study_guides
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    can_view_content(market_id, is_nationwide)
  );

CREATE POLICY "study_guides_insert_policy" ON study_guides
  FOR INSERT WITH CHECK (
    can_create_content()
    AND created_by = auth.uid()
    AND (
      (is_admin() AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT is_admin() AND is_nationwide = FALSE AND market_id = get_user_market_id())
    )
  );

CREATE POLICY "study_guides_update_policy" ON study_guides
  FOR UPDATE USING (
    can_edit_content(created_by, market_id)
  );

CREATE POLICY "study_guides_delete_policy" ON study_guides
  FOR DELETE USING (
    can_edit_content(created_by, market_id)
  );

-- QUIZZES TABLE
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quizzes_select_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_insert_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_update_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_delete_policy" ON quizzes;

CREATE POLICY "quizzes_select_policy" ON quizzes
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    can_view_content(market_id, is_nationwide)
  );

CREATE POLICY "quizzes_insert_policy" ON quizzes
  FOR INSERT WITH CHECK (
    can_create_content()
    AND created_by = auth.uid()
    AND (
      (is_admin() AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT is_admin() AND is_nationwide = FALSE AND market_id = get_user_market_id())
    )
  );

CREATE POLICY "quizzes_update_policy" ON quizzes
  FOR UPDATE USING (
    can_edit_content(created_by, market_id)
  );

CREATE POLICY "quizzes_delete_policy" ON quizzes
  FOR DELETE USING (
    can_edit_content(created_by, market_id)
  );

-- QUESTIONS TABLE
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "questions_select_policy" ON questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON questions;
DROP POLICY IF EXISTS "questions_update_policy" ON questions;
DROP POLICY IF EXISTS "questions_delete_policy" ON questions;

CREATE POLICY "questions_select_policy" ON questions
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    can_view_content(market_id, is_nationwide)
  );

CREATE POLICY "questions_insert_policy" ON questions
  FOR INSERT WITH CHECK (
    can_create_content()
    AND created_by = auth.uid()
    AND (
      (is_admin() AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT is_admin() AND is_nationwide = FALSE AND market_id = get_user_market_id())
    )
  );

CREATE POLICY "questions_update_policy" ON questions
  FOR UPDATE USING (
    can_edit_content(created_by, market_id)
  );

CREATE POLICY "questions_delete_policy" ON questions
  FOR DELETE USING (
    can_edit_content(created_by, market_id)
  );

-- MEDIA_LIBRARY TABLE
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_library_select_policy" ON media_library;
DROP POLICY IF EXISTS "media_library_insert_policy" ON media_library;
DROP POLICY IF EXISTS "media_library_update_policy" ON media_library;
DROP POLICY IF EXISTS "media_library_delete_policy" ON media_library;

CREATE POLICY "media_library_select_policy" ON media_library
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    can_view_content(market_id, is_nationwide)
  );

CREATE POLICY "media_library_insert_policy" ON media_library
  FOR INSERT WITH CHECK (
    can_create_content()
    AND created_by = auth.uid()
    AND (
      (is_admin() AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT is_admin() AND is_nationwide = FALSE AND market_id = get_user_market_id())
    )
  );

CREATE POLICY "media_library_update_policy" ON media_library
  FOR UPDATE USING (
    can_edit_content(created_by, market_id)
  );

CREATE POLICY "media_library_delete_policy" ON media_library
  FOR DELETE USING (
    can_edit_content(created_by, market_id)
  );

-- =====================================================================
-- PART 4: RLS POLICIES FOR CONTENT_APPROVAL_REQUESTS
-- =====================================================================

ALTER TABLE content_approval_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "approval_requests_select_policy" ON content_approval_requests;
DROP POLICY IF EXISTS "approval_requests_insert_policy" ON content_approval_requests;
DROP POLICY IF EXISTS "approval_requests_update_policy" ON content_approval_requests;
DROP POLICY IF EXISTS "approval_requests_delete_policy" ON content_approval_requests;

-- SELECT: Admins can see all, users can see their own requests
CREATE POLICY "approval_requests_select_policy" ON content_approval_requests
  FOR SELECT USING (
    is_admin() OR requested_by = auth.uid()
  );

-- INSERT: Content creators can request approval
CREATE POLICY "approval_requests_insert_policy" ON content_approval_requests
  FOR INSERT WITH CHECK (
    can_create_content() AND requested_by = auth.uid()
  );

-- UPDATE: Only admins can review (change status)
CREATE POLICY "approval_requests_update_policy" ON content_approval_requests
  FOR UPDATE USING (
    is_admin()
  );

-- DELETE: Only super admins can delete approval requests
CREATE POLICY "approval_requests_delete_policy" ON content_approval_requests
  FOR DELETE USING (
    is_super_admin()
  );
