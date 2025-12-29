-- =====================================================================
-- Migration 20: Create RBAC System
-- =====================================================================
-- Description: Implements Role-Based Access Control system
-- Author: Training Hub RBAC Implementation
-- Date: 2025-12-29
-- =====================================================================

-- =====================================================================
-- PART 1: CREATE ENUM TYPE
-- =====================================================================

-- Create the role enum type
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'admin',
  'aom',
  'supervisor',
  'lead_tech',
  'technician'
);

COMMENT ON TYPE user_role IS 'Role hierarchy: super_admin > admin > aom > supervisor > lead_tech > technician';

-- =====================================================================
-- PART 2: CREATE USER_PROFILES TABLE
-- =====================================================================

-- Create user_profiles table
CREATE TABLE user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'technician',
  market_id INTEGER REFERENCES markets(id) ON DELETE SET NULL,
  reports_to_user_id UUID REFERENCES user_profiles(user_id) ON DELETE SET NULL,
  display_name TEXT NOT NULL,
  email TEXT, -- Cached from auth.users for easier querying
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Super Admin and Admin must NOT have a market (they're nationwide)
  -- All other roles MUST have a market
  CONSTRAINT valid_market_for_role CHECK (
    (role IN ('super_admin', 'admin') AND market_id IS NULL) OR
    (role NOT IN ('super_admin', 'admin') AND market_id IS NOT NULL)
  ),

  -- Super Admin, Admin, and AOM don't report to anyone
  -- Supervisor reports to AOM, Lead Tech reports to Supervisor, Technician reports to Supervisor/Lead
  CONSTRAINT valid_reports_to CHECK (
    (role IN ('super_admin', 'admin', 'aom') AND reports_to_user_id IS NULL) OR
    (role NOT IN ('super_admin', 'admin', 'aom'))
  )
);

-- Create indexes for common queries
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_market ON user_profiles(market_id);
CREATE INDEX idx_user_profiles_reports_to ON user_profiles(reports_to_user_id);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Add comments
COMMENT ON TABLE user_profiles IS 'Extended user profile with role and market assignment';
COMMENT ON COLUMN user_profiles.role IS 'User role determining permissions';
COMMENT ON COLUMN user_profiles.market_id IS 'Market/region the user belongs to (NULL for nationwide roles)';
COMMENT ON COLUMN user_profiles.reports_to_user_id IS 'Hierarchical reporting relationship';
COMMENT ON COLUMN user_profiles.display_name IS 'User full name for display';
COMMENT ON COLUMN user_profiles.email IS 'Cached email from auth.users for easier querying';
COMMENT ON COLUMN user_profiles.is_active IS 'Whether user account is active (can login)';

-- =====================================================================
-- PART 3: ADD RBAC COLUMNS TO CONTENT TABLES
-- =====================================================================

-- Add RBAC columns to sections table
ALTER TABLE sections ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS is_nationwide BOOLEAN DEFAULT FALSE;
ALTER TABLE sections ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE sections ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_sections_visibility ON sections(is_nationwide, market_id);
CREATE INDEX IF NOT EXISTS idx_sections_created_by ON sections(created_by);

COMMENT ON COLUMN sections.created_by IS 'User who created this content';
COMMENT ON COLUMN sections.market_id IS 'Market this content belongs to (NULL if nationwide)';
COMMENT ON COLUMN sections.is_nationwide IS 'TRUE if content is visible to all markets';
COMMENT ON COLUMN sections.approved_by IS 'Admin who approved regional content for nationwide visibility';
COMMENT ON COLUMN sections.approved_at IS 'When the content was approved for nationwide visibility';

-- Add RBAC columns to categories table
ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_nationwide BOOLEAN DEFAULT FALSE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE categories ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_categories_visibility ON categories(is_nationwide, market_id);
CREATE INDEX IF NOT EXISTS idx_categories_created_by ON categories(created_by);

COMMENT ON COLUMN categories.created_by IS 'User who created this content';
COMMENT ON COLUMN categories.market_id IS 'Market this content belongs to (NULL if nationwide)';
COMMENT ON COLUMN categories.is_nationwide IS 'TRUE if content is visible to all markets';
COMMENT ON COLUMN categories.approved_by IS 'Admin who approved regional content for nationwide visibility';
COMMENT ON COLUMN categories.approved_at IS 'When the content was approved for nationwide visibility';

-- Add RBAC columns to study_guides table
ALTER TABLE study_guides ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE study_guides ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id);
ALTER TABLE study_guides ADD COLUMN IF NOT EXISTS is_nationwide BOOLEAN DEFAULT FALSE;
ALTER TABLE study_guides ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE study_guides ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_study_guides_visibility ON study_guides(is_nationwide, market_id);
CREATE INDEX IF NOT EXISTS idx_study_guides_created_by ON study_guides(created_by);

COMMENT ON COLUMN study_guides.created_by IS 'User who created this content';
COMMENT ON COLUMN study_guides.market_id IS 'Market this content belongs to (NULL if nationwide)';
COMMENT ON COLUMN study_guides.is_nationwide IS 'TRUE if content is visible to all markets';
COMMENT ON COLUMN study_guides.approved_by IS 'Admin who approved regional content for nationwide visibility';
COMMENT ON COLUMN study_guides.approved_at IS 'When the content was approved for nationwide visibility';

-- Add RBAC columns to quizzes table
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS is_nationwide BOOLEAN DEFAULT FALSE;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_quizzes_visibility ON quizzes(is_nationwide, market_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);

COMMENT ON COLUMN quizzes.created_by IS 'User who created this content';
COMMENT ON COLUMN quizzes.market_id IS 'Market this content belongs to (NULL if nationwide)';
COMMENT ON COLUMN quizzes.is_nationwide IS 'TRUE if content is visible to all markets';
COMMENT ON COLUMN quizzes.approved_by IS 'Admin who approved regional content for nationwide visibility';
COMMENT ON COLUMN quizzes.approved_at IS 'When the content was approved for nationwide visibility';

-- Add RBAC columns to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS is_nationwide BOOLEAN DEFAULT FALSE;
ALTER TABLE questions ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE questions ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_questions_visibility ON questions(is_nationwide, market_id);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);

COMMENT ON COLUMN questions.created_by IS 'User who created this content';
COMMENT ON COLUMN questions.market_id IS 'Market this content belongs to (NULL if nationwide)';
COMMENT ON COLUMN questions.is_nationwide IS 'TRUE if content is visible to all markets';
COMMENT ON COLUMN questions.approved_by IS 'Admin who approved regional content for nationwide visibility';
COMMENT ON COLUMN questions.approved_at IS 'When the content was approved for nationwide visibility';

-- Add RBAC columns to media_library table
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS market_id INTEGER REFERENCES markets(id);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS is_nationwide BOOLEAN DEFAULT FALSE;
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE media_library ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_media_library_visibility ON media_library(is_nationwide, market_id);
CREATE INDEX IF NOT EXISTS idx_media_library_created_by ON media_library(created_by);

COMMENT ON COLUMN media_library.created_by IS 'User who created this content';
COMMENT ON COLUMN media_library.market_id IS 'Market this content belongs to (NULL if nationwide)';
COMMENT ON COLUMN media_library.is_nationwide IS 'TRUE if content is visible to all markets';
COMMENT ON COLUMN media_library.approved_by IS 'Admin who approved regional content for nationwide visibility';
COMMENT ON COLUMN media_library.approved_at IS 'When the content was approved for nationwide visibility';

-- =====================================================================
-- PART 4: MODIFY SUPERVISORS TABLE
-- =====================================================================

-- Add user account link to supervisors table
ALTER TABLE supervisors ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE supervisors ADD COLUMN IF NOT EXISTS is_legacy BOOLEAN DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_supervisors_user_id ON supervisors(user_id);

COMMENT ON COLUMN supervisors.user_id IS 'Link to user account (if supervisor has an account)';
COMMENT ON COLUMN supervisors.is_legacy IS 'TRUE for supervisors created before RBAC (dropdown-only entries)';

-- =====================================================================
-- PART 5: CREATE CONTENT_APPROVAL_REQUESTS TABLE
-- =====================================================================

CREATE TABLE IF NOT EXISTS content_approval_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type TEXT NOT NULL CHECK (content_type IN (
    'section', 'category', 'study_guide', 'quiz', 'question', 'media'
  )),
  content_id UUID NOT NULL,
  requested_by UUID REFERENCES auth.users(id) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

-- Drop the UNIQUE constraint if it exists (not the index directly)
ALTER TABLE content_approval_requests
  DROP CONSTRAINT IF EXISTS content_approval_requests_content_type_content_id_status_key;

-- Create partial unique index to ensure one pending request per content item
CREATE UNIQUE INDEX IF NOT EXISTS idx_approval_requests_pending_unique
  ON content_approval_requests(content_type, content_id)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_approval_requests_status ON content_approval_requests(status);
CREATE INDEX IF NOT EXISTS idx_approval_requests_requested_by ON content_approval_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_approval_requests_content ON content_approval_requests(content_type, content_id);

COMMENT ON TABLE content_approval_requests IS 'Workflow for promoting regional content to nationwide';
COMMENT ON COLUMN content_approval_requests.content_type IS 'Type of content being requested for approval';
COMMENT ON COLUMN content_approval_requests.content_id IS 'UUID of the content item';
COMMENT ON COLUMN content_approval_requests.requested_by IS 'User who requested the approval';
COMMENT ON COLUMN content_approval_requests.status IS 'Current status: pending, approved, rejected';
COMMENT ON COLUMN content_approval_requests.reviewed_by IS 'Admin who reviewed the request';
COMMENT ON COLUMN content_approval_requests.review_notes IS 'Notes from the reviewer';

-- =====================================================================
-- PART 6: CREATE HELPER FUNCTION FOR UPDATED_AT TIMESTAMP
-- =====================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON FUNCTION update_updated_at_column() IS 'Automatically updates the updated_at timestamp on row update';
