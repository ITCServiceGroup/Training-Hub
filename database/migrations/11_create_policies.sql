-- Migration 11: Create Row Level Security Policies
-- This migration creates all RLS policies for data access control

-- Enable RLS on all tables that need it
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_initialization ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_quiz_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE v2_study_guides ENABLE ROW LEVEL SECURITY;

-- quiz_results policies
CREATE POLICY "Allow insert for all" ON quiz_results
    FOR INSERT TO public WITH CHECK (true);

-- Media library policies
CREATE POLICY "Allow authenticated users to SELECT" ON media_library
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to INSERT" ON media_library
    FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to UPDATE" ON media_library
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to DELETE" ON media_library
    FOR DELETE TO authenticated USING (true);

-- User dashboards policies
CREATE POLICY "Users can view their own dashboards" ON user_dashboards
    FOR SELECT TO public USING (
        ((auth.uid() = user_id) AND (is_template = false)) OR (is_template = true)
    );

CREATE POLICY "Users can insert their own dashboards" ON user_dashboards
    FOR INSERT TO public WITH CHECK (
        (auth.uid() = user_id) AND (is_template = false)
    );

CREATE POLICY "Users can update their own dashboards" ON user_dashboards
    FOR UPDATE TO public USING (
        (auth.uid() = user_id) AND (is_template = false)
    );

CREATE POLICY "Users can delete their own dashboards" ON user_dashboards
    FOR DELETE TO public USING (
        (auth.uid() = user_id) AND (is_template = false)
    );

-- User initialization policies
CREATE POLICY "Users can view their own initialization" ON user_initialization
    FOR SELECT TO public USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own initialization" ON user_initialization
    FOR INSERT TO public WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own initialization" ON user_initialization
    FOR UPDATE TO public USING (auth.uid() = user_id);

-- Access codes policies
CREATE POLICY "Access codes read access" ON access_codes
    FOR SELECT TO public USING (true);

CREATE POLICY "Access codes insert access" ON access_codes
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Access codes update access" ON access_codes
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Access codes delete access" ON access_codes
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Categories policies
CREATE POLICY "Public can read v2_categories" ON v2_categories
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert v2_categories" ON v2_categories
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update v2_categories" ON v2_categories
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete v2_categories" ON v2_categories
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Questions policies
CREATE POLICY "Questions read access" ON v2_questions
    FOR SELECT TO public USING (true);

CREATE POLICY "Questions insert access" ON v2_questions
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Questions update access" ON v2_questions
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Questions delete access" ON v2_questions
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Quiz questions policies
CREATE POLICY "Quiz questions read access" ON v2_quiz_questions
    FOR SELECT TO public USING (true);

CREATE POLICY "Quiz questions insert access" ON v2_quiz_questions
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Quiz questions update access" ON v2_quiz_questions
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Quiz questions delete access" ON v2_quiz_questions
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Quiz results policies (v2 - deprecated table, minimal policies)
CREATE POLICY "Quiz results read access" ON v2_quiz_results
    FOR SELECT TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Quiz results insert access" ON v2_quiz_results
    FOR INSERT TO public WITH CHECK (true);

-- Quizzes policies
CREATE POLICY "Quizzes read access" ON v2_quizzes
    FOR SELECT TO public USING (true);

CREATE POLICY "Quizzes insert access" ON v2_quizzes
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Quizzes update access" ON v2_quizzes
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Quizzes delete access" ON v2_quizzes
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Sections policies
CREATE POLICY "Public can read v2_sections" ON v2_sections
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert v2_sections" ON v2_sections
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update v2_sections" ON v2_sections
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete v2_sections" ON v2_sections
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);

-- Study guides policies
CREATE POLICY "Public can read v2_study_guides" ON v2_study_guides
    FOR SELECT TO public USING (true);

CREATE POLICY "Only admins can insert v2_study_guides" ON v2_study_guides
    FOR INSERT TO public WITH CHECK (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can update v2_study_guides" ON v2_study_guides
    FOR UPDATE TO public USING (auth.role() = 'authenticated'::text);

CREATE POLICY "Only admins can delete v2_study_guides" ON v2_study_guides
    FOR DELETE TO public USING (auth.role() = 'authenticated'::text);