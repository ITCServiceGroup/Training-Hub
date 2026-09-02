import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc, from } = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn() }));

vi.mock("../../config/supabase", () => ({
  supabase: { rpc, from },
}));

import { accessCodesService } from "./accessCodes";
import { quizResultsService } from "./quizResults";
import { quizzesService } from "./quizzes";
import { trainingService } from "./training";

describe("authoritative assessment service contracts", () => {
  beforeEach(() => {
    rpc.mockReset();
    from.mockReset();
  });

  it("loads learner quizzes through the learner-safe RPC", async () => {
    const learnerQuiz = { id: "quiz-1", questions: [{ id: "question-1" }] };
    rpc.mockResolvedValueOnce({ data: learnerQuiz, error: null });

    await expect(
      quizzesService.getLearnerQuiz({ quizId: "quiz-1", accessCode: null }),
    ).resolves.toEqual(learnerQuiz);
    expect(rpc).toHaveBeenCalledWith("load_quiz_for_learner", {
      p_quiz_id: "quiz-1",
      p_access_code: null,
    });
  });

  it("normalizes access codes before server validation", async () => {
    rpc.mockResolvedValueOnce({ data: { quiz_id: "quiz-1" }, error: null });

    await accessCodesService.validateCode("  ab12cd  ");

    expect(rpc).toHaveBeenCalledWith("load_quiz_for_learner", {
      p_quiz_id: null,
      p_access_code: "AB12CD",
    });
  });

  it("creates codes on the server with a bounded lifetime", async () => {
    const input = {
      ldap: "learner",
      email: "learner@example.com",
      market: "Denver",
      supervisor: "supervisor",
    };
    rpc.mockResolvedValueOnce({ data: { code: "123ABC" }, error: null });

    await accessCodesService.generateCode("quiz-1", input);

    expect(rpc).toHaveBeenCalledWith("create_quiz_access_code", {
      p_quiz_id: "quiz-1",
      p_ldap: input.ldap,
      p_email: input.email,
      p_market: input.market,
      p_supervisor: input.supervisor,
      p_expires_in_minutes: 30,
    });
  });

  it("lists masked codes and revokes them through manager RPCs", async () => {
    rpc
      .mockResolvedValueOnce({
        data: [{ id: "code-1", code_hint: "…ABCD" }],
        error: null,
      })
      .mockResolvedValueOnce({ data: null, error: null });

    await expect(
      accessCodesService.getByQuizId("quiz-1"),
    ).resolves.toHaveLength(1);
    await expect(accessCodesService.delete("code-1")).resolves.toBeUndefined();
    expect(rpc).toHaveBeenNthCalledWith(1, "list_quiz_access_codes", {
      p_quiz_id: "quiz-1",
    });
    expect(rpc).toHaveBeenNthCalledWith(2, "revoke_quiz_access_code", {
      p_access_code_id: "code-1",
    });
  });

  it("translates backend failures without exposing server details", async () => {
    rpc.mockResolvedValueOnce({
      data: null,
      error: { message: "database detail" },
    });

    await expect(accessCodesService.validateCode("BADCODE")).rejects.toThrow(
      "Access code is invalid or unavailable",
    );
  });

  it("translates a throttled or unknown code response into the generic learner error", async () => {
    rpc.mockResolvedValueOnce({
      data: { error_code: "access_code_unavailable" },
      error: null,
    });

    await expect(
      accessCodesService.validateCode("NOT-A-CODE"),
    ).rejects.toMatchObject({
      message: "Access code is invalid or unavailable",
      code: "access_code_unavailable",
    });
  });

  it("submits official answers with a stable idempotency key", async () => {
    const response = { result_id: "result-1", score: 0.5 };
    rpc.mockResolvedValueOnce({ data: response, error: null });

    await expect(
      quizResultsService.submitOfficialAttempt({
        accessCode: "ABC123",
        answers: { "question-1": "answer-1" },
        idempotencyKey: "attempt-1",
        timeTaken: 12.6,
        questionTimings: null,
      }),
    ).resolves.toEqual(response);

    expect(rpc).toHaveBeenCalledWith("submit_quiz_attempt", {
      p_access_code: "ABC123",
      p_answers: { "question-1": "answer-1" },
      p_idempotency_key: "attempt-1",
      p_time_taken: 13,
      p_question_timings: {},
    });
  });

  it("grades practice answers on the server", async () => {
    rpc.mockResolvedValueOnce({ data: { score: 1 }, error: null });

    await quizResultsService.gradePracticeAttempt({
      quizId: "quiz-1",
      answers: { "question-1": "answer-1" },
    });

    expect(rpc).toHaveBeenCalledWith("grade_practice_attempt", {
      p_quiz_id: "quiz-1",
      p_answers: { "question-1": "answer-1" },
    });
  });

  it("uses narrow lifecycle RPCs for learner enrollment transitions", async () => {
    rpc
      .mockResolvedValueOnce({
        data: [{ enrollment_id: "enrollment-1" }],
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "enrollment-1", status: "in_progress" },
        error: null,
      })
      .mockResolvedValueOnce({ data: { id: "completion-1" }, error: null });

    await expect(trainingService.getMyTraining()).resolves.toHaveLength(1);
    await trainingService.beginEnrollment("enrollment-1");
    await trainingService.completeEnrollment("enrollment-1", "result-1");

    expect(rpc).toHaveBeenNthCalledWith(1, "list_my_training");
    expect(rpc).toHaveBeenNthCalledWith(2, "begin_training_enrollment", {
      p_enrollment_id: "enrollment-1",
    });
    expect(rpc).toHaveBeenNthCalledWith(3, "complete_training_enrollment", {
      p_enrollment_id: "enrollment-1",
      p_evidence_result_id: "result-1",
    });
  });

  it("issues assigned quiz codes only through the learner-scoped RPC", async () => {
    rpc.mockResolvedValueOnce({ data: "ABCD1234", error: null });

    await expect(
      trainingService.issueAssignedQuizAccessCode("enrollment-1"),
    ).resolves.toBe("ABCD1234");
    expect(rpc).toHaveBeenCalledWith("issue_assigned_quiz_access_code", {
      p_enrollment_id: "enrollment-1",
    });
  });

  it("uses ordered learning-path RPCs without direct progress writes", async () => {
    rpc
      .mockResolvedValueOnce({
        data: [{ enrollment_id: "enrollment-1", sequence_number: 1 }],
        error: null,
      })
      .mockResolvedValueOnce({ data: { status: "in_progress" }, error: null })
      .mockResolvedValueOnce({ data: { status: "completed" }, error: null })
      .mockResolvedValueOnce({ data: "PATHCODE", error: null });

    await trainingService.getMyLearningPathProgress();
    await trainingService.beginLearningPathItem("enrollment-1", 1);
    await trainingService.completeLearningPathItem("enrollment-1", 1);
    await trainingService.issueLearningPathQuizCode("enrollment-1", 2);

    expect(rpc).toHaveBeenNthCalledWith(1, "list_my_learning_path_progress");
    expect(rpc).toHaveBeenNthCalledWith(2, "begin_learning_path_item", {
      p_enrollment_id: "enrollment-1",
      p_sequence_number: 1,
    });
    expect(rpc).toHaveBeenNthCalledWith(3, "complete_learning_path_item", {
      p_enrollment_id: "enrollment-1",
      p_sequence_number: 1,
      p_evidence_result_id: null,
    });
    expect(rpc).toHaveBeenNthCalledWith(4, "issue_learning_path_quiz_code", {
      p_enrollment_id: "enrollment-1",
      p_sequence_number: 2,
    });
  });

  it("bounds result reports and rejects unsupported sort columns", async () => {
    const query = {
      select: vi.fn(),
      order: vi.fn(),
      range: vi.fn(),
    };
    query.select.mockReturnValue(query);
    query.order.mockReturnValue(query);
    query.range.mockResolvedValue({ data: [], error: null });
    from.mockReturnValue(query);

    await quizResultsService.getFilteredResults({
      sortField: "unsafe_column",
      limit: 50_000,
      offset: -4,
    });

    expect(query.select).toHaveBeenCalledWith(
      expect.not.stringContaining("answers"),
    );
    expect(query.order).toHaveBeenCalledWith("date_of_test", {
      ascending: false,
    });
    expect(query.range).toHaveBeenCalledWith(0, 999);
  });

  it("rejects arbitrary result-filter columns before querying", async () => {
    await expect(
      quizResultsService.getDistinctValues("private_notes"),
    ).rejects.toThrow("Unsupported quiz-result filter column");
    expect(from).not.toHaveBeenCalled();
  });
});
