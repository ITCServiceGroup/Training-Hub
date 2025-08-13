-- Migration 03: Create quiz_results Table
-- This migration creates the active quiz results table (not v2_quiz_results which is deprecated)

-- Create quiz_results table (note: this is the active table, not v2_quiz_results)
CREATE TABLE IF NOT EXISTS quiz_results (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    quiz_id UUID,
    ldap TEXT,
    market TEXT,
    supervisor TEXT,
    quiz_type TEXT,
    score_value DOUBLE PRECISION,
    score_text TEXT,
    time_taken REAL, -- Time taken in seconds
    date_of_test TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    pdf_url TEXT, -- URL to generated PDF report
    answers JSONB, -- User's answers to all questions
    question_timings JSONB, -- Time spent on each question
    shuffled_questions JSONB -- Order of questions if randomized
);

-- Add comments to table
COMMENT ON TABLE quiz_results IS 'Active quiz results table storing completed quiz attempts';
COMMENT ON COLUMN quiz_results.question_timings IS 'JSON object tracking time spent on each question';
COMMENT ON COLUMN quiz_results.shuffled_questions IS 'JSON array of question IDs in the order they were presented';
COMMENT ON COLUMN quiz_results.answers IS 'JSON object containing all user answers keyed by question ID';