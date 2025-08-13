-- Migration 02: Create Quiz System Tables
-- This migration creates the quiz system including quizzes, questions, and the junction table

-- Create v2_quizzes table
CREATE TABLE IF NOT EXISTS v2_quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title CHARACTER VARYING NOT NULL,
    description TEXT,
    time_limit INTEGER, -- Time limit in minutes
    passing_score NUMERIC,
    randomize_questions BOOLEAN DEFAULT FALSE,
    randomize_answers BOOLEAN DEFAULT FALSE,
    has_practice_mode BOOLEAN DEFAULT TRUE,
    is_practice BOOLEAN DEFAULT FALSE,
    category_ids JSONB, -- Array of category IDs this quiz covers
    archived_at TIMESTAMP WITH TIME ZONE COMMENT 'Timestamp when the quiz was archived (soft deleted). NULL means the quiz is active.',
    allow_partial_credit BOOLEAN DEFAULT FALSE COMMENT 'When true, allows partial credit for check_all_that_apply questions based on percentage of correct selections. When false, requires all correct answers to get any points.',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create v2_questions table  
CREATE TABLE IF NOT EXISTS v2_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL,
    question_text TEXT NOT NULL,
    question_type CHARACTER VARYING NOT NULL CHECK (question_type IN ('multiple_choice', 'true_false', 'check_all_that_apply')),
    options JSONB, -- Array of answer options for multiple choice/check all
    correct_answer JSONB NOT NULL, -- The correct answer(s)
    explanation TEXT, -- Optional explanation for the answer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create v2_quiz_questions junction table
CREATE TABLE IF NOT EXISTS v2_quiz_questions (
    quiz_id UUID NOT NULL,
    question_id UUID NOT NULL,
    order_index INTEGER, -- Order of question within the quiz
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (quiz_id, question_id)
);

-- Add comments to tables
COMMENT ON TABLE v2_quizzes IS 'Quiz definitions with settings and metadata';
COMMENT ON TABLE v2_questions IS 'Question bank organized by categories';
COMMENT ON TABLE v2_quiz_questions IS 'Junction table linking quizzes to their questions';