import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../../../config/supabase", () => ({ supabase: { rpc } }));

import { questionAnalyticsService } from "./questionAnalyticsService";

describe("questionAnalyticsService", () => {
  beforeEach(() => {
    rpc.mockReset();
    questionAnalyticsService.clearCache();
  });

  it("requests only bounded result identifiers and returns aggregate metrics", async () => {
    rpc.mockResolvedValueOnce({
      data: [
        {
          question_id: "question-1",
          question_text: "Which tool is approved?",
          question_type: "multiple_choice",
          options: ["A", "B"],
          quiz_id: "quiz-1",
          quiz_title: "Safety",
          category_name: "Tools",
          section_name: "Field work",
          total_attempts: 4,
          correct_attempts: 3,
          average_time_seconds: 12,
        },
      ],
      error: null,
    });

    const result =
      await questionAnalyticsService.getQuestionAnalyticsFromFilteredData([
        { id: 2, answers: { secret: true } },
        { id: 1, question_timings: { secret: 3 } },
        { id: 2 },
      ]);

    expect(rpc).toHaveBeenCalledWith("get_question_performance", {
      p_result_ids: [1, 2],
    });
    expect(result[0]).toMatchObject({
      attempts: 4,
      correct: 3,
      correctRate: 75,
    });
    expect(result[0]).not.toHaveProperty("correctAnswer");
    expect(result[0]).not.toHaveProperty("results");
  });

  it("returns a generic error and does not expose backend details", async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "database detail" },
    });

    await expect(
      questionAnalyticsService.getQuestionAnalyticsFromFilteredData([
        { id: 1 },
      ]),
    ).rejects.toThrow("Question analytics are unavailable.");
  });
});
