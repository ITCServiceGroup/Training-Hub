-- Create sections table
CREATE TABLE v2_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create trigger for updated_at on sections
CREATE TRIGGER v2_sections_updated_at_trigger
  BEFORE UPDATE ON v2_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on sections
ALTER TABLE v2_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for sections
CREATE POLICY "Public can read v2_sections" 
  ON v2_sections FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert v2_sections" 
  ON v2_sections FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update v2_sections" 
  ON v2_sections FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete v2_sections" 
  ON v2_sections FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Migrate existing data: Create sections from unique section values in categories
INSERT INTO v2_sections (name, description)
SELECT DISTINCT section, 'Migrated from categories'
FROM v2_categories;

-- Add section_id column to categories
ALTER TABLE v2_categories 
ADD COLUMN section_id UUID REFERENCES v2_sections(id) ON DELETE CASCADE;

-- Create index on section_id
CREATE INDEX v2_categories_section_id_idx ON v2_categories(section_id);

-- Update categories to reference the correct section
UPDATE v2_categories c
SET section_id = s.id
FROM v2_sections s
WHERE c.section = s.name;

-- Drop parent_id column and related index
DROP INDEX IF EXISTS v2_categories_parent_id_idx;
ALTER TABLE v2_categories DROP COLUMN IF EXISTS parent_id;

-- Make section_id NOT NULL after migration
ALTER TABLE v2_categories ALTER COLUMN section_id SET NOT NULL;

-- Drop the section column as it's now redundant
ALTER TABLE v2_categories DROP COLUMN section;
