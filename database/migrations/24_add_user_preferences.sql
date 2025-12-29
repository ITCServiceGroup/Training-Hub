-- Migration: Add User Preferences
-- Description: Add columns to store user-specific preferences like theme settings
-- Date: 2024

-- Add preferences column to user_profiles
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Add index for preferences queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_preferences ON user_profiles USING GIN (preferences);

-- Comment on the column
COMMENT ON COLUMN user_profiles.preferences IS 'User-specific preferences including theme settings, dashboard layout, etc.';
