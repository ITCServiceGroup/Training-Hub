-- Add has_practice_mode column to quizzes table
ALTER TABLE v2_quizzes
ADD COLUMN has_practice_mode boolean DEFAULT false;

-- Set default value for is_practice
ALTER TABLE v2_quizzes
ALTER COLUMN is_practice SET DEFAULT false;

-- Update existing quizzes to have consistent values
UPDATE v2_quizzes
SET has_practice_mode = false
WHERE has_practice_mode IS NULL;
