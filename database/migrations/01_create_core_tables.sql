-- Migration 01: Create Core Tables (Sections, Categories, Study Guides)
-- This migration creates the foundational content organization tables

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create v2_sections table
CREATE TABLE IF NOT EXISTS v2_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    display_order INTEGER,
    icon CHARACTER VARYING COMMENT 'Name of the icon to display for this section (e.g., "Book", "Network", "Download")',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create v2_categories table  
CREATE TABLE IF NOT EXISTS v2_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL,
    name CHARACTER VARYING NOT NULL,
    description TEXT,
    display_order INTEGER,
    icon CHARACTER VARYING COMMENT 'Name of the icon to display for this category (e.g., "Book", "Network", "Download")',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create v2_study_guides table
CREATE TABLE IF NOT EXISTS v2_study_guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL,
    title CHARACTER VARYING NOT NULL,
    content TEXT,
    display_order INTEGER,
    is_published BOOLEAN DEFAULT FALSE COMMENT 'Indicates whether the study guide is published and visible to public users. Default is false.',
    description TEXT COMMENT 'Optional custom description that overrides the auto-generated description when provided.',
    linked_quiz_id UUID COMMENT 'Optional reference to a specific quiz that should be used for the practice quiz button. If NULL, falls back to category-based quiz selection.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create v2_study_guide_templates table
CREATE TABLE IF NOT EXISTS v2_study_guide_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[], -- Array of text for tags
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments to tables
COMMENT ON TABLE v2_sections IS 'Top-level content organization sections';
COMMENT ON TABLE v2_categories IS 'Categories within sections for organizing content';  
COMMENT ON TABLE v2_study_guides IS 'Study guide content organized by categories';
COMMENT ON TABLE v2_study_guide_templates IS 'Templates for creating new study guides';