-- Add randomization fields to v2_quizzes table
ALTER TABLE v2_quizzes
ADD COLUMN randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
ADD COLUMN randomize_answers BOOLEAN NOT NULL DEFAULT FALSE;
