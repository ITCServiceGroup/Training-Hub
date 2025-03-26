-- This script sets up the sections and categories tables with sample data
-- It can be run in the Supabase SQL Editor

-- Helper function for updated_at timestamps (if you don't already have it)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS v2_study_guides CASCADE;
DROP TABLE IF EXISTS v2_categories CASCADE;
DROP TABLE IF EXISTS v2_sections CASCADE;

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

-- Categories table with section reference
CREATE TABLE v2_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  section_id UUID NOT NULL REFERENCES v2_sections(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create index on section_id
CREATE INDEX v2_categories_section_id_idx ON v2_categories(section_id);

-- Create trigger for updated_at on categories
CREATE TRIGGER v2_categories_updated_at_trigger
  BEFORE UPDATE ON v2_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Study Guides table
CREATE TABLE v2_study_guides (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES v2_categories(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  content TEXT NOT NULL, -- Rich text content
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Create indexes for study guides
CREATE INDEX v2_study_guides_category_id_idx ON v2_study_guides(category_id);
CREATE INDEX v2_study_guides_display_order_idx ON v2_study_guides(display_order);

-- Create trigger for updated_at on study guides
CREATE TRIGGER v2_study_guides_updated_at_trigger
  BEFORE UPDATE ON v2_study_guides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE v2_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_study_guides ENABLE ROW LEVEL SECURITY;

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

-- Create policies for categories
CREATE POLICY "Public can read v2_categories" 
  ON v2_categories FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert v2_categories" 
  ON v2_categories FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update v2_categories" 
  ON v2_categories FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete v2_categories" 
  ON v2_categories FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Create policies for study guides
CREATE POLICY "Public can read v2_study_guides" 
  ON v2_study_guides FOR SELECT 
  USING (true);

CREATE POLICY "Only admins can insert v2_study_guides" 
  ON v2_study_guides FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Only admins can update v2_study_guides" 
  ON v2_study_guides FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can delete v2_study_guides" 
  ON v2_study_guides FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Insert sample data
-- Sections
INSERT INTO v2_sections (name, description)
VALUES 
  ('Installation', 'Installation guides and procedures'),
  ('Service', 'Service and maintenance procedures');

-- Categories
INSERT INTO v2_categories (name, description, section_id)
SELECT 'Basic Installation', 'Basic installation procedures', id
FROM v2_sections 
WHERE name = 'Installation';

INSERT INTO v2_categories (name, description, section_id)
SELECT 'Advanced Installation', 'Advanced installation procedures', id
FROM v2_sections 
WHERE name = 'Installation';

INSERT INTO v2_categories (name, description, section_id)
SELECT 'Basic Service', 'Basic service procedures', id
FROM v2_sections 
WHERE name = 'Service';

INSERT INTO v2_categories (name, description, section_id)
SELECT 'Advanced Service', 'Advanced service procedures', id
FROM v2_sections 
WHERE name = 'Service';

-- Study Guides
INSERT INTO v2_study_guides (category_id, title, content, display_order)
SELECT 
  id, 
  'Getting Started with Installation', 
  '<h2>Installation Basics</h2><p>This is a sample study guide for installation procedures.</p>', 
  1
FROM v2_categories 
WHERE name = 'Basic Installation';

INSERT INTO v2_study_guides (category_id, title, content, display_order)
SELECT 
  id, 
  'Advanced Installation Techniques', 
  '<h2>Advanced Installation</h2><p>This is a sample study guide for advanced installation procedures.</p>', 
  1
FROM v2_categories 
WHERE name = 'Advanced Installation';

INSERT INTO v2_study_guides (category_id, title, content, display_order)
SELECT 
  id, 
  'Service Fundamentals', 
  '<h2>Service Basics</h2><p>This is a sample study guide for service procedures.</p>', 
  1
FROM v2_categories 
WHERE name = 'Basic Service';

INSERT INTO v2_study_guides (category_id, title, content, display_order)
SELECT 
  id, 
  'Advanced Service Techniques', 
  '<h2>Advanced Service</h2><p>This is a sample study guide for advanced service procedures.</p>', 
  1
FROM v2_categories 
WHERE name = 'Advanced Service';
