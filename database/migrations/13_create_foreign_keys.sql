-- Migration 13: Create Foreign Key Constraints
-- This migration creates all foreign key relationships

-- Foreign key: v2_categories -> v2_sections
ALTER TABLE v2_categories 
ADD CONSTRAINT IF NOT EXISTS v2_categories_section_id_fkey 
FOREIGN KEY (section_id) REFERENCES v2_sections(id) 
ON DELETE CASCADE;

-- Foreign key: v2_questions -> v2_categories
ALTER TABLE v2_questions 
ADD CONSTRAINT IF NOT EXISTS v2_questions_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES v2_categories(id) 
ON DELETE CASCADE;

-- Foreign key: v2_study_guides -> v2_categories
ALTER TABLE v2_study_guides 
ADD CONSTRAINT IF NOT EXISTS v2_study_guides_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES v2_categories(id) 
ON DELETE CASCADE;

-- Foreign key: v2_study_guides -> v2_quizzes (optional linked quiz)
ALTER TABLE v2_study_guides 
ADD CONSTRAINT IF NOT EXISTS v2_study_guides_linked_quiz_id_fkey 
FOREIGN KEY (linked_quiz_id) REFERENCES v2_quizzes(id) 
ON DELETE SET NULL;

-- Foreign key: access_codes -> v2_quizzes
ALTER TABLE access_codes 
ADD CONSTRAINT IF NOT EXISTS access_codes_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES v2_quizzes(id) 
ON DELETE CASCADE;

-- Foreign key: v2_quiz_questions -> v2_questions
ALTER TABLE v2_quiz_questions 
ADD CONSTRAINT IF NOT EXISTS v2_quiz_questions_question_id_fkey 
FOREIGN KEY (question_id) REFERENCES v2_questions(id) 
ON DELETE CASCADE;

-- Foreign key: v2_quiz_questions -> v2_quizzes
ALTER TABLE v2_quiz_questions 
ADD CONSTRAINT IF NOT EXISTS v2_quiz_questions_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES v2_quizzes(id) 
ON DELETE CASCADE;

-- Foreign key: v2_quiz_results -> v2_quizzes (deprecated table)
-- Note: This table is deprecated but keeping FK for data integrity until removal
ALTER TABLE v2_quiz_results 
ADD CONSTRAINT IF NOT EXISTS v2_quiz_results_new_quiz_id_fkey 
FOREIGN KEY (quiz_id) REFERENCES v2_quizzes(id) 
ON DELETE SET NULL;

-- Foreign key: supervisors -> markets
ALTER TABLE supervisors 
ADD CONSTRAINT IF NOT EXISTS supervisors_market_id_fkey 
FOREIGN KEY (market_id) REFERENCES markets(id) 
ON DELETE CASCADE;

-- Note: quiz_results table does not have a foreign key to v2_quizzes 
-- because it stores quiz_id as a reference but allows for flexibility
-- in case quizzes are soft-deleted or archived