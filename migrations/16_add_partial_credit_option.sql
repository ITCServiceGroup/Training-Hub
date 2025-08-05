-- Add allow_partial_credit column to v2_quizzes table
ALTER TABLE v2_quizzes 
ADD COLUMN IF NOT EXISTS allow_partial_credit boolean DEFAULT false;

-- Add comment to document what this column does
COMMENT ON COLUMN v2_quizzes.allow_partial_credit IS 'When true, allows partial credit for check_all_that_apply questions based on percentage of correct selections. When false, requires all correct answers to get any points.';