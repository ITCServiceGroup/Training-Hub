-- =====================================================================
-- Migration 29: Final Performance Fixes
-- =====================================================================
-- Description:
--   1. Consolidate multiple permissive policies into single policies
--   2. Remove duplicate indexes from table renames
-- Author: Training Hub Performance Optimization
-- Date: 2025-12-30
-- =====================================================================

-- =====================================================================
-- PART 1: CONSOLIDATE USER_PROFILES POLICIES
-- =====================================================================

-- The issue: Multiple permissive policies on the same table/role/action
-- are executed one by one. We need to combine them into single policies
-- using OR logic for better performance.

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Managers can view regional profiles" ON user_profiles;

-- Create a single consolidated SELECT policy
CREATE POLICY "user_profiles_select_policy" ON user_profiles
  FOR SELECT USING (
    -- Users can view their own profile
    user_id = (SELECT auth.uid())
    OR
    -- Admins can view all profiles
    (SELECT is_admin())
    OR
    -- Regional managers can view profiles in their market
    (
      (SELECT get_user_role()) IN ('aom', 'supervisor')
      AND market_id = (SELECT get_user_market_id())
    )
  );

-- Drop all existing UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Managers can update profiles" ON user_profiles;

-- Create a single consolidated UPDATE policy
CREATE POLICY "user_profiles_update_policy" ON user_profiles
  FOR UPDATE USING (
    -- Users can update their own profile
    user_id = (SELECT auth.uid())
    OR
    -- Users with management permission can update profiles they manage
    (SELECT can_manage_user(user_id))
  );

-- Keep INSERT and DELETE policies as-is (they're already single policies)
-- These were already optimized in migration 28

-- =====================================================================
-- PART 2: DROP DUPLICATE INDEXES
-- =====================================================================

-- Drop old v2_ prefixed indexes that are duplicates of the new indexes
-- These were created during table renames but not cleaned up

-- Note: We only drop regular indexes, NOT primary key constraints
-- Primary keys (pkey) will remain as they don't cause performance issues

-- Categories table - drop old v2_ indexes (not constraints)
DROP INDEX IF EXISTS v2_categories_display_order_idx;
DROP INDEX IF EXISTS v2_categories_section_id_idx;

-- Sections table - drop old v2_ indexes (not constraints)
DROP INDEX IF EXISTS v2_sections_display_order_idx;

-- =====================================================================
-- VERIFICATION COMMENTS
-- =====================================================================

COMMENT ON POLICY "user_profiles_select_policy" ON user_profiles IS
  'OPTIMIZED: Single policy combining user, admin, and manager SELECT permissions';

COMMENT ON POLICY "user_profiles_update_policy" ON user_profiles IS
  'OPTIMIZED: Single policy combining user self-update and manager UPDATE permissions';
