-- Migration 19: Rename v2_questions, v2_quizzes, and v2_quiz_questions tables
-- This migration renames the quiz system tables to remove the v2_ prefix
-- CRITICAL: Order matters due to foreign key dependencies

-- Step 1: Drop all foreign key constraints that reference these tables
ALTER TABLE v2_questions DROP CONSTRAINT IF EXISTS v2_questions_category_id_fkey;
ALTER TABLE v2_quiz_questions DROP CONSTRAINT IF EXISTS v2_quiz_questions_question_id_fkey;
ALTER TABLE v2_quiz_questions DROP CONSTRAINT IF EXISTS v2_quiz_questions_quiz_id_fkey;
ALTER TABLE access_codes DROP CONSTRAINT IF EXISTS access_codes_quiz_id_fkey;
ALTER TABLE study_guides DROP CONSTRAINT IF EXISTS study_guides_linked_quiz_id_fkey;
ALTER TABLE v2_quiz_results DROP CONSTRAINT IF EXISTS v2_quiz_results_new_quiz_id_fkey;

-- Step 2: Drop all RLS policies for the tables being renamed
DROP POLICY IF EXISTS "Questions read access" ON v2_questions;
DROP POLICY IF EXISTS "Questions insert access" ON v2_questions;
DROP POLICY IF EXISTS "Questions update access" ON v2_questions;
DROP POLICY IF EXISTS "Questions delete access" ON v2_questions;

DROP POLICY IF EXISTS "Quizzes read access" ON v2_quizzes;
DROP POLICY IF EXISTS "Quizzes insert access" ON v2_quizzes;
DROP POLICY IF EXISTS "Quizzes update access" ON v2_quizzes;
DROP POLICY IF EXISTS "Quizzes delete access" ON v2_quizzes;

DROP POLICY IF EXISTS "Quiz questions read access" ON v2_quiz_questions;
DROP POLICY IF EXISTS "Quiz questions insert access" ON v2_quiz_questions;
DROP POLICY IF EXISTS "Quiz questions update access" ON v2_quiz_questions;
DROP POLICY IF EXISTS "Quiz questions delete access" ON v2_quiz_questions;

-- Step 3: Drop non-primary key indexes for the tables being renamed
-- Note: Primary key indexes (v2_questions_pkey, v2_quizzes_pkey, v2_quiz_questions_pkey) 
-- are automatically managed by constraints and will be renamed with the tables

DROP INDEX IF EXISTS idx_quizzes_archived_at;
DROP INDEX IF EXISTS idx_quiz_questions_quiz_id;
DROP INDEX IF EXISTS idx_quiz_questions_question_id;

-- Step 4: Rename the tables in dependency order
-- First: v2_questions (no dependencies on other quiz tables)
ALTER TABLE v2_questions RENAME TO questions;

-- Second: v2_quizzes (can be renamed after questions)
ALTER TABLE v2_quizzes RENAME TO quizzes;

-- Third: v2_quiz_questions (depends on both questions and quizzes)
ALTER TABLE v2_quiz_questions RENAME TO quiz_questions;

-- Step 5: Recreate foreign key constraints with new table names
-- Questions -> Categories
ALTER TABLE questions 
ADD CONSTRAINT questions_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES categories(id) 
ON DELETE CASCADE;

-- Quiz Questions -> Questions
ALTER TABLE quiz_questions 
ADD CONSTRAINT quiz_questions_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES questions(id) 
ON DELETE CASCADE;

-- Quiz Questions -> Quizzes
ALTER TABLE quiz_questions 
ADD CONSTRAINT quiz_questions_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) 
ON DELETE CASCADE;

-- Access Codes -> Quizzes
ALTER TABLE access_codes 
ADD CONSTRAINT access_codes_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) 
ON DELETE CASCADE;

-- Study Guides -> Quizzes (this fixes the bug from previous migration)
ALTER TABLE study_guides 
ADD CONSTRAINT study_guides_linked_quiz_id_fkey 
FOREIGN KEY (linked_quiz_id) REFERENCES quizzes(id) 
ON DELETE SET NULL;

-- v2_quiz_results -> Quizzes (keep for deprecated table compatibility)
ALTER TABLE v2_quiz_results 
ADD CONSTRAINT v2_quiz_results_new_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES quizzes(id) 
ON DELETE SET NULL;

-- Step 6: Enable RLS on the renamed tables
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;

-- Step 7: Recreate RLS policies with new table names
-- Questions policies
CREATE POLICY "Questions read access" ON questions
    FOR SELECT TO public USING (true);

CREATE POLICY "Questions insert access" ON questions
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Questions update access" ON questions
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Questions delete access" ON questions
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Quizzes policies
CREATE POLICY "Quizzes read access" ON quizzes
    FOR SELECT TO public USING (true);

CREATE POLICY "Quizzes insert access" ON quizzes
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Quizzes update access" ON quizzes
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Quizzes delete access" ON quizzes
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Quiz questions policies
CREATE POLICY "Quiz questions read access" ON quiz_questions
    FOR SELECT TO public USING (true);

CREATE POLICY "Quiz questions insert access" ON quiz_questions
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Quiz questions update access" ON quiz_questions
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Quiz questions delete access" ON quiz_questions
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Step 8: Recreate indexes with new table names
-- Indexes for questions
CREATE INDEX IF NOT EXISTS questions_pkey ON questions USING btree (id);

-- Indexes for quizzes
CREATE INDEX IF NOT EXISTS quizzes_pkey ON quizzes USING btree (id);
CREATE INDEX IF NOT EXISTS idx_quizzes_archived_at ON quizzes USING btree (archived_at);

-- Indexes for quiz_questions
CREATE INDEX IF NOT EXISTS quiz_questions_pkey ON quiz_questions USING btree (quiz_id, question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON quiz_questions USING btree (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id ON quiz_questions USING btree (question_id);

-- Step 9: Update table comments
COMMENT ON TABLE questions IS 'Question bank organized by categories';
COMMENT ON TABLE quizzes IS 'Quiz definitions with settings and metadata';
COMMENT ON TABLE quiz_questions IS 'Junction table linking quizzes to their questions';