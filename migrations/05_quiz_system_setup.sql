-- Create questions table
CREATE TABLE IF NOT EXISTS v2_questions (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id uuid REFERENCES v2_categories(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type varchar NOT NULL CHECK (question_type IN ('multiple_choice', 'check_all_that_apply', 'true_false')),
  options jsonb, -- Array for multiple choice/check all options
  correct_answer jsonb NOT NULL, -- Single index for MC, array for Check All, boolean for T/F
  explanation text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create quizzes table
CREATE TABLE IF NOT EXISTS v2_quizzes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  title varchar NOT NULL,
  description text,
  category_ids jsonb NOT NULL, -- Array of category IDs
  time_limit integer, -- In seconds, null for no limit
  passing_score decimal, -- Percentage required to pass
  is_practice boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create access codes table
CREATE TABLE IF NOT EXISTS v2_access_codes (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id uuid REFERENCES v2_quizzes(id) ON DELETE CASCADE,
  code varchar(8) NOT NULL UNIQUE,
  ldap varchar NOT NULL,
  email varchar NOT NULL,
  supervisor varchar NOT NULL,
  market varchar NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  expires_at timestamp with time zone
);

-- Create index for faster code lookups
CREATE INDEX IF NOT EXISTS v2_access_codes_code_idx ON v2_access_codes(code);

-- Apply RLS policies
-- Questions
ALTER TABLE v2_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Questions read access" ON v2_questions;
DROP POLICY IF EXISTS "Questions insert access" ON v2_questions;
DROP POLICY IF EXISTS "Questions update access" ON v2_questions;
DROP POLICY IF EXISTS "Questions delete access" ON v2_questions;

CREATE POLICY "Questions read access" ON v2_questions 
    FOR SELECT
    USING (true);

CREATE POLICY "Questions insert access" ON v2_questions 
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Questions update access" ON v2_questions 
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Questions delete access" ON v2_questions 
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Quizzes
ALTER TABLE v2_quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Quizzes read access" ON v2_quizzes;
DROP POLICY IF EXISTS "Quizzes insert access" ON v2_quizzes;
DROP POLICY IF EXISTS "Quizzes update access" ON v2_quizzes;
DROP POLICY IF EXISTS "Quizzes delete access" ON v2_quizzes;

CREATE POLICY "Quizzes read access" ON v2_quizzes 
    FOR SELECT
    USING (true);

CREATE POLICY "Quizzes insert access" ON v2_quizzes 
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Quizzes update access" ON v2_quizzes 
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Quizzes delete access" ON v2_quizzes 
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- Access Codes
ALTER TABLE v2_access_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Access codes read access" ON v2_access_codes;
DROP POLICY IF EXISTS "Access codes insert access" ON v2_access_codes;
DROP POLICY IF EXISTS "Access codes update access" ON v2_access_codes;
DROP POLICY IF EXISTS "Access codes delete access" ON v2_access_codes;

CREATE POLICY "Access codes read access" ON v2_access_codes 
    FOR SELECT
    USING (true);

CREATE POLICY "Access codes insert access" ON v2_access_codes 
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Access codes update access" ON v2_access_codes 
    FOR UPDATE
    USING (auth.role() = 'authenticated');

CREATE POLICY "Access codes delete access" ON v2_access_codes 
    FOR DELETE
    USING (auth.role() = 'authenticated');
