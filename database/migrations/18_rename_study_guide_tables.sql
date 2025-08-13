-- Migration 18: Rename v2_study_guides and v2_study_guide_templates tables
-- This migration renames the tables to remove the v2_ prefix

-- Drop foreign key constraints that reference v2_study_guides
ALTER TABLE v2_study_guides DROP CONSTRAINT IF EXISTS v2_study_guides_category_id_fkey;
ALTER TABLE v2_study_guides DROP CONSTRAINT IF EXISTS v2_study_guides_linked_quiz_id_fkey;

-- Drop all policies that reference the old table names
DROP POLICY IF EXISTS "Public can read v2_study_guides" ON v2_study_guides;
DROP POLICY IF EXISTS "Only admins can insert v2_study_guides" ON v2_study_guides;
DROP POLICY IF EXISTS "Only admins can update v2_study_guides" ON v2_study_guides;
DROP POLICY IF EXISTS "Only admins can delete v2_study_guides" ON v2_study_guides;

-- Rename the tables
ALTER TABLE v2_study_guides RENAME TO study_guides;
ALTER TABLE v2_study_guide_templates RENAME TO study_guide_templates;

-- Recreate foreign key constraints with new table names
ALTER TABLE study_guides 
ADD CONSTRAINT study_guides_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;

ALTER TABLE study_guides 
ADD CONSTRAINT study_guides_linked_quiz_id_fkey 
FOREIGN KEY (linked_quiz_id) REFERENCES quizzes(id) 
ON DELETE SET NULL;

-- Enable RLS on the renamed tables
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_guide_templates ENABLE ROW LEVEL SECURITY;

-- Recreate RLS policies with new table names
-- Study guides policies
CREATE POLICY "Public can read study_guides" ON study_guides
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert study_guides" ON study_guides
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update study_guides" ON study_guides
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete study_guides" ON study_guides
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Study guide templates policies (no policies existed before, but adding basic ones for consistency)
CREATE POLICY "Public can read study_guide_templates" ON study_guide_templates
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert study_guide_templates" ON study_guide_templates
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update study_guide_templates" ON study_guide_templates
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete study_guide_templates" ON study_guide_templates
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Update table comments
COMMENT ON TABLE study_guides IS 'Study guide content organized by categories';
COMMENT ON TABLE study_guide_templates IS 'Templates for creating new study guides';