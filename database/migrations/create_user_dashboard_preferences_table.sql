-- Create user_dashboard_preferences table for storing user-specific preferences
-- This allows users to customize system configurations without creating new ones

CREATE TABLE IF NOT EXISTS user_dashboard_preferences (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  tile_orders JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT user_dashboard_preferences_user_id_unique UNIQUE (user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_user_id ON user_dashboard_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboard_preferences_updated_at ON user_dashboard_preferences(updated_at DESC);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_dashboard_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_dashboard_preferences_updated_at
  BEFORE UPDATE ON user_dashboard_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_dashboard_preferences_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE user_dashboard_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own preferences
CREATE POLICY user_dashboard_preferences_user_isolation ON user_dashboard_preferences
  FOR ALL USING (user_id = auth.uid()::text);

-- Policy: Users can insert their own preferences
CREATE POLICY user_dashboard_preferences_user_insert ON user_dashboard_preferences
  FOR INSERT WITH CHECK (user_id = auth.uid()::text);

-- Policy: Users can update their own preferences
CREATE POLICY user_dashboard_preferences_user_update ON user_dashboard_preferences
  FOR UPDATE USING (user_id = auth.uid()::text);

-- Policy: Users can delete their own preferences
CREATE POLICY user_dashboard_preferences_user_delete ON user_dashboard_preferences
  FOR DELETE USING (user_id = auth.uid()::text);

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE, DELETE ON user_dashboard_preferences TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_dashboard_preferences_id_seq TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE user_dashboard_preferences IS 'User-specific preferences for dashboard configurations';
COMMENT ON COLUMN user_dashboard_preferences.id IS 'Primary key';
COMMENT ON COLUMN user_dashboard_preferences.user_id IS 'ID of the user who owns these preferences';
COMMENT ON COLUMN user_dashboard_preferences.tile_orders IS 'JSON object mapping configuration IDs to custom tile orders';
COMMENT ON COLUMN user_dashboard_preferences.created_at IS 'Timestamp when preferences were first created';
COMMENT ON COLUMN user_dashboard_preferences.updated_at IS 'Timestamp when preferences were last updated';

-- Example data structure for tile_orders column:
-- {
--   "executive-overview": ["pass-fail-rate", "score-trend", "supervisor-performance"],
--   "manager-dashboard": ["supervisor-performance", "score-distribution", "time-distribution"],
--   "analyst-workbench": ["score-trend", "time-vs-score", "question-analytics"]
-- }
