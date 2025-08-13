-- Migration 17: Update existing indexes to reflect new table names
-- This migration updates indexes that were created before the table rename

-- Drop old indexes that reference the old table names
DROP INDEX IF EXISTS v2_sections_pkey;
DROP INDEX IF EXISTS v2_sections_display_order_idx;
DROP INDEX IF EXISTS v2_categories_pkey;
DROP INDEX IF EXISTS v2_categories_section_id_idx;
DROP INDEX IF EXISTS v2_categories_display_order_idx;

-- These indexes should have been created by migration 16, but let's ensure they exist
-- Indexes for sections (formerly v2_sections)
CREATE INDEX IF NOT EXISTS sections_pkey ON sections USING btree (id);
CREATE INDEX IF NOT EXISTS sections_display_order_idx ON sections USING btree (display_order);

-- Indexes for categories (formerly v2_categories)  
CREATE INDEX IF NOT EXISTS categories_pkey ON categories USING btree (id);
CREATE INDEX IF NOT EXISTS categories_section_id_idx ON categories USING btree (section_id);
CREATE INDEX IF NOT EXISTS categories_display_order_idx ON categories USING btree (display_order);