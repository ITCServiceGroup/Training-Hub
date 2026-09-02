import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AppErrorBoundary from "./AppErrorBoundary";

const BrokenChild = () => {
  throw new Error("Sensitive internal detail");
};

describe("AppErrorBoundary", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("contains render failures and provides a correlation reference", () => {
    render(
      <AppErrorBoundary>
        <BrokenChild />
      </AppErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "Training Hub could not load" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Reference:/)).toBeInTheDocument();
    expect(
      screen.queryByText(/Sensitive internal detail/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Reload Training Hub" }),
    ).toBeInTheDocument();
  });
});
