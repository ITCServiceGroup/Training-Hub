-- =====================================================================
-- Migration 31: Fix Lead Tech Access to Quiz Results
-- =====================================================================
-- Description: Allow Lead Techs to view quiz results from their market
-- Author: Training Hub RBAC Fix
-- Date: 2025-12-30
-- Issue: Lead Techs were incorrectly excluded from viewing quiz results
-- =====================================================================

-- =====================================================================
-- PART 1: UPDATE quiz_results SELECT POLICY
-- =====================================================================

-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "quiz_results_select_policy" ON quiz_results;

-- Create new policy that includes Lead Techs
CREATE POLICY "quiz_results_select_policy" ON quiz_results
  FOR SELECT USING (
    -- Admins can view all results
    (SELECT is_admin())
    OR
    -- Regional staff (AOM, Supervisor, Lead Tech) can view results from their market
    (
      (SELECT get_user_role()) IN ('aom', 'supervisor', 'lead_tech')
      AND market = (SELECT name FROM markets WHERE id = (SELECT get_user_market_id()))
    )
    OR
    -- Technicians can view results from their market (read-only access)
    (
      (SELECT get_user_role()) = 'technician'
      AND market = (SELECT name FROM markets WHERE id = (SELECT get_user_market_id()))
    )
  );

-- =====================================================================
-- VERIFICATION COMMENTS
-- =====================================================================

COMMENT ON POLICY "quiz_results_select_policy" ON quiz_results IS
  'FIX: Allow Lead Techs and Technicians to view quiz results from their market - was incorrectly restricted to only AOM/Supervisor';
