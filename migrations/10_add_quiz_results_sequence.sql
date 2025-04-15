-- Create a temporary table with proper primary key
CREATE TABLE v2_quiz_results_new (
    id BIGSERIAL PRIMARY KEY,
    ldap text,
    market text,
    pdf_url text,
    quiz_type text,
    score_text text,
    score_value double precision,
    supervisor text,
    time_taken real,
    quiz_id uuid REFERENCES v2_quizzes(id),
    answers jsonb,
    date_of_test timestamp with time zone
);

-- Copy data from old table to new
INSERT INTO v2_quiz_results_new (ldap, market, pdf_url, quiz_type, score_text, score_value, supervisor, time_taken, quiz_id, answers, date_of_test)
SELECT ldap, market, pdf_url, quiz_type, score_text, score_value, supervisor, time_taken, quiz_id, answers, date_of_test
FROM v2_quiz_results;

-- Drop old table and rename new one
DROP TABLE v2_quiz_results;
ALTER TABLE v2_quiz_results_new RENAME TO v2_quiz_results;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON v2_quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_ldap ON v2_quiz_results(ldap);

-- Re-enable RLS policies
ALTER TABLE v2_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quiz results insert access" ON v2_quiz_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Quiz results read access" ON v2_quiz_results FOR SELECT USING (auth.role() = 'authenticated');
