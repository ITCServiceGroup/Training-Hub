import { BaseService } from "./base";
import { supabase } from "../../config/supabase";
import { assessmentGateway } from "./assessmentGateway";
import { findBestQuizMatch } from "../../utils/stringMatching";

const REPORT_PAGE_LIMIT = 1000;
const RESULT_SUMMARY_COLUMNS = [
  "id",
  "quiz_id",
  "ldap",
  "market",
  "supervisor",
  "quiz_type",
  "score_value",
  "score_text",
  "time_taken",
  "date_of_test",
  "pdf_url",
  "grading_version",
  "graded_at",
  "learner_user_id",
].join(",");
const FILTER_COLUMNS = new Set(["supervisor", "ldap", "market", "quiz_type"]);
const SORT_COLUMNS = new Set([
  "date_of_test",
  "score_value",
  "time_taken",
  "ldap",
  "supervisor",
  "market",
  "quiz_type",
]);

const clampPageValue = (value, fallback, maximum = Number.MAX_SAFE_INTEGER) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.min(parsed, maximum)
    : fallback;
};

class QuizResultsService extends BaseService {
  constructor() {
    super("quiz_results");
  }

  /**
   * Get filtered quiz results
   * @param {Object} filters - Filter parameters
   * @param {boolean} includeQuizMetadata - Whether to include quiz metadata (passing_score, etc.)
   * @returns {Promise<Array>} - Filtered quiz results
   */
  async getFilteredResults({
    startDate,
    endDate,
    supervisors,
    ldaps,
    markets,
    quizTypes,
    minScore,
    maxScore,
    minTime,
    maxTime,
    sortField = "date_of_test",
    sortOrder = "desc",
    includeQuizMetadata = false,
    limit = REPORT_PAGE_LIMIT,
    offset = 0,
  }) {
    try {
      let query = supabase.from(this.tableName).select(RESULT_SUMMARY_COLUMNS);

      // Apply filters
      if (startDate) {
        query = query.gte("date_of_test", startDate);
      }
      if (endDate) {
        const endDatePlusOne = new Date(endDate);
        endDatePlusOne.setDate(endDatePlusOne.getDate() + 1);
        query = query.lt(
          "date_of_test",
          endDatePlusOne.toISOString().split("T")[0],
        );
      }
      if (supervisors?.length) {
        query = query.in("supervisor", supervisors);
      }
      if (ldaps?.length) {
        query = query.in("ldap", ldaps);
      }
      if (markets?.length) {
        query = query.in("market", markets);
      }
      if (quizTypes?.length) {
        query = query.in("quiz_type", quizTypes);
      }
      if (minScore !== null && minScore !== undefined) {
        query = query.gte("score_value", minScore); // Revert: Expect 0-1
      }
      if (maxScore !== null && maxScore !== undefined) {
        query = query.lte("score_value", maxScore); // Revert: Expect 0-1
      }
      if (minTime !== null && minTime !== undefined) {
        query = query.gte("time_taken", minTime);
      }
      if (maxTime !== null && maxTime !== undefined) {
        query = query.lte("time_taken", maxTime);
      }

      const safeSortField = SORT_COLUMNS.has(sortField)
        ? sortField
        : "date_of_test";
      const safeLimit = clampPageValue(
        limit,
        REPORT_PAGE_LIMIT,
        REPORT_PAGE_LIMIT,
      );
      const safeOffset = clampPageValue(offset, 0);
      query = query
        .order(safeSortField, { ascending: sortOrder === "asc" })
        .range(safeOffset, safeOffset + Math.max(safeLimit, 1) - 1);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      // If quiz metadata was requested, fetch it separately
      if (includeQuizMetadata && data && data.length > 0) {
        return await this.enrichWithQuizMetadata(data);
      }

      return data;
    } catch (error) {
      console.error("Error fetching filtered results:", error);
      throw error;
    }
  }

  /**
   * Enrich quiz results with metadata from quizzes table
   * @param {Array} data - Raw quiz results data
   * @returns {Promise<Array>} - Enriched quiz results with metadata
   */
  async enrichWithQuizMetadata(data) {
    try {
      // Step 1: Get all unique quiz_ids (non-null)
      const quizIds = [
        ...new Set(data.map((result) => result.quiz_id).filter(Boolean)),
      ];

      // Step 2: Fetch quiz metadata by ID
      let quizMap = {};
      if (quizIds.length > 0) {
        const { data: quizData, error: quizError } = await supabase
          .from("quizzes")
          .select("id, title, passing_score, time_limit")
          .in("id", quizIds);

        if (!quizError && quizData) {
          quizData.forEach((quiz) => {
            let passingScore = parseFloat(quiz.passing_score) || 0.7;
            // If passing_score is stored as percentage (80), convert to decimal (0.8)
            if (passingScore > 1) {
              passingScore = passingScore / 100;
            }
            quizMap[quiz.id] = {
              title: quiz.title,
              passing_score: passingScore, // Ensure decimal format
              time_limit: quiz.time_limit, // Time limit in seconds
            };
          });
        } else {
          console.error(
            "QuizResults: Error fetching quiz metadata by ID:",
            quizError,
          );
        }
      }

      // Step 3: For records without quiz_id, try to match by quiz_type (title) with fuzzy matching
      const recordsWithoutQuizId = data.filter((result) => !result.quiz_id);
      if (recordsWithoutQuizId.length > 0) {
        const quizTypes = [
          ...new Set(
            recordsWithoutQuizId
              .map((result) => result.quiz_type)
              .filter(Boolean),
          ),
        ];
        if (quizTypes.length > 0) {
          // First, get all available quiz titles from database for fuzzy matching
          const { data: allQuizzes, error: allQuizzesError } = await supabase
            .from("quizzes")
            .select("id, title, passing_score, time_limit")
            .limit(5000);

          if (!allQuizzesError && allQuizzes) {
            const availableTitles = allQuizzes.map((quiz) => quiz.title);
            // Try to match each quiz type using fuzzy matching
            const matchResults = [];
            for (const quizType of quizTypes) {
              // First try exact match (including normalized exact match)
              const exactMatch = allQuizzes.find(
                (quiz) =>
                  quiz.title === quizType ||
                  quiz.title.trim().toLowerCase() ===
                    quizType.trim().toLowerCase(),
              );

              if (exactMatch) {
                matchResults.push({
                  searchTitle: quizType,
                  matchedQuiz: exactMatch,
                  matchType: "exact",
                  similarity: 100,
                });
              } else {
                // Try fuzzy matching
                const fuzzyMatch = findBestQuizMatch(
                  quizType,
                  availableTitles,
                  80,
                );
                if (fuzzyMatch) {
                  const matchedQuiz = allQuizzes.find(
                    (quiz) => quiz.title === fuzzyMatch.title,
                  );
                  matchResults.push({
                    searchTitle: quizType,
                    matchedQuiz: matchedQuiz,
                    matchType: "fuzzy",
                    similarity: fuzzyMatch.similarity,
                  });
                } else {
                  // No match found
                  matchResults.push({
                    searchTitle: quizType,
                    matchedQuiz: null,
                    matchType: "none",
                    similarity: 0,
                  });
                }
              }
            }

            // Store matched quiz metadata
            matchResults.forEach((result) => {
              if (result.matchedQuiz) {
                const quiz = result.matchedQuiz;
                let passingScore = parseFloat(quiz.passing_score) || 0.7;
                // If passing_score is stored as percentage (80), convert to decimal (0.8)
                if (passingScore > 1) {
                  passingScore = passingScore / 100;
                }

                // Store with both original search title and matched title for lookup
                const quizMetadata = {
                  title: quiz.title,
                  passing_score: passingScore,
                  time_limit: quiz.time_limit,
                  match_type: result.matchType,
                  similarity: result.similarity,
                };

                quizMap[`title_${result.searchTitle}`] = quizMetadata;
                // Also store with matched title for consistency
                if (result.searchTitle !== quiz.title) {
                  quizMap[`title_${quiz.title}`] = quizMetadata;
                }
              }
            });
          } else {
            console.error(
              "QuizResults: Error fetching all quiz titles for fuzzy matching:",
              allQuizzesError,
            );
          }
        }
      }
      // Step 4: Enrich all records with metadata
      const enrichedData = data.map((result) => {
        let quizMetadata = null;

        // Try to match by quiz_id first
        if (result.quiz_id && quizMap[result.quiz_id]) {
          quizMetadata = quizMap[result.quiz_id];
        }
        // Fallback to title matching
        else if (result.quiz_type && quizMap[`title_${result.quiz_type}`]) {
          quizMetadata = quizMap[`title_${result.quiz_type}`];
        }

        // Determine match type based on how metadata was found
        let matchType = "none";
        let matchSimilarity = 0;

        if (quizMetadata) {
          if (quizMetadata.match_type) {
            // This came from fuzzy matching
            matchType = quizMetadata.match_type;
            matchSimilarity = quizMetadata.similarity || 0;
          } else if (result.quiz_id && quizMap[result.quiz_id]) {
            // This was found by quiz ID
            matchType = "exact";
            matchSimilarity = 100;
          } else if (result.quiz_type && quizMap[`title_${result.quiz_type}`]) {
            // This was found by exact title match
            matchType = "exact";
            matchSimilarity = 100;
          }
        }

        return {
          ...result,
          quiz_title: quizMetadata?.title || result.quiz_type || "Unknown Quiz",
          passing_score: quizMetadata?.passing_score || 0.7, // Clean decimal format
          time_limit: quizMetadata?.time_limit || null, // Time limit in seconds
          has_quiz_metadata: !!quizMetadata,
          // Additional metadata for debugging and alerts
          match_type: matchType,
          match_similarity: matchSimilarity,
          using_default_score:
            !quizMetadata || quizMetadata.passing_score === 0.7,
        };
      });

      return enrichedData;
    } catch (error) {
      console.error("QuizResults: Error during metadata enrichment:", error);

      // Fallback: return data with defaults
      return data.map((result) => ({
        ...result,
        quiz_title: result.quiz_type || "Unknown Quiz",
        passing_score: 0.7, // Default 70%
        has_quiz_metadata: false,
      }));
    }
  }

  /**
   * Get distinct values for a column
   * @param {string} column - Column name
   * @returns {Promise<Array>} - Distinct values
   */
  async getDistinctValues(column) {
    if (!FILTER_COLUMNS.has(column)) {
      throw new Error("Unsupported quiz-result filter column");
    }

    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(column)
        .not(column, "is", null)
        .limit(5000);

      if (error) {
        throw error;
      }

      // Extract unique values
      const values = [...new Set(data.map((item) => item[column]))];
      return values.sort();
    } catch (error) {
      console.error(`Error fetching distinct ${column} values:`, error);
      throw error;
    }
  }

  async submitOfficialAttempt({
    accessCode,
    answers,
    idempotencyKey,
    timeTaken,
    questionTimings,
  }) {
    return assessmentGateway.submitOfficialAttempt({
      accessCode,
      answers,
      idempotencyKey,
      timeTaken,
      questionTimings,
    });
  }

  async gradePracticeAttempt({ quizId, answers }) {
    return assessmentGateway.gradePracticeAttempt({ quizId, answers });
  }

  /**
   * Get results for a specific quiz type
   * @param {string} quizType - Quiz type
   * @returns {Promise<Array>} - Quiz results
   */
  async getByQuizId(quizType) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(RESULT_SUMMARY_COLUMNS)
        .eq("quiz_type", quizType)
        .order("date_of_test", { ascending: false })
        .limit(REPORT_PAGE_LIMIT);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error fetching results by quiz type:", error.message);
      throw error;
    }
  }

  /**
   * Get results for a specific user
   * @param {string} ldap - LDAP username
   * @returns {Promise<Array>} - Quiz results
   */
  async getByUserIdentifier(ldap) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select(RESULT_SUMMARY_COLUMNS)
        .eq("ldap", ldap)
        .order("date_of_test", { ascending: false })
        .limit(REPORT_PAGE_LIMIT);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(
        "Error fetching results by user identifier:",
        error.message,
      );
      throw error;
    }
  }

  /**
   * Get total count of quiz results
   * @returns {Promise<number>} - Total count of quiz results
   */
  async getTotalCount() {
    try {
      const { count, error } = await supabase
        .from(this.tableName)
        .select("id", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      return count;
    } catch (error) {
      console.error("Error getting total count:", error.message);
      throw error;
    }
  }

  /**
   * Get recent quiz results
   * @param {number} limit - Maximum number of results to return
   * @returns {Promise<Array>} - Recent quiz results
   */
  async getRecentResults(limit = 5) {
    try {
      const safeLimit = clampPageValue(limit, 5, 100);
      const results = await this.getFilteredResults({
        sortField: "date_of_test",
        sortOrder: "desc",
        limit: safeLimit,
      });

      return results.map((result) => {
        return {
          id: result.id,
          type: "quiz_completion",
          user: result.ldap || "-",
          item: result.quiz_type || "Quiz",
          date: result.date_of_test,
          score: result.score_text || "-",
        };
      });
    } catch (error) {
      console.error("Error in getRecentResults:", error);
      throw error;
    }
  }
}

export const quizResultsService = new QuizResultsService();
