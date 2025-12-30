-- =====================================================================
-- Migration 28: Optimize RLS Policies for Performance
-- =====================================================================
-- Description:
--   1. Remove duplicate policies from old migrations
--   2. Optimize auth function calls by wrapping in SELECT subqueries
--   3. This prevents re-evaluation of auth functions for each row
-- Author: Training Hub Performance Optimization
-- Date: 2025-12-30
-- Reference: https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan
-- =====================================================================

-- =====================================================================
-- PART 1: DROP OLD DUPLICATE POLICIES
-- =====================================================================

-- Drop old policies from migration 11 that conflict with RBAC policies
DROP POLICY IF EXISTS "Allow insert for all" ON quiz_results;
DROP POLICY IF EXISTS "Allow authenticated users to SELECT" ON media_library;
DROP POLICY IF EXISTS "Allow authenticated users to INSERT" ON media_library;
DROP POLICY IF EXISTS "Allow authenticated users to UPDATE" ON media_library;
DROP POLICY IF EXISTS "Allow authenticated users to DELETE" ON media_library;
DROP POLICY IF EXISTS "Access codes read access" ON access_codes;
DROP POLICY IF EXISTS "Access codes insert access" ON access_codes;
DROP POLICY IF EXISTS "Access codes update access" ON access_codes;
DROP POLICY IF EXISTS "Access codes delete access" ON access_codes;

-- Drop old v2 table policies (deprecated tables) - only if tables exist
DO $$
BEGIN
  -- v2_categories policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_categories') THEN
    DROP POLICY IF EXISTS "Public can read v2_categories" ON v2_categories;
    DROP POLICY IF EXISTS "Only admins can insert v2_categories" ON v2_categories;
    DROP POLICY IF EXISTS "Only admins can update v2_categories" ON v2_categories;
    DROP POLICY IF EXISTS "Only admins can delete v2_categories" ON v2_categories;
  END IF;

  -- v2_sections policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_sections') THEN
    DROP POLICY IF EXISTS "Public can read v2_sections" ON v2_sections;
    DROP POLICY IF EXISTS "Only admins can insert v2_sections" ON v2_sections;
    DROP POLICY IF EXISTS "Only admins can update v2_sections" ON v2_sections;
    DROP POLICY IF EXISTS "Only admins can delete v2_sections" ON v2_sections;
  END IF;

  -- v2_study_guides policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_study_guides') THEN
    DROP POLICY IF EXISTS "Public can read v2_study_guides" ON v2_study_guides;
    DROP POLICY IF EXISTS "Only admins can insert v2_study_guides" ON v2_study_guides;
    DROP POLICY IF EXISTS "Only admins can update v2_study_guides" ON v2_study_guides;
    DROP POLICY IF EXISTS "Only admins can delete v2_study_guides" ON v2_study_guides;
  END IF;

  -- v2_questions policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_questions') THEN
    DROP POLICY IF EXISTS "Questions read access" ON v2_questions;
    DROP POLICY IF EXISTS "Questions insert access" ON v2_questions;
    DROP POLICY IF EXISTS "Questions update access" ON v2_questions;
    DROP POLICY IF EXISTS "Questions delete access" ON v2_questions;
  END IF;

  -- v2_quiz_questions policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_quiz_questions') THEN
    DROP POLICY IF EXISTS "Quiz questions read access" ON v2_quiz_questions;
    DROP POLICY IF EXISTS "Quiz questions insert access" ON v2_quiz_questions;
    DROP POLICY IF EXISTS "Quiz questions update access" ON v2_quiz_questions;
    DROP POLICY IF EXISTS "Quiz questions delete access" ON v2_quiz_questions;
  END IF;

  -- v2_quiz_results policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_quiz_results') THEN
    DROP POLICY IF EXISTS "Quiz results read access" ON v2_quiz_results;
    DROP POLICY IF EXISTS "Quiz results insert access" ON v2_quiz_results;
  END IF;

  -- v2_quizzes policies (if table exists)
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'v2_quizzes') THEN
    DROP POLICY IF EXISTS "Quizzes read access" ON v2_quizzes;
    DROP POLICY IF EXISTS "Quizzes insert access" ON v2_quizzes;
    DROP POLICY IF EXISTS "Quizzes update access" ON v2_quizzes;
    DROP POLICY IF EXISTS "Quizzes delete access" ON v2_quizzes;
  END IF;
END $$;

-- Drop old non-RBAC policies that were replaced in migration 21
DROP POLICY IF EXISTS "Public can read categories" ON categories;
DROP POLICY IF EXISTS "Only admins can insert categories" ON categories;
DROP POLICY IF EXISTS "Only admins can update categories" ON categories;
DROP POLICY IF EXISTS "Only admins can delete categories" ON categories;
DROP POLICY IF EXISTS "Public can read sections" ON sections;
DROP POLICY IF EXISTS "Only admins can insert sections" ON sections;
DROP POLICY IF EXISTS "Only admins can update sections" ON sections;
DROP POLICY IF EXISTS "Only admins can delete sections" ON sections;
DROP POLICY IF EXISTS "Public can read study_guides" ON study_guides;
DROP POLICY IF EXISTS "Only admins can insert study_guides" ON study_guides;
DROP POLICY IF EXISTS "Only admins can update study_guides" ON study_guides;
DROP POLICY IF EXISTS "Only admins can delete study_guides" ON study_guides;
DROP POLICY IF EXISTS "Public can read study_guide_templates" ON study_guide_templates;
DROP POLICY IF EXISTS "Only admins can insert study_guide_templates" ON study_guide_templates;
DROP POLICY IF EXISTS "Only admins can update study_guide_templates" ON study_guide_templates;
DROP POLICY IF EXISTS "Only admins can delete study_guide_templates" ON study_guide_templates;
DROP POLICY IF EXISTS "Questions read access" ON questions;
DROP POLICY IF EXISTS "Questions insert access" ON questions;
DROP POLICY IF EXISTS "Questions update access" ON questions;
DROP POLICY IF EXISTS "Questions delete access" ON questions;
DROP POLICY IF EXISTS "Quiz questions read access" ON quiz_questions;
DROP POLICY IF EXISTS "Quiz questions insert access" ON quiz_questions;
DROP POLICY IF EXISTS "Quiz questions update access" ON quiz_questions;
DROP POLICY IF EXISTS "Quiz questions delete access" ON quiz_questions;
DROP POLICY IF EXISTS "Quizzes read access" ON quizzes;
DROP POLICY IF EXISTS "Quizzes insert access" ON quizzes;
DROP POLICY IF EXISTS "Quizzes update access" ON quizzes;
DROP POLICY IF EXISTS "Quizzes delete access" ON quizzes;

-- =====================================================================
-- PART 2: OPTIMIZE USER_PROFILES POLICIES
-- =====================================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING ((SELECT is_admin()));

-- Regional managers can view profiles in their market
DROP POLICY IF EXISTS "Managers can view regional profiles" ON user_profiles;
CREATE POLICY "Managers can view regional profiles" ON user_profiles
  FOR SELECT USING (
    (SELECT get_user_role()) IN ('aom', 'supervisor')
    AND market_id = (SELECT get_user_market_id())
  );

-- Only admins can insert new profiles (user creation)
DROP POLICY IF EXISTS "Admins can create profiles" ON user_profiles;
CREATE POLICY "Admins can create profiles" ON user_profiles
  FOR INSERT WITH CHECK ((SELECT is_admin()));

-- Users with management permission can update profiles
DROP POLICY IF EXISTS "Managers can update profiles" ON user_profiles;
CREATE POLICY "Managers can update profiles" ON user_profiles
  FOR UPDATE USING ((SELECT can_manage_user(user_id)));

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Only super admin can delete profiles
DROP POLICY IF EXISTS "Super admin can delete profiles" ON user_profiles;
CREATE POLICY "Super admin can delete profiles" ON user_profiles
  FOR DELETE USING ((SELECT is_super_admin()));

-- =====================================================================
-- PART 3: OPTIMIZE CONTENT TABLE POLICIES
-- =====================================================================

-- SECTIONS TABLE
DROP POLICY IF EXISTS "sections_select_policy" ON sections;
DROP POLICY IF EXISTS "sections_insert_policy" ON sections;
DROP POLICY IF EXISTS "sections_update_policy" ON sections;
DROP POLICY IF EXISTS "sections_delete_policy" ON sections;

CREATE POLICY "sections_select_policy" ON sections
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    (SELECT can_view_content(market_id, is_nationwide))
  );

CREATE POLICY "sections_insert_policy" ON sections
  FOR INSERT WITH CHECK (
    (SELECT can_create_content())
    AND created_by = (SELECT auth.uid())
    AND (
      ((SELECT is_admin()) AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT (SELECT is_admin()) AND is_nationwide = FALSE AND market_id = (SELECT get_user_market_id()))
    )
  );

CREATE POLICY "sections_update_policy" ON sections
  FOR UPDATE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

CREATE POLICY "sections_delete_policy" ON sections
  FOR DELETE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

-- CATEGORIES TABLE
DROP POLICY IF EXISTS "categories_select_policy" ON categories;
DROP POLICY IF EXISTS "categories_insert_policy" ON categories;
DROP POLICY IF EXISTS "categories_update_policy" ON categories;
DROP POLICY IF EXISTS "categories_delete_policy" ON categories;

CREATE POLICY "categories_select_policy" ON categories
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    (SELECT can_view_content(market_id, is_nationwide))
  );

CREATE POLICY "categories_insert_policy" ON categories
  FOR INSERT WITH CHECK (
    (SELECT can_create_content())
    AND created_by = (SELECT auth.uid())
    AND (
      ((SELECT is_admin()) AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT (SELECT is_admin()) AND is_nationwide = FALSE AND market_id = (SELECT get_user_market_id()))
    )
  );

CREATE POLICY "categories_update_policy" ON categories
  FOR UPDATE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

CREATE POLICY "categories_delete_policy" ON categories
  FOR DELETE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

-- STUDY_GUIDES TABLE
DROP POLICY IF EXISTS "study_guides_select_policy" ON study_guides;
DROP POLICY IF EXISTS "study_guides_insert_policy" ON study_guides;
DROP POLICY IF EXISTS "study_guides_update_policy" ON study_guides;
DROP POLICY IF EXISTS "study_guides_delete_policy" ON study_guides;

CREATE POLICY "study_guides_select_policy" ON study_guides
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    (SELECT can_view_content(market_id, is_nationwide))
  );

CREATE POLICY "study_guides_insert_policy" ON study_guides
  FOR INSERT WITH CHECK (
    (SELECT can_create_content())
    AND created_by = (SELECT auth.uid())
    AND (
      ((SELECT is_admin()) AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT (SELECT is_admin()) AND is_nationwide = FALSE AND market_id = (SELECT get_user_market_id()))
    )
  );

CREATE POLICY "study_guides_update_policy" ON study_guides
  FOR UPDATE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

CREATE POLICY "study_guides_delete_policy" ON study_guides
  FOR DELETE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

-- STUDY_GUIDE_TEMPLATES TABLE (no RBAC columns - simple admin-only policies)
DROP POLICY IF EXISTS "study_guide_templates_select_policy" ON study_guide_templates;
DROP POLICY IF EXISTS "study_guide_templates_insert_policy" ON study_guide_templates;
DROP POLICY IF EXISTS "study_guide_templates_update_policy" ON study_guide_templates;
DROP POLICY IF EXISTS "study_guide_templates_delete_policy" ON study_guide_templates;

-- Public can read templates
CREATE POLICY "study_guide_templates_select_policy" ON study_guide_templates
  FOR SELECT USING (true);

-- Only authenticated users (admins) can modify templates
CREATE POLICY "study_guide_templates_insert_policy" ON study_guide_templates
  FOR INSERT WITH CHECK ((SELECT auth.role()) = 'authenticated'::text);

CREATE POLICY "study_guide_templates_update_policy" ON study_guide_templates
  FOR UPDATE USING ((SELECT auth.role()) = 'authenticated'::text);

CREATE POLICY "study_guide_templates_delete_policy" ON study_guide_templates
  FOR DELETE USING ((SELECT auth.role()) = 'authenticated'::text);

-- QUIZZES TABLE
DROP POLICY IF EXISTS "quizzes_select_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_insert_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_update_policy" ON quizzes;
DROP POLICY IF EXISTS "quizzes_delete_policy" ON quizzes;

CREATE POLICY "quizzes_select_policy" ON quizzes
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    (SELECT can_view_content(market_id, is_nationwide))
  );

CREATE POLICY "quizzes_insert_policy" ON quizzes
  FOR INSERT WITH CHECK (
    (SELECT can_create_content())
    AND created_by = (SELECT auth.uid())
    AND (
      ((SELECT is_admin()) AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT (SELECT is_admin()) AND is_nationwide = FALSE AND market_id = (SELECT get_user_market_id()))
    )
  );

CREATE POLICY "quizzes_update_policy" ON quizzes
  FOR UPDATE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

CREATE POLICY "quizzes_delete_policy" ON quizzes
  FOR DELETE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

-- QUESTIONS TABLE
DROP POLICY IF EXISTS "questions_select_policy" ON questions;
DROP POLICY IF EXISTS "questions_insert_policy" ON questions;
DROP POLICY IF EXISTS "questions_update_policy" ON questions;
DROP POLICY IF EXISTS "questions_delete_policy" ON questions;

CREATE POLICY "questions_select_policy" ON questions
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    (SELECT can_view_content(market_id, is_nationwide))
  );

CREATE POLICY "questions_insert_policy" ON questions
  FOR INSERT WITH CHECK (
    (SELECT can_create_content())
    AND created_by = (SELECT auth.uid())
    AND (
      ((SELECT is_admin()) AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT (SELECT is_admin()) AND is_nationwide = FALSE AND market_id = (SELECT get_user_market_id()))
    )
  );

CREATE POLICY "questions_update_policy" ON questions
  FOR UPDATE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

CREATE POLICY "questions_delete_policy" ON questions
  FOR DELETE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

-- QUIZ_QUESTIONS TABLE (junction table)
DROP POLICY IF EXISTS "quiz_questions_select_policy" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_insert_policy" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_update_policy" ON quiz_questions;
DROP POLICY IF EXISTS "quiz_questions_delete_policy" ON quiz_questions;

CREATE POLICY "quiz_questions_select_policy" ON quiz_questions
  FOR SELECT USING (true);

CREATE POLICY "quiz_questions_insert_policy" ON quiz_questions
  FOR INSERT WITH CHECK ((SELECT can_create_content()));

CREATE POLICY "quiz_questions_update_policy" ON quiz_questions
  FOR UPDATE USING ((SELECT can_create_content()));

CREATE POLICY "quiz_questions_delete_policy" ON quiz_questions
  FOR DELETE USING ((SELECT can_create_content()));

-- MEDIA_LIBRARY TABLE
DROP POLICY IF EXISTS "media_library_select_policy" ON media_library;
DROP POLICY IF EXISTS "media_library_insert_policy" ON media_library;
DROP POLICY IF EXISTS "media_library_update_policy" ON media_library;
DROP POLICY IF EXISTS "media_library_delete_policy" ON media_library;

CREATE POLICY "media_library_select_policy" ON media_library
  FOR SELECT USING (
    is_nationwide = TRUE
    OR
    (SELECT can_view_content(market_id, is_nationwide))
  );

CREATE POLICY "media_library_insert_policy" ON media_library
  FOR INSERT WITH CHECK (
    (SELECT can_create_content())
    AND created_by = (SELECT auth.uid())
    AND (
      ((SELECT is_admin()) AND is_nationwide = TRUE AND market_id IS NULL)
      OR
      (NOT (SELECT is_admin()) AND is_nationwide = FALSE AND market_id = (SELECT get_user_market_id()))
    )
  );

CREATE POLICY "media_library_update_policy" ON media_library
  FOR UPDATE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

CREATE POLICY "media_library_delete_policy" ON media_library
  FOR DELETE USING (
    (SELECT can_edit_content(created_by, market_id))
  );

-- =====================================================================
-- PART 4: OPTIMIZE CONTENT_APPROVAL_REQUESTS POLICIES
-- =====================================================================

DROP POLICY IF EXISTS "approval_requests_select_policy" ON content_approval_requests;
DROP POLICY IF EXISTS "approval_requests_insert_policy" ON content_approval_requests;
DROP POLICY IF EXISTS "approval_requests_update_policy" ON content_approval_requests;
DROP POLICY IF EXISTS "approval_requests_delete_policy" ON content_approval_requests;

CREATE POLICY "approval_requests_select_policy" ON content_approval_requests
  FOR SELECT USING (
    (SELECT is_admin()) OR requested_by = (SELECT auth.uid())
  );

CREATE POLICY "approval_requests_insert_policy" ON content_approval_requests
  FOR INSERT WITH CHECK (
    (SELECT can_create_content()) AND requested_by = (SELECT auth.uid())
  );

CREATE POLICY "approval_requests_update_policy" ON content_approval_requests
  FOR UPDATE USING (
    (SELECT is_admin())
  );

CREATE POLICY "approval_requests_delete_policy" ON content_approval_requests
  FOR DELETE USING (
    (SELECT is_super_admin())
  );

-- =====================================================================
-- PART 5: OPTIMIZE USER DASHBOARD POLICIES
-- =====================================================================

DROP POLICY IF EXISTS "Users can view their own dashboards" ON user_dashboards;
DROP POLICY IF EXISTS "Users can insert their own dashboards" ON user_dashboards;
DROP POLICY IF EXISTS "Users can update their own dashboards" ON user_dashboards;
DROP POLICY IF EXISTS "Users can delete their own dashboards" ON user_dashboards;

CREATE POLICY "Users can view their own dashboards" ON user_dashboards
  FOR SELECT USING (
    (((SELECT auth.uid()) = user_id) AND (is_template = false)) OR (is_template = true)
  );

CREATE POLICY "Users can insert their own dashboards" ON user_dashboards
  FOR INSERT WITH CHECK (
    ((SELECT auth.uid()) = user_id) AND (is_template = false)
  );

CREATE POLICY "Users can update their own dashboards" ON user_dashboards
  FOR UPDATE USING (
    ((SELECT auth.uid()) = user_id) AND (is_template = false)
  );

CREATE POLICY "Users can delete their own dashboards" ON user_dashboards
  FOR DELETE USING (
    ((SELECT auth.uid()) = user_id) AND (is_template = false)
  );

-- =====================================================================
-- PART 6: OPTIMIZE USER INITIALIZATION POLICIES
-- =====================================================================

DROP POLICY IF EXISTS "Users can view their own initialization" ON user_initialization;
DROP POLICY IF EXISTS "Users can insert their own initialization" ON user_initialization;
DROP POLICY IF EXISTS "Users can update their own initialization" ON user_initialization;

CREATE POLICY "Users can view their own initialization" ON user_initialization
  FOR SELECT USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own initialization" ON user_initialization
  FOR INSERT WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own initialization" ON user_initialization
  FOR UPDATE USING ((SELECT auth.uid()) = user_id);

-- =====================================================================
-- VERIFICATION COMMENTS
-- =====================================================================

COMMENT ON POLICY "Users can view own profile" ON user_profiles IS 'OPTIMIZED: auth.uid() wrapped in SELECT';
COMMENT ON POLICY "Admins can view all profiles" ON user_profiles IS 'OPTIMIZED: is_admin() wrapped in SELECT';
COMMENT ON POLICY "sections_select_policy" ON sections IS 'OPTIMIZED: can_view_content() wrapped in SELECT';
COMMENT ON POLICY "categories_select_policy" ON categories IS 'OPTIMIZED: can_view_content() wrapped in SELECT';
COMMENT ON POLICY "study_guides_select_policy" ON study_guides IS 'OPTIMIZED: can_view_content() wrapped in SELECT';
COMMENT ON POLICY "quizzes_select_policy" ON quizzes IS 'OPTIMIZED: can_view_content() wrapped in SELECT';
COMMENT ON POLICY "questions_select_policy" ON questions IS 'OPTIMIZED: can_view_content() wrapped in SELECT';
COMMENT ON POLICY "media_library_select_policy" ON media_library IS 'OPTIMIZED: can_view_content() wrapped in SELECT';
