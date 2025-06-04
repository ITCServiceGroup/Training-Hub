-- Add linked_quiz_id column to v2_study_guides for linking study guides to specific quizzes
ALTER TABLE v2_study_guides
ADD COLUMN linked_quiz_id uuid REFERENCES v2_quizzes(id) ON DELETE SET NULL;

-- Add an index for faster querying of study guides by linked quiz
CREATE INDEX IF NOT EXISTS idx_study_guides_linked_quiz_id ON v2_study_guides(linked_quiz_id);

COMMENT ON COLUMN v2_study_guides.linked_quiz_id IS 'Optional reference to a specific quiz that should be used for the practice quiz button. If NULL, falls back to category-based quiz selection.';
