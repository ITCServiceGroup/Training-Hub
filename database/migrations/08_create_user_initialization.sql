-- Migration 08: Create User Initialization System
-- This migration creates the user initialization tracking system

-- Create user_initialization table
CREATE TABLE IF NOT EXISTS user_initialization (
    user_id UUID PRIMARY KEY,
    dashboard_templates_copied BOOLEAN DEFAULT FALSE,
    version TEXT, -- Version of initialization logic used
    initialized_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to table
COMMENT ON TABLE user_initialization IS 'Tracks user onboarding and initialization status';
COMMENT ON COLUMN user_initialization.dashboard_templates_copied IS 'Whether default dashboard templates have been copied to this user';
COMMENT ON COLUMN user_initialization.version IS 'Version of the initialization process used';
COMMENT ON COLUMN user_initialization.initialized_at IS 'Timestamp when user initialization was completed';
COMMENT ON COLUMN user_initialization.user_id IS 'References auth.users.id but no FK constraint due to auth schema';