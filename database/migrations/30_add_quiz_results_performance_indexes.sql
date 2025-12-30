-- =====================================================================
-- Migration 30: Add Performance Indexes for Quiz Results
-- =====================================================================
-- Description: Add indexes to optimize quiz results queries
-- Author: Training Hub Performance Optimization
-- Date: 2025-12-30
-- Based on: Supabase slow query analysis and index advisor recommendations
-- =====================================================================

-- =====================================================================
-- PART 1: ADD INDEX ON date_of_test
-- =====================================================================

-- This index optimizes the most common quiz results query:
-- Filtering and ordering by date_of_test
--
-- Query pattern:
-- SELECT * FROM quiz_results
-- WHERE date_of_test >= ? AND date_of_test < ?
-- ORDER BY date_of_test DESC
--
-- Performance improvement: ~1.36ms average query time can be reduced significantly
-- Used in 666+ queries in the slow query report

CREATE INDEX IF NOT EXISTS idx_quiz_results_date_of_test
ON quiz_results (date_of_test DESC);

-- =====================================================================
-- PART 2: ADD COMPOSITE INDEX FOR COMMON FILTER COMBINATIONS
-- =====================================================================

-- This composite index optimizes the full filter query including
-- date range, score range, and time range filters
--
-- Query pattern:
-- SELECT * FROM quiz_results
-- WHERE date_of_test >= ? AND date_of_test < ?
--   AND score_value >= ? AND score_value <= ?
--   AND time_taken >= ? AND time_taken <= ?
-- ORDER BY date_of_test DESC

CREATE INDEX IF NOT EXISTS idx_quiz_results_filters
ON quiz_results (date_of_test DESC, score_value, time_taken);

-- =====================================================================
-- PART 3: ADD INDEX ON market FOR FILTERING
-- =====================================================================

-- This index optimizes market-based filtering of quiz results
-- Used by regional managers to view results from their market

CREATE INDEX IF NOT EXISTS idx_quiz_results_market
ON quiz_results (market);

-- =====================================================================
-- PART 4: ADD INDEX ON supervisor FOR FILTERING
-- =====================================================================

-- This index optimizes supervisor-based filtering of quiz results

CREATE INDEX IF NOT EXISTS idx_quiz_results_supervisor
ON quiz_results (supervisor);

-- =====================================================================
-- PART 5: ADD INDEX ON quiz_id FOR LOOKUPS
-- =====================================================================

-- This index optimizes queries that look up results for a specific quiz

CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id
ON quiz_results (quiz_id);

-- =====================================================================
-- VERIFICATION COMMENTS
-- =====================================================================

COMMENT ON INDEX idx_quiz_results_date_of_test IS
  'Optimizes date range queries and ORDER BY date_of_test DESC - addresses slow query from Supabase analysis';

COMMENT ON INDEX idx_quiz_results_filters IS
  'Composite index for multi-filter queries (date + score + time) - optimizes dashboard filtering';

COMMENT ON INDEX idx_quiz_results_market IS
  'Optimizes market-based filtering for regional managers';

COMMENT ON INDEX idx_quiz_results_supervisor IS
  'Optimizes supervisor-based filtering';

COMMENT ON INDEX idx_quiz_results_quiz_id IS
  'Optimizes lookups by quiz_id for quiz-specific results';
