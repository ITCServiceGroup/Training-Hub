import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getLearnerQuiz, gradePracticeAttempt } = vi.hoisted(() => ({
  getLearnerQuiz: vi.fn(),
  gradePracticeAttempt: vi.fn(),
}));

vi.mock("../../contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    themeColors: { primary: { light: "#2563eb", dark: "#60a5fa" } },
  }),
}));

vi.mock("../../services/api/quizzes", () => ({
  quizzesService: { getLearnerQuiz },
}));

vi.mock("../../services/api/quizResults", () => ({
  quizResultsService: {
    gradePracticeAttempt,
    submitOfficialAttempt: vi.fn(),
  },
}));

vi.mock("../../services/api/categories", () => ({
  categoriesService: { getById: vi.fn() },
}));

vi.mock("../../services/pdfService", () => ({
  pdfService: { uploadQuizResultsPDF: vi.fn() },
}));

import QuizTaker from "./QuizTaker";

const quiz = {
  id: "quiz-1",
  title: "Practice feedback fixture",
  description: "Regression coverage",
  is_practice: true,
  passing_score: 70,
  time_limit: null,
  questions: [
    {
      id: "question-1",
      question_text: "First practice question?",
      question_type: "multiple_choice",
      options: ["First answer", "Second answer"],
    },
    {
      id: "question-2",
      question_text: "Second practice question?",
      question_type: "true_false",
      options: [],
    },
  ],
};

describe("QuizTaker practice feedback", () => {
  beforeEach(() => {
    getLearnerQuiz.mockReset();
    gradePracticeAttempt.mockReset();
    getLearnerQuiz.mockResolvedValue(quiz);
  });

  it("restores immediate server-graded feedback and preserves it when navigating back", async () => {
    gradePracticeAttempt.mockResolvedValue({
      score: 0,
      correct: 0,
      total: 2,
      feedback: {
        "question-1": {
          correct_answer: 1,
          explanation: "The second answer is correct.",
          is_correct: false,
        },
      },
    });

    render(
      <MemoryRouter>
        <QuizTaker quizId="quiz-1" />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Practice feedback fixture")).toBeVisible();
    expect(
      screen.getByRole("checkbox", { name: /Disable Immediate Feedback/ }),
    ).not.toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Start Quiz" }));

    expect(await screen.findByText("First practice question?")).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "First answer" }));

    await waitFor(() =>
      expect(gradePracticeAttempt).toHaveBeenCalledWith({
        quizId: "quiz-1",
        answers: { "question-1": 0 },
      }),
    );
    expect(await screen.findByText("Incorrect")).toBeVisible();
    expect(screen.getByText("The second answer is correct.")).toBeVisible();

    const nextButton = screen.getByRole("button", { name: "Next" });
    expect(nextButton).toBeEnabled();
    fireEvent.click(nextButton);
    expect(await screen.findByText("Second practice question?")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(await screen.findByText("Incorrect")).toBeVisible();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });
});
