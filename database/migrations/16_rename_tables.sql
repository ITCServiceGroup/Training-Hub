-- Migration 16: Rename v2_categories and v2_sections to categories and sections
-- This migration renames the tables to remove the v2_ prefix

-- First, drop all foreign key constraints that reference the tables
ALTER TABLE v2_categories DROP CONSTRAINT IF EXISTS v2_categories_section_id_fkey;
ALTER TABLE v2_questions DROP CONSTRAINT IF EXISTS v2_questions_category_id_fkey;
ALTER TABLE v2_study_guides DROP CONSTRAINT IF EXISTS v2_study_guides_category_id_fkey;

-- Drop all policies that reference the old table names
DROP POLICY IF EXISTS "Public can read v2_categories" ON v2_categories;
DROP POLICY IF EXISTS "Only admins can insert v2_categories" ON v2_categories;
DROP POLICY IF EXISTS "Only admins can update v2_categories" ON v2_categories;
DROP POLICY IF EXISTS "Only admins can delete v2_categories" ON v2_categories;

DROP POLICY IF EXISTS "Public can read v2_sections" ON v2_sections;
DROP POLICY IF EXISTS "Only admins can insert v2_sections" ON v2_sections;
DROP POLICY IF EXISTS "Only admins can update v2_sections" ON v2_sections;
DROP POLICY IF EXISTS "Only admins can delete v2_sections" ON v2_sections;

-- Rename the tables
ALTER TABLE v2_sections RENAME TO sections;
ALTER TABLE v2_categories RENAME TO categories;

-- Recreate foreign key constraints with new table names
ALTER TABLE categories 
ADD CONSTRAINT categories_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES sections(id) 
ON DELETE CASCADE;

ALTER TABLE v2_questions 
ADD CONSTRAINT v2_questions_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;

ALTER TABLE v2_study_guides 
ADD CONSTRAINT v2_study_guides_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;

-- Recreate RLS policies with new table names
-- Categories policies
CREATE POLICY "Public can read categories" ON categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert categories" ON categories
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update categories" ON categories
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete categories" ON categories
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Sections policies  
CREATE POLICY "Public can read sections" ON sections
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert sections" ON sections
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update sections" ON sections
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete sections" ON sections
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Rename indexes to match new table names
DROP INDEX IF EXISTS v2_categories_pkey;
DROP INDEX IF EXISTS v2_categories_section_id_idx;
DROP INDEX IF EXISTS v2_categories_display_order_idx;
DROP INDEX IF EXISTS v2_sections_pkey;
DROP INDEX IF EXISTS v2_sections_display_order_idx;

-- Create new indexes with proper names
CREATE INDEX IF NOT EXISTS categories_pkey ON categories USING btree (id);
CREATE INDEX IF NOT EXISTS categories_section_id_idx ON categories USING btree (section_id);  
CREATE INDEX IF NOT EXISTS categories_display_order_idx ON categories USING btree (display_order);
CREATE INDEX IF NOT EXISTS sections_pkey ON sections USING btree (id);
CREATE INDEX IF NOT EXISTS sections_display_order_idx ON sections USING btree (display_order);

-- Update table comments
COMMENT ON TABLE sections IS 'Top-level content organization sections';
COMMENT ON TABLE categories IS 'Categories within sections for organizing content';