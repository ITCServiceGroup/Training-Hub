-- Add is_default column to user_dashboards table for default dashboard functionality

-- Add the is_default column
ALTER TABLE user_dashboards 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance when querying default dashboards
CREATE INDEX IF NOT EXISTS idx_user_dashboards_user_default 
ON user_dashboards(user_id, is_default) 
WHERE is_default = true;

-- Create trigger function to ensure only one default dashboard per user
CREATE OR REPLACE FUNCTION ensure_single_default_dashboard()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a dashboard as default, unset all other defaults for this user
  IF NEW.is_default = true THEN
    UPDATE user_dashboards 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one default dashboard per user
DROP TRIGGER IF EXISTS trigger_ensure_single_default_dashboard ON user_dashboards;
CREATE TRIGGER trigger_ensure_single_default_dashboard
  BEFORE INSERT OR UPDATE ON user_dashboards
  FOR EACH ROW
  WHEN (NEW.is_default = true)
  EXECUTE FUNCTION ensure_single_default_dashboard();

-- Add comment for documentation
COMMENT ON COLUMN user_dashboards.is_default IS 'Whether this is the default dashboard for the user';
