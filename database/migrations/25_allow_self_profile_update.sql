-- Migration: Allow Users to Update Their Own Profile
-- Description: Add RLS policy to allow users to update their own user_profile (for preferences, etc.)
-- Date: 2024

-- Add policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Comment on the policy
COMMENT ON POLICY "Users can update own profile" ON user_profiles IS
  'Allows users to update their own profile, including preferences';
