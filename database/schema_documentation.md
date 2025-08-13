# Database Schema Documentation

This document provides detailed information about the current database schema for Training Hub v2.

## Tables Overview

### Content Organization

#### sections
Top-level content organization sections.
- `id` (UUID, PK) - Unique identifier
- `name` (VARCHAR) - Section name
- `description` (TEXT) - Optional description
- `display_order` (INTEGER) - Sort order for UI
- `icon` (VARCHAR) - Icon name for UI display
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

#### categories  
Categories within sections for organizing content.
- `id` (UUID, PK) - Unique identifier
- `section_id` (UUID, FK → sections) - Parent section
- `name` (VARCHAR) - Category name
- `description` (TEXT) - Optional description
- `display_order` (INTEGER) - Sort order within section
- `icon` (VARCHAR) - Icon name for UI display
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

#### study_guides
Study guide content organized by categories.
- `id` (UUID, PK) - Unique identifier
- `category_id` (UUID, FK → categories) - Parent category
- `title` (VARCHAR) - Study guide title
- `content` (TEXT) - HTML/JSON content
- `display_order` (INTEGER) - Sort order within category
- `is_published` (BOOLEAN) - Visibility to public users
- `description` (TEXT) - Custom description override
- `linked_quiz_id` (UUID, FK → v2_quizzes) - Optional specific quiz link
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

#### study_guide_templates
Templates for creating new study guides.
- `id` (UUID, PK) - Unique identifier
- `name` (TEXT) - Template name
- `description` (TEXT) - Template description
- `content` (TEXT) - Template content
- `category` (TEXT) - Template category
- `tags` (TEXT[]) - Array of tags
- `thumbnail` (TEXT) - Thumbnail image URL
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

### Quiz System

#### v2_quizzes
Quiz definitions with settings and metadata.
- `id` (UUID, PK) - Unique identifier
- `title` (VARCHAR) - Quiz title
- `description` (TEXT) - Quiz description
- `time_limit` (INTEGER) - Time limit in minutes
- `passing_score` (NUMERIC) - Required score to pass
- `randomize_questions` (BOOLEAN) - Randomize question order
- `randomize_answers` (BOOLEAN) - Randomize answer options
- `has_practice_mode` (BOOLEAN) - Enable practice mode
- `is_practice` (BOOLEAN) - Is this a practice quiz
- `category_ids` (JSONB) - Categories this quiz covers
- `archived_at` (TIMESTAMPTZ) - Soft delete timestamp
- `allow_partial_credit` (BOOLEAN) - Allow partial credit for multi-select
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

#### v2_questions
Question bank organized by categories.
- `id` (UUID, PK) - Unique identifier
- `category_id` (UUID, FK → categories) - Question category
- `question_text` (TEXT) - The question
- `question_type` (VARCHAR) - Type: multiple_choice, true_false, check_all_that_apply
- `options` (JSONB) - Answer options array
- `correct_answer` (JSONB) - Correct answer(s)
- `explanation` (TEXT) - Optional answer explanation
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

#### v2_quiz_questions
Junction table linking quizzes to their questions.
- `quiz_id` (UUID, PK, FK → v2_quizzes) - Quiz reference
- `question_id` (UUID, PK, FK → v2_questions) - Question reference
- `order_index` (INTEGER) - Question order in quiz
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### Results & Access

#### quiz_results (Active Table)
Stores completed quiz attempts.
- `id` (BIGINT, PK, IDENTITY) - Auto-incrementing ID
- `quiz_id` (UUID) - Quiz reference (no FK for flexibility)
- `ldap` (TEXT) - User LDAP identifier
- `market` (TEXT) - User's market
- `supervisor` (TEXT) - User's supervisor
- `quiz_type` (TEXT) - Type of quiz taken
- `score_value` (DOUBLE PRECISION) - Numeric score
- `score_text` (TEXT) - Text score representation
- `time_taken` (REAL) - Time in seconds
- `date_of_test` (TIMESTAMPTZ) - When quiz was completed
- `pdf_url` (TEXT) - Generated PDF report URL
- `answers` (JSONB) - User's answers
- `question_timings` (JSONB) - Time per question
- `shuffled_questions` (JSONB) - Question order presented

#### access_codes
Access codes for controlling quiz access.
- `id` (UUID, PK) - Unique identifier
- `code` (VARCHAR, UNIQUE) - Access code string
- `quiz_id` (UUID, FK → v2_quizzes) - Associated quiz
- `email`, `ldap`, `market`, `supervisor` (VARCHAR) - User info
- `expires_at` (TIMESTAMPTZ) - Expiration time
- `is_used` (BOOLEAN) - Whether code has been used
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### Organization

#### markets
Market/location definitions.
- `id` (INTEGER, PK, IDENTITY) - Auto-incrementing ID
- `name` (VARCHAR, UNIQUE) - Market name
- `created_at` (TIMESTAMPTZ) - Creation timestamp

#### supervisors
Supervisor information linked to markets.
- `id` (INTEGER, PK, IDENTITY) - Auto-incrementing ID
- `name` (VARCHAR, UNIQUE) - Supervisor name
- `market_id` (INTEGER, FK → markets) - Associated market
- `is_active` (BOOLEAN) - Active status (soft delete)
- `created_at` (TIMESTAMPTZ) - Creation timestamp

### User Systems

#### user_dashboards
User-customizable dashboards.
- `id` (TEXT, PK) - Dashboard identifier
- `user_id` (UUID) - User reference (auth.users)
- `name` (TEXT) - Dashboard name
- `description` (TEXT) - Dashboard description
- `tiles` (JSONB) - Dashboard tile configurations
- `filters` (JSONB) - Global dashboard filters
- `layout` (JSONB) - Layout configuration
- `is_template` (BOOLEAN) - System template flag
- `is_default` (BOOLEAN) - User's default dashboard
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields
- UNIQUE constraint on (user_id, name)

#### user_initialization
User onboarding tracking.
- `user_id` (UUID, PK) - User reference (auth.users)
- `dashboard_templates_copied` (BOOLEAN) - Templates copied flag
- `version` (TEXT) - Initialization version
- `initialized_at` (TIMESTAMPTZ) - Completion timestamp
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

#### media_library
Media file metadata and storage information.
- `id` (UUID, PK) - Unique identifier
- `file_name` (TEXT) - Original filename
- `mime_type` (TEXT) - File MIME type
- `size` (BIGINT) - File size in bytes
- `storage_path` (TEXT, UNIQUE) - Storage bucket path
- `public_url` (TEXT) - Public access URL
- `uploaded_by` (UUID) - User reference (auth.users)
- `alt_text` (TEXT) - Accessibility text
- `caption` (TEXT) - File caption
- `created_at`, `updated_at` (TIMESTAMPTZ) - Audit fields

## Key Relationships

1. **Content Hierarchy**: Sections → Categories → (Study Guides + Questions)
2. **Quiz Structure**: Quizzes ←→ Questions (many-to-many via v2_quiz_questions)
3. **Organizational**: Markets → Supervisors (one-to-many)
4. **User Data**: Users → Dashboards + Initialization (one-to-many, one-to-one)
5. **Access Control**: Quizzes → Access Codes (one-to-many)

## Important Notes

- **quiz_results** is the active results table; v2_quiz_results is deprecated
- Foreign keys use CASCADE DELETE for hierarchical cleanup
- RLS policies enforce data access controls
- UUID primary keys used for most entities
- BIGINT/INTEGER identity columns used for high-volume tables
- All user references point to Supabase auth.users but avoid FK constraints