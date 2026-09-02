import { supabase } from "../../../config/supabase";

const CACHE_DURATION_MS = 5 * 60 * 1000;
const MAX_RESULT_IDS = 1000;

const toAnalyticsRow = (row) => {
  const attempts = Number(row.total_attempts) || 0;
  const correct = Number(row.correct_attempts) || 0;
  const correctRate = attempts > 0 ? (correct / attempts) * 100 : 0;
  const avgTimeSpent = Number(row.average_time_seconds) || 0;
  const status =
    correctRate < 40
      ? "Very Hard"
      : correctRate < 60
        ? "Hard"
        : correctRate < 80
          ? "Moderate"
          : "Good";
  const statusColor =
    correctRate < 40
      ? "#dc2626"
      : correctRate < 60
        ? "#ef4444"
        : correctRate < 80
          ? "#f59e0b"
          : "#10b981";

  return {
    questionId: row.question_id,
    displayText:
      row.question_text?.length > 100
        ? `${row.question_text.slice(0, 100)}...`
        : row.question_text,
    questionText: row.question_text,
    questionType: row.question_type,
    options: row.options,
    quizTitle: row.quiz_title,
    quizId: row.quiz_id,
    category: row.category_name || "Uncategorized",
    section: row.section_name || "No Section",
    attempts,
    correct,
    incorrect: Math.max(0, attempts - correct),
    correctRate: Math.round(correctRate * 10) / 10,
    difficulty: Math.round((100 - correctRate) * 10) / 10,
    avgTimeSpent,
    status,
    statusColor,
    needsReview: correctRate < 60 || avgTimeSpent > 120,
    hasTimingData: row.average_time_seconds !== null,
  };
};

class QuestionAnalyticsService {
  constructor() {
    this.cache = new Map();
  }

  clearCache() {
    this.cache.clear();
  }

  async getQuestionAnalyticsFromFilteredData(filteredData) {
    const resultIds = [
      ...new Set(
        filteredData
          .map((result) => Number(result.id))
          .filter((resultId) => Number.isSafeInteger(resultId) && resultId > 0),
      ),
    ]
      .sort((left, right) => left - right)
      .slice(0, MAX_RESULT_IDS);

    if (resultIds.length === 0) return [];

    const cacheKey = resultIds.join(",");
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.createdAt < CACHE_DURATION_MS) {
      return cached.data;
    }

    const { data, error } = await supabase.rpc("get_question_performance", {
      p_result_ids: resultIds,
    });
    if (error) throw new Error("Question analytics are unavailable.");

    const analytics = (data || [])
      .map(toAnalyticsRow)
      .sort((left, right) => right.difficulty - left.difficulty);
    this.cache.set(cacheKey, { data: analytics, createdAt: Date.now() });
    return analytics;
  }
}

export const questionAnalyticsService = new QuestionAnalyticsService();
