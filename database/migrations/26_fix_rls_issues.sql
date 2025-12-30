-- =====================================================================
-- Migration 26: Fix RLS Issues Flagged by Supabase
-- =====================================================================
-- Description: Enable RLS and create policies for tables missing them
-- Author: Training Hub Security Fix
-- Date: 2025-12-30
-- =====================================================================

-- =====================================================================
-- PART 1: ENSURE RLS IS ENABLED ON ALL REQUIRED TABLES
-- =====================================================================

-- Re-enable RLS on quiz_results (in case it was disabled)
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- Enable RLS on markets and supervisors (missing RLS)
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE supervisors ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- PART 2: CREATE POLICIES FOR MARKETS TABLE
-- =====================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "markets_select_policy" ON markets;
DROP POLICY IF EXISTS "markets_insert_policy" ON markets;
DROP POLICY IF EXISTS "markets_update_policy" ON markets;
DROP POLICY IF EXISTS "markets_delete_policy" ON markets;

-- SELECT: All authenticated users can view markets (needed for dropdowns and filters)
CREATE POLICY "markets_select_policy" ON markets
  FOR SELECT USING (
    -- Allow public read access for markets (needed for unauthenticated quiz takers)
    true
  );

-- INSERT: Only admins can create new markets
CREATE POLICY "markets_insert_policy" ON markets
  FOR INSERT WITH CHECK (
    is_admin()
  );

-- UPDATE: Only admins can update markets
CREATE POLICY "markets_update_policy" ON markets
  FOR UPDATE USING (
    is_admin()
  );

-- DELETE: Only super admins can delete markets
CREATE POLICY "markets_delete_policy" ON markets
  FOR DELETE USING (
    is_super_admin()
  );

-- =====================================================================
-- PART 3: CREATE POLICIES FOR SUPERVISORS TABLE
-- =====================================================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "supervisors_select_policy" ON supervisors;
DROP POLICY IF EXISTS "supervisors_insert_policy" ON supervisors;
DROP POLICY IF EXISTS "supervisors_update_policy" ON supervisors;
DROP POLICY IF EXISTS "supervisors_delete_policy" ON supervisors;

-- SELECT: All authenticated users can view supervisors (needed for dropdowns and filters)
CREATE POLICY "supervisors_select_policy" ON supervisors
  FOR SELECT USING (
    -- Allow public read access for supervisors (needed for unauthenticated quiz takers)
    true
  );

-- INSERT: Only admins can create new supervisors
CREATE POLICY "supervisors_insert_policy" ON supervisors
  FOR INSERT WITH CHECK (
    is_admin()
  );

-- UPDATE: Only admins can update supervisors
CREATE POLICY "supervisors_update_policy" ON supervisors
  FOR UPDATE USING (
    is_admin()
  );

-- DELETE: Only super admins can delete supervisors (soft delete via is_active preferred)
CREATE POLICY "supervisors_delete_policy" ON supervisors
  FOR DELETE USING (
    is_super_admin()
  );

-- =====================================================================
-- PART 4: ENSURE QUIZ_RESULTS POLICY EXISTS
-- =====================================================================

-- The policy should already exist from migration 11, but let's ensure it's there
-- Drop and recreate to be safe
DROP POLICY IF EXISTS "Allow insert for all" ON quiz_results;
DROP POLICY IF EXISTS "quiz_results_insert_policy" ON quiz_results;
DROP POLICY IF EXISTS "quiz_results_select_policy" ON quiz_results;

-- INSERT: Allow anyone to insert quiz results (for unauthenticated quiz takers)
CREATE POLICY "quiz_results_insert_policy" ON quiz_results
  FOR INSERT WITH CHECK (true);

-- SELECT: Only admins and regional managers can view quiz results
-- Admins can see all, regional managers can see their market's results
CREATE POLICY "quiz_results_select_policy" ON quiz_results
  FOR SELECT USING (
    -- Admins can view all results
    is_admin()
    OR
    -- Regional managers (AOM, Supervisor) can view results from their market
    (
      get_user_role() IN ('aom', 'supervisor')
      AND market = (SELECT name FROM markets WHERE id = get_user_market_id())
    )
  );

-- =====================================================================
-- VERIFICATION COMMENTS
-- =====================================================================

COMMENT ON POLICY "markets_select_policy" ON markets IS 'Allow public read access to markets for dropdowns and filters';
COMMENT ON POLICY "markets_insert_policy" ON markets IS 'Only admins can create new markets';
COMMENT ON POLICY "markets_update_policy" ON markets IS 'Only admins can update markets';
COMMENT ON POLICY "markets_delete_policy" ON markets IS 'Only super admins can delete markets';

COMMENT ON POLICY "supervisors_select_policy" ON supervisors IS 'Allow public read access to supervisors for dropdowns and filters';
COMMENT ON POLICY "supervisors_insert_policy" ON supervisors IS 'Only admins can create new supervisors';
COMMENT ON POLICY "supervisors_update_policy" ON supervisors IS 'Only admins can update supervisors';
COMMENT ON POLICY "supervisors_delete_policy" ON supervisors IS 'Only super admins can delete supervisors';

COMMENT ON POLICY "quiz_results_insert_policy" ON quiz_results IS 'Allow anyone to submit quiz results (unauthenticated quiz takers)';
COMMENT ON POLICY "quiz_results_select_policy" ON quiz_results IS 'Admins can view all results, regional managers can view their market results';
