-- Add archived_at column to v2_quizzes for soft deletion
ALTER TABLE v2_quizzes
ADD COLUMN archived_at timestamp with time zone DEFAULT NULL;

-- Add an index for faster querying of active quizzes
CREATE INDEX IF NOT EXISTS idx_quizzes_archived_at ON v2_quizzes(archived_at);

-- Optional: Update existing quizzes if needed (assuming all existing are active)
-- UPDATE v2_quizzes SET archived_at = NULL WHERE archived_at IS NOT NULL; -- Example if cleanup needed

COMMENT ON COLUMN v2_quizzes.archived_at IS 'Timestamp when the quiz was archived (soft deleted). NULL means the quiz is active.';
