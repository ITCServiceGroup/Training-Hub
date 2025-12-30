-- =====================================================================
-- Migration 32: Fix Access Codes RLS Policies
-- =====================================================================
-- Description:
--   Migration 28 dropped the old access_codes policies but didn't create
--   new ones, leaving the table with RLS enabled but no policies.
--   This migration creates proper RLS policies for access_codes table.
-- Author: Training Hub
-- Date: 2025-12-30
-- =====================================================================

-- Ensure RLS is enabled on access_codes table
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (in case they exist)
DROP POLICY IF EXISTS "access_codes_select_policy" ON access_codes;
DROP POLICY IF EXISTS "access_codes_insert_policy" ON access_codes;
DROP POLICY IF EXISTS "access_codes_update_policy" ON access_codes;
DROP POLICY IF EXISTS "access_codes_delete_policy" ON access_codes;

-- =====================================================================
-- SELECT Policy: Allow reading access codes
-- =====================================================================
-- Authenticated users can view access codes
-- This is needed for:
-- 1. Admins to view generated codes
-- 2. Quiz takers to validate their access codes
CREATE POLICY "access_codes_select_policy" ON access_codes
  FOR SELECT
  USING (
    -- Allow all authenticated users to read access codes
    -- This is safe because access codes don't contain sensitive data
    -- and are needed for quiz access validation
    auth.role() = 'authenticated'
    OR
    -- Allow anonymous users to validate codes (for quiz taking)
    auth.role() = 'anon'
  );

-- =====================================================================
-- INSERT Policy: Allow creating access codes
-- =====================================================================
-- Only authenticated users (admins/supervisors) can generate codes
CREATE POLICY "access_codes_insert_policy" ON access_codes
  FOR INSERT
  WITH CHECK (
    -- Only authenticated users can create access codes
    auth.role() = 'authenticated'
  );

-- =====================================================================
-- UPDATE Policy: Allow updating access codes
-- =====================================================================
-- Authenticated users can update codes (e.g., mark as used)
CREATE POLICY "access_codes_update_policy" ON access_codes
  FOR UPDATE
  USING (
    -- Allow authenticated users to update
    auth.role() = 'authenticated'
    OR
    -- Allow anonymous users to mark codes as used (when taking quiz)
    auth.role() = 'anon'
  );

-- =====================================================================
-- DELETE Policy: Allow deleting access codes
-- =====================================================================
-- Only authenticated users can delete codes
CREATE POLICY "access_codes_delete_policy" ON access_codes
  FOR DELETE
  USING (
    -- Only authenticated users can delete access codes
    auth.role() = 'authenticated'
  );

-- =====================================================================
-- Verification
-- =====================================================================
-- Verify policies were created
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'access_codes';
  
  IF policy_count < 4 THEN
    RAISE EXCEPTION 'Access codes policies were not created correctly. Expected 4, got %', policy_count;
  END IF;
  
  RAISE NOTICE 'Successfully created % RLS policies for access_codes table', policy_count;
END $$;

