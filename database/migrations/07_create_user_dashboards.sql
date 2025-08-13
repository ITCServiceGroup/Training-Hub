-- Migration 07: Create User Dashboards System
-- This migration creates the user dashboard management system

-- Create user_dashboards table
CREATE TABLE IF NOT EXISTS user_dashboards (
    id TEXT PRIMARY KEY,
    user_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    tiles JSONB NOT NULL DEFAULT '[]'::jsonb, -- Dashboard tile configurations
    filters JSONB DEFAULT '{}'::jsonb, -- Global dashboard filters
    layout JSONB DEFAULT '{}'::jsonb, -- Dashboard layout configuration
    is_template BOOLEAN DEFAULT FALSE, -- Whether this is a system template
    is_default BOOLEAN DEFAULT FALSE COMMENT 'Whether this is the default dashboard for the user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique dashboard names per user
    UNIQUE(user_id, name)
);

-- Add comments to table
COMMENT ON TABLE user_dashboards IS 'User-customizable dashboards with tiles and filters';
COMMENT ON COLUMN user_dashboards.tiles IS 'JSON array of dashboard tile configurations';
COMMENT ON COLUMN user_dashboards.filters IS 'JSON object of global dashboard filters';
COMMENT ON COLUMN user_dashboards.layout IS 'JSON object defining dashboard layout settings';
COMMENT ON COLUMN user_dashboards.is_template IS 'System templates are copied to new users';
COMMENT ON COLUMN user_dashboards.user_id IS 'References auth.users.id but no FK constraint due to auth schema';