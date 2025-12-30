-- =====================================================================
-- Migration 24: Mark All Existing Content as Nationwide
-- =====================================================================
-- Description: Update all existing content to be marked as nationwide
-- Author: Training Hub RBAC Implementation
-- Date: 2025-12-30
-- =====================================================================

-- =====================================================================
-- MARK ALL EXISTING CONTENT AS NATIONWIDE
-- =====================================================================

-- Update all sections to be nationwide
UPDATE sections SET
  is_nationwide = TRUE,
  market_id = NULL
WHERE is_nationwide = FALSE OR is_nationwide IS NULL OR market_id IS NOT NULL;

-- Update all categories to be nationwide
UPDATE categories SET
  is_nationwide = TRUE,
  market_id = NULL
WHERE is_nationwide = FALSE OR is_nationwide IS NULL OR market_id IS NOT NULL;

-- Update all study_guides to be nationwide
UPDATE study_guides SET
  is_nationwide = TRUE,
  market_id = NULL
WHERE is_nationwide = FALSE OR is_nationwide IS NULL OR market_id IS NOT NULL;

-- Update all quizzes to be nationwide
UPDATE quizzes SET
  is_nationwide = TRUE,
  market_id = NULL
WHERE is_nationwide = FALSE OR is_nationwide IS NULL OR market_id IS NOT NULL;

-- Update all questions to be nationwide
UPDATE questions SET
  is_nationwide = TRUE,
  market_id = NULL
WHERE is_nationwide = FALSE OR is_nationwide IS NULL OR market_id IS NOT NULL;

-- Update all media_library items to be nationwide
UPDATE media_library SET
  is_nationwide = TRUE,
  market_id = NULL
WHERE is_nationwide = FALSE OR is_nationwide IS NULL OR market_id IS NOT NULL;

-- =====================================================================
-- VERIFICATION QUERIES (Comments for reference)
-- =====================================================================

-- To verify the migration was successful, run these queries:

-- Count nationwide content per table
-- SELECT 'sections' as table_name, COUNT(*) as nationwide_count FROM sections WHERE is_nationwide = TRUE
-- UNION ALL
-- SELECT 'categories', COUNT(*) FROM categories WHERE is_nationwide = TRUE
-- UNION ALL
-- SELECT 'study_guides', COUNT(*) FROM study_guides WHERE is_nationwide = TRUE
-- UNION ALL
-- SELECT 'quizzes', COUNT(*) FROM quizzes WHERE is_nationwide = TRUE
-- UNION ALL
-- SELECT 'questions', COUNT(*) FROM questions WHERE is_nationwide = TRUE
-- UNION ALL
-- SELECT 'media_library', COUNT(*) FROM media_library WHERE is_nationwide = TRUE;

-- Check for any remaining regional content
-- SELECT 'sections' as table_name, COUNT(*) as regional_count FROM sections WHERE is_nationwide = FALSE OR market_id IS NOT NULL
-- UNION ALL
-- SELECT 'categories', COUNT(*) FROM categories WHERE is_nationwide = FALSE OR market_id IS NOT NULL
-- UNION ALL
-- SELECT 'study_guides', COUNT(*) FROM study_guides WHERE is_nationwide = FALSE OR market_id IS NOT NULL
-- UNION ALL
-- SELECT 'quizzes', COUNT(*) FROM quizzes WHERE is_nationwide = FALSE OR market_id IS NOT NULL
-- UNION ALL
-- SELECT 'questions', COUNT(*) FROM questions WHERE is_nationwide = FALSE OR market_id IS NOT NULL
-- UNION ALL
-- SELECT 'media_library', COUNT(*) FROM media_library WHERE is_nationwide = FALSE OR market_id IS NOT NULL;
