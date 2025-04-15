-- Add quiz_id column to v2_quiz_results
ALTER TABLE v2_quiz_results
ADD COLUMN quiz_id uuid;

-- Add foreign key constraint for quiz_id
ALTER TABLE v2_quiz_results
ADD CONSTRAINT fk_quiz_id
FOREIGN KEY (quiz_id) REFERENCES v2_quizzes(id) ON DELETE SET NULL; -- Or ON DELETE CASCADE if results should be deleted when a quiz is deleted

-- Add answers column to v2_quiz_results
ALTER TABLE v2_quiz_results
ADD COLUMN answers jsonb;

-- Add index for quiz_id for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON v2_quiz_results(quiz_id);

-- Add index for ldap for better performance on lookups
CREATE INDEX IF NOT EXISTS idx_quiz_results_ldap ON v2_quiz_results(ldap);

-- Note: RLS policies for v2_quiz_results were already present according to the provided schema snapshot.
-- If they were missing, they would be added here like this:
-- ALTER TABLE v2_quiz_results ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Quiz results insert access" ON v2_quiz_results FOR INSERT USING (true);
-- CREATE POLICY "Quiz results read access" ON v2_quiz_results FOR SELECT USING (auth.role() = 'authenticated');
