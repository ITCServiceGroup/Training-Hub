-- Create dashboard_layouts table for storing user-saved dashboard layouts
CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tiles JSONB NOT NULL DEFAULT '[]',
  filters JSONB NOT NULL DEFAULT '{}',
  layout_type TEXT NOT NULL DEFAULT 'custom',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT dashboard_layouts_name_length CHECK (char_length(name) <= 50),
  CONSTRAINT dashboard_layouts_description_length CHECK (char_length(description) <= 200),
  CONSTRAINT dashboard_layouts_layout_type_valid CHECK (layout_type IN ('custom', 'preset', 'template')),
  
  -- Indexes
  CONSTRAINT dashboard_layouts_user_id_name_unique UNIQUE (user_id, name)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_default ON dashboard_layouts(user_id, is_default) WHERE is_default = true;
CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_updated_at ON dashboard_layouts(updated_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dashboard_layouts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_dashboard_layouts_updated_at
  BEFORE UPDATE ON dashboard_layouts
  FOR EACH ROW
  EXECUTE FUNCTION update_dashboard_layouts_updated_at();

-- Create trigger to ensure only one default layout per user
CREATE OR REPLACE FUNCTION ensure_single_default_layout()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a layout as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE dashboard_layouts 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_default_layout
  BEFORE INSERT OR UPDATE ON dashboard_layouts
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_layout();

-- Add RLS (Row Level Security) policies
ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own layouts
CREATE POLICY dashboard_layouts_user_isolation ON dashboard_layouts
  FOR ALL USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own layouts
CREATE POLICY dashboard_layouts_user_insert ON dashboard_layouts
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own layouts
CREATE POLICY dashboard_layouts_user_update ON dashboard_layouts
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Policy: Users can delete their own layouts
CREATE POLICY dashboard_layouts_user_delete ON dashboard_layouts
  FOR DELETE USING (user_id = auth.uid()::text);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON dashboard_layouts TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE dashboard_layouts IS 'Stores user-saved dashboard layouts with tile arrangements and filters';
COMMENT ON COLUMN dashboard_layouts.id IS 'Unique identifier for the layout';
COMMENT ON COLUMN dashboard_layouts.user_id IS 'ID of the user who owns this layout';
COMMENT ON COLUMN dashboard_layouts.name IS 'User-defined name for the layout (max 50 chars)';
COMMENT ON COLUMN dashboard_layouts.description IS 'Optional description of the layout (max 200 chars)';
COMMENT ON COLUMN dashboard_layouts.tiles IS 'JSON array of tile configurations with positions and priorities';
COMMENT ON COLUMN dashboard_layouts.filters IS 'JSON object containing default filters for this layout';
COMMENT ON COLUMN dashboard_layouts.layout_type IS 'Type of layout: custom, preset, or template';
COMMENT ON COLUMN dashboard_layouts.is_default IS 'Whether this is the default layout for the user';
COMMENT ON COLUMN dashboard_layouts.created_at IS 'Timestamp when the layout was created';
COMMENT ON COLUMN dashboard_layouts.updated_at IS 'Timestamp when the layout was last updated';

-- Example data structure for tiles column:
-- [
--   {
--     "id": "score-trend",
--     "position": {"x": 0, "y": 0, "w": 2, "h": 1},
--     "priority": 1
--   },
--   {
--     "id": "score-distribution", 
--     "position": {"x": 2, "y": 0, "w": 1, "h": 1},
--     "priority": 2
--   }
-- ]

-- Example data structure for filters column:
-- {
--   "dateRange": {
--     "preset": "last_month",
--     "startDate": null,
--     "endDate": null
--   },
--   "quickPreset": "last_month"
-- }
