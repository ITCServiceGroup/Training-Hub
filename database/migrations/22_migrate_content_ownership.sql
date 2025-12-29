-- =====================================================================
-- Migration 22: Migrate Content Ownership
-- =====================================================================
-- Description: Migrate existing content to RBAC system and create Super Admin profile
-- Author: Training Hub RBAC Implementation
-- Date: 2025-12-29
-- =====================================================================

-- =====================================================================
-- PART 1: CREATE SUPER ADMIN PROFILE
-- =====================================================================

-- Create profile for existing Super Admin user
-- User ID: 19782d02-d744-488e-849f-154696da81a7
-- Email: itcservicegroup99@gmail.com
INSERT INTO user_profiles (user_id, role, display_name, email, is_active)
VALUES (
  '19782d02-d744-488e-849f-154696da81a7',
  'super_admin',
  'Nathan Sullivan',
  'itcservicegroup99@gmail.com',
  TRUE
)
ON CONFLICT (user_id) DO UPDATE
SET
  role = 'super_admin',
  display_name = 'Nathan Sullivan',
  email = 'itcservicegroup99@gmail.com',
  is_active = TRUE,
  updated_at = NOW();

-- =====================================================================
-- PART 2: MIGRATE EXISTING CONTENT OWNERSHIP
-- =====================================================================

-- Set Super Admin as creator and mark as nationwide
-- This preserves existing content and makes it accessible to all users

-- Migrate sections
UPDATE sections SET
  created_by = '19782d02-d744-488e-849f-154696da81a7',
  is_nationwide = TRUE,
  market_id = NULL
WHERE created_by IS NULL;

-- Migrate categories
UPDATE categories SET
  created_by = '19782d02-d744-488e-849f-154696da81a7',
  is_nationwide = TRUE,
  market_id = NULL
WHERE created_by IS NULL;

-- Migrate study_guides
UPDATE study_guides SET
  created_by = '19782d02-d744-488e-849f-154696da81a7',
  is_nationwide = TRUE,
  market_id = NULL
WHERE created_by IS NULL;

-- Migrate quizzes
UPDATE quizzes SET
  created_by = '19782d02-d744-488e-849f-154696da81a7',
  is_nationwide = TRUE,
  market_id = NULL
WHERE created_by IS NULL;

-- Migrate questions
UPDATE questions SET
  created_by = '19782d02-d744-488e-849f-154696da81a7',
  is_nationwide = TRUE,
  market_id = NULL
WHERE created_by IS NULL;

-- Migrate media_library
UPDATE media_library SET
  created_by = '19782d02-d744-488e-849f-154696da81a7',
  is_nationwide = TRUE,
  market_id = NULL
WHERE created_by IS NULL;

-- =====================================================================
-- PART 3: MARK LEGACY SUPERVISORS
-- =====================================================================

-- Mark all existing supervisors as legacy entries
UPDATE supervisors SET is_legacy = TRUE WHERE user_id IS NULL;

-- =====================================================================
-- PART 4: VERIFICATION QUERIES (Comments for reference)
-- =====================================================================

-- To verify the migration was successful, run these queries:

-- Check Super Admin profile was created
-- SELECT * FROM user_profiles WHERE role = 'super_admin';

-- Count migrated content
-- SELECT 'sections' as table_name, COUNT(*) as migrated FROM sections WHERE created_by = '19782d02-d744-488e-849f-154696da81a7' AND is_nationwide = TRUE
-- UNION ALL
-- SELECT 'categories', COUNT(*) FROM categories WHERE created_by = '19782d02-d744-488e-849f-154696da81a7' AND is_nationwide = TRUE
-- UNION ALL
-- SELECT 'study_guides', COUNT(*) FROM study_guides WHERE created_by = '19782d02-d744-488e-849f-154696da81a7' AND is_nationwide = TRUE
-- UNION ALL
-- SELECT 'quizzes', COUNT(*) FROM quizzes WHERE created_by = '19782d02-d744-488e-849f-154696da81a7' AND is_nationwide = TRUE
-- UNION ALL
-- SELECT 'questions', COUNT(*) FROM questions WHERE created_by = '19782d02-d744-488e-849f-154696da81a7' AND is_nationwide = TRUE
-- UNION ALL
-- SELECT 'media_library', COUNT(*) FROM media_library WHERE created_by = '19782d02-d744-488e-849f-154696da81a7' AND is_nationwide = TRUE;

-- Check legacy supervisors
-- SELECT * FROM supervisors WHERE is_legacy = TRUE;
