import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getByQuizId } = vi.hoisted(() => ({ getByQuizId: vi.fn() }));

vi.mock("../../../services/api/accessCodes", () => ({
  accessCodesService: { getByQuizId, delete: vi.fn() },
}));

vi.mock("../../../hooks/useDebounce", () => ({
  useDebounce: (value) => value,
}));

vi.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({
    theme: "light",
    themeColors: {
      primary: { light: "#2563eb", dark: "#60a5fa" },
      secondary: { light: "#10b981", dark: "#34d399" },
    },
  }),
}));

import AccessCodeList from "./AccessCodeList";

describe("AccessCodeList", () => {
  beforeEach(() => {
    getByQuizId.mockResolvedValue([
      {
        id: "used",
        code: "Issued once",
        ldap: "used-user",
        is_used: true,
        expires_at: "2020-01-01T00:00:00Z",
        created_at: "2020-01-01T00:00:00Z",
      },
      {
        id: "active",
        code: "Issued once",
        ldap: "active-user",
        is_used: false,
        expires_at: "2099-01-01T00:00:00Z",
        created_at: "2020-01-01T00:00:00Z",
      },
      {
        id: "expired",
        code: "Issued once",
        ldap: "expired-user",
        is_used: false,
        expires_at: "2020-01-01T00:00:00Z",
        created_at: "2020-01-01T00:00:00Z",
      },
      {
        id: "revoked",
        code: "Issued once",
        ldap: "revoked-user",
        is_used: true,
        revoked_at: "2026-01-01T00:00:00Z",
        expires_at: "2020-01-01T00:00:00Z",
        created_at: "2020-01-01T00:00:00Z",
      },
    ]);
  });

  it("keeps summary counts consistent with the displayed status badges", async () => {
    render(<AccessCodeList quizId="quiz-1" />);

    expect(await screen.findByText("Total: 4")).toBeVisible();
    expect(screen.getByText("Used: 1")).toBeVisible();
    expect(screen.getByText("Active: 1")).toBeVisible();
    expect(screen.getByText("Expired: 1")).toBeVisible();
    expect(screen.getByText("Revoked: 1")).toBeVisible();

    expect(screen.getAllByText("Used")).toHaveLength(2);
    expect(screen.getAllByText("Active")).toHaveLength(2);
    expect(screen.getAllByText("Expired")).toHaveLength(2);
    expect(screen.getAllByText("Revoked")).toHaveLength(2);
  });
});
