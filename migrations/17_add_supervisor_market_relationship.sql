-- Add market_id and is_active columns to supervisors table
ALTER TABLE supervisors 
ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create a "General" market for existing supervisors if no markets exist
INSERT INTO markets (name) 
SELECT 'General' 
WHERE NOT EXISTS (SELECT 1 FROM markets LIMIT 1);

-- Assign all existing supervisors to the first market (General or first existing market)
-- This handles the case where supervisors exist but have no market assigned
UPDATE supervisors 
SET market_id = (SELECT id FROM markets ORDER BY id LIMIT 1)
WHERE market_id IS NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_supervisors_market_id ON supervisors(market_id);
CREATE INDEX IF NOT EXISTS idx_supervisors_is_active ON supervisors(is_active);
CREATE INDEX IF NOT EXISTS idx_supervisors_active_market ON supervisors(market_id, is_active);

-- Add comment to document the new columns
COMMENT ON COLUMN supervisors.market_id IS 'Reference to the market this supervisor belongs to';
COMMENT ON COLUMN supervisors.is_active IS 'Whether this supervisor is currently active and should appear in dropdown lists';