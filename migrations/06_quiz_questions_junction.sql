-- Create junction table for quiz questions
CREATE TABLE IF NOT EXISTS v2_quiz_questions (
  quiz_id uuid REFERENCES v2_quizzes(id) ON DELETE CASCADE,
  question_id uuid REFERENCES v2_questions(id) ON DELETE CASCADE,
  order_index integer,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (quiz_id, question_id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON v2_quiz_questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id ON v2_quiz_questions(question_id);

-- Enable RLS
ALTER TABLE v2_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Quiz questions read access" ON v2_quiz_questions;
DROP POLICY IF EXISTS "Quiz questions insert access" ON v2_quiz_questions;
DROP POLICY IF EXISTS "Quiz questions update access" ON v2_quiz_questions;
DROP POLICY IF EXISTS "Quiz questions delete access" ON v2_quiz_questions;

-- Create RLS policies
CREATE POLICY "Quiz questions read access" ON v2_quiz_questions 
  FOR SELECT
  USING (true);

CREATE POLICY "Quiz questions insert access" ON v2_quiz_questions 
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Quiz questions update access" ON v2_quiz_questions 
  FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Quiz questions delete access" ON v2_quiz_questions 
  FOR DELETE
  USING (auth.role() = 'authenticated');
