-- Fix the cascading delete issue for quiz questions
-- This migration changes the foreign key constraint to prevent automatic deletion
-- of quiz questions when categories are deleted

-- First, drop the existing foreign key constraint
ALTER TABLE v2_questions 
DROP CONSTRAINT IF EXISTS v2_questions_category_id_fkey;

-- Add the new constraint with RESTRICT instead of CASCADE
-- This will prevent category deletion if there are associated questions
ALTER TABLE v2_questions 
ADD CONSTRAINT v2_questions_category_id_fkey 
FOREIGN KEY (category_id) 
REFERENCES v2_categories(id) 
ON DELETE RESTRICT;

-- Alternative approach: Use SET NULL if you want to allow orphaned questions
-- that can be reassigned later
-- ALTER TABLE v2_questions 
-- ADD CONSTRAINT v2_questions_category_id_fkey 
-- FOREIGN KEY (category_id) 
-- REFERENCES v2_categories(id) 
-- ON DELETE SET NULL;

-- Add a comment explaining the change
COMMENT ON CONSTRAINT v2_questions_category_id_fkey ON v2_questions IS 
'Prevents category deletion when questions exist. Questions must be reassigned or deleted first.';
