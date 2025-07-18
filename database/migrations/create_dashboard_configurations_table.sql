-- Create unified dashboard_configurations table
-- This replaces the separate dashboard_layouts table with a more comprehensive system

CREATE TABLE IF NOT EXISTS dashboard_configurations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'user',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_template BOOLEAN NOT NULL DEFAULT false,
  tiles JSONB NOT NULL DEFAULT '[]',
  filters JSONB NOT NULL DEFAULT '{}',
  layout JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  sharing JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  usage_count INTEGER NOT NULL DEFAULT 0,
  
  -- Constraints
  CONSTRAINT dashboard_configurations_name_length CHECK (char_length(name) <= 100),
  CONSTRAINT dashboard_configurations_description_length CHECK (char_length(description) <= 500),
  CONSTRAINT dashboard_configurations_type_valid CHECK (type IN ('system', 'user', 'shared', 'template')),
  
  -- Unique constraint for user + name combination
  CONSTRAINT dashboard_configurations_user_name_unique UNIQUE (user_id, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_user_id ON dashboard_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_type ON dashboard_configurations(type);
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_user_default ON dashboard_configurations(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_updated_at ON dashboard_configurations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_usage ON dashboard_configurations(user_id, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_dashboard_configurations_last_used ON dashboard_configurations(user_id, last_used_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dashboard_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_dashboard_configurations_updated_at
  BEFORE UPDATE ON dashboard_configurations
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_configurations_updated_at();

-- Create trigger to ensure only one default configuration per user
CREATE OR REPLACE FUNCTION ensure_single_default_configuration()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a configuration as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE dashboard_configurations 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_configuration
  BEFORE INSERT OR UPDATE ON dashboard_configurations
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_configuration();

-- Add RLS (Row Level Security) policies
ALTER TABLE dashboard_configurations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own configurations
CREATE POLICY dashboard_configurations_user_isolation ON dashboard_configurations
  FOR ALL USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own configurations
CREATE POLICY dashboard_configurations_user_insert ON dashboard_configurations
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own configurations
CREATE POLICY dashboard_configurations_user_update ON dashboard_configurations
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Policy: Users can delete their own configurations
CREATE POLICY dashboard_configurations_user_delete ON dashboard_configurations
  FOR DELETE USING (user_id = auth.uid()::text);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_configurations TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE dashboard_configurations IS 'Unified dashboard configurations replacing separate presets and layouts';
COMMENT ON COLUMN dashboard_configurations.id IS 'Unique identifier for the configuration';
COMMENT ON COLUMN dashboard_configurations.user_id IS 'ID of the user who owns this configuration';
COMMENT ON COLUMN dashboard_configurations.name IS 'User-defined name for the configuration (max 100 chars)';
COMMENT ON COLUMN dashboard_configurations.description IS 'Optional description of the configuration (max 500 chars)';
COMMENT ON COLUMN dashboard_configurations.type IS 'Type: system, user, shared, or template';
COMMENT ON COLUMN dashboard_configurations.is_default IS 'Whether this is the default configuration for the user';
COMMENT ON COLUMN dashboard_configurations.is_template IS 'Whether this configuration can be used as a template';
COMMENT ON COLUMN dashboard_configurations.tiles IS 'JSON array of tile configurations with positions and settings';
COMMENT ON COLUMN dashboard_configurations.filters IS 'JSON object containing default filters for this configuration';
COMMENT ON COLUMN dashboard_configurations.layout IS 'JSON object containing layout settings (grid, spacing, etc.)';
COMMENT ON COLUMN dashboard_configurations.metadata IS 'JSON object containing metadata (tags, category, popularity, etc.)';
COMMENT ON COLUMN dashboard_configurations.sharing IS 'JSON object containing sharing settings and permissions';
COMMENT ON COLUMN dashboard_configurations.created_at IS 'Timestamp when the configuration was created';
COMMENT ON COLUMN dashboard_configurations.updated_at IS 'Timestamp when the configuration was last updated';
COMMENT ON COLUMN dashboard_configurations.last_used_at IS 'Timestamp when the configuration was last used';
COMMENT ON COLUMN dashboard_configurations.usage_count IS 'Number of times this configuration has been used';

-- Example data structure for tiles column:
-- [
--   {
--     "id": "score-trend",
--     "position": {"x": 0, "y": 0},
--     "size": {"w": 2, "h": 1},
--     "priority": 1,
--     "config": {},
--     "customSettings": {}
--   }
-- ]

-- Example data structure for filters column:
-- {
--   "dateRange": {
--     "preset": "last_month",
--     "startDate": null,
--     "endDate": null
--   },
--   "quickPreset": "last_month",
--   "supervisor": null,
--   "market": null
-- }

-- Example data structure for layout column:
-- {
--   "gridColumns": 3,
--   "gridGap": 16,
--   "autoResize": true,
--   "compactMode": false
-- }

-- Example data structure for metadata column:
-- {
--   "createdBy": "user123",
--   "tags": ["executive", "overview"],
--   "category": "management",
--   "popularity": 85,
--   "version": "1.0.0"
-- }

-- Example data structure for sharing column:
-- {
--   "isPublic": false,
--   "sharedWith": [],
--   "permissions": {
--     "canView": true,
--     "canClone": true,
--     "canEdit": false
--   }
-- }
