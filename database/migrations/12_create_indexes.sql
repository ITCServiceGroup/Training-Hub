-- Migration 12: Create Database Indexes
-- This migration creates all performance indexes

-- Indexes for v2_questions
CREATE INDEX IF NOT EXISTS v2_questions_pkey ON v2_questions USING btree (id);

-- Indexes for media_library
CREATE INDEX IF NOT EXISTS media_library_pkey ON media_library USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS media_library_storage_path_key ON media_library USING btree (storage_path);

-- Indexes for v2_study_guide_templates
CREATE INDEX IF NOT EXISTS v2_study_guide_templates_pkey ON v2_study_guide_templates USING btree (id);

-- Indexes for v2_study_guides
CREATE INDEX IF NOT EXISTS v2_study_guides_pkey ON v2_study_guides USING btree (id);
CREATE INDEX IF NOT EXISTS v2_study_guides_category_id_idx ON v2_study_guides USING btree (category_id);
CREATE INDEX IF NOT EXISTS v2_study_guides_display_order_idx ON v2_study_guides USING btree (display_order);
CREATE INDEX IF NOT EXISTS idx_study_guides_linked_quiz_id ON v2_study_guides USING btree (linked_quiz_id);
CREATE INDEX IF NOT EXISTS idx_study_guides_is_published ON v2_study_guides USING btree (is_published);

-- Indexes for v2_sections
CREATE INDEX IF NOT EXISTS v2_sections_pkey ON v2_sections USING btree (id);
CREATE INDEX IF NOT EXISTS v2_sections_display_order_idx ON v2_sections USING btree (display_order);

-- Indexes for v2_categories
CREATE INDEX IF NOT EXISTS v2_categories_pkey ON v2_categories USING btree (id);
CREATE INDEX IF NOT EXISTS v2_categories_section_id_idx ON v2_categories USING btree (section_id);
CREATE INDEX IF NOT EXISTS v2_categories_display_order_idx ON v2_categories USING btree (display_order);

-- Indexes for quiz_results
CREATE INDEX IF NOT EXISTS quiz_results_pkey ON quiz_results USING btree (id);

-- Indexes for v2_quizzes
CREATE INDEX IF NOT EXISTS v2_quizzes_pkey ON v2_quizzes USING btree (id);
CREATE INDEX IF NOT EXISTS idx_quizzes_archived_at ON v2_quizzes USING btree (archived_at);

-- Indexes for access_codes
CREATE INDEX IF NOT EXISTS access_codes_pkey ON access_codes USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS access_codes_code_key ON access_codes USING btree (code);
CREATE INDEX IF NOT EXISTS access_codes_code_idx ON access_codes USING btree (code);

-- Indexes for v2_quiz_questions
CREATE INDEX IF NOT EXISTS v2_quiz_questions_pkey ON v2_quiz_questions USING btree (quiz_id, question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz_id ON v2_quiz_questions USING btree (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_questions_question_id ON v2_quiz_questions USING btree (question_id);

-- Indexes for v2_quiz_results (deprecated table)
CREATE INDEX IF NOT EXISTS v2_quiz_results_new_pkey ON v2_quiz_results USING btree (id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON v2_quiz_results USING btree (quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_ldap ON v2_quiz_results USING btree (ldap);

-- Indexes for markets
CREATE INDEX IF NOT EXISTS markets_pkey ON markets USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS markets_name_key ON markets USING btree (name);
CREATE INDEX IF NOT EXISTS idx_markets_name ON markets USING btree (name);

-- Indexes for supervisors
CREATE INDEX IF NOT EXISTS supervisors_pkey ON supervisors USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS supervisors_name_key ON supervisors USING btree (name);
CREATE INDEX IF NOT EXISTS idx_supervisors_name ON supervisors USING btree (name);
CREATE INDEX IF NOT EXISTS idx_supervisors_market_id ON supervisors USING btree (market_id);
CREATE INDEX IF NOT EXISTS idx_supervisors_is_active ON supervisors USING btree (is_active);
CREATE INDEX IF NOT EXISTS idx_supervisors_active_market ON supervisors USING btree (market_id, is_active);

-- Indexes for user_dashboards
CREATE INDEX IF NOT EXISTS user_dashboards_pkey ON user_dashboards USING btree (id);
CREATE UNIQUE INDEX IF NOT EXISTS user_dashboards_user_name_unique ON user_dashboards USING btree (user_id, name);
CREATE INDEX IF NOT EXISTS idx_user_dashboards_user_id ON user_dashboards USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_dashboards_is_template ON user_dashboards USING btree (is_template);
CREATE INDEX IF NOT EXISTS idx_user_dashboards_created_at ON user_dashboards USING btree (created_at);
CREATE INDEX IF NOT EXISTS idx_user_dashboards_user_default ON user_dashboards USING btree (user_id, is_default) WHERE (is_default = true);

-- Indexes for user_initialization
CREATE INDEX IF NOT EXISTS user_initialization_pkey ON user_initialization USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_initialization_initialized_at ON user_initialization USING btree (initialized_at);