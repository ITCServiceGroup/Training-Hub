import { describe, expect, it } from "vitest";
import { buildSafeErrorEvent } from "./safeTelemetry";

describe("safeTelemetry", () => {
  it("does not include error messages, stacks, payloads, or identity fields", () => {
    const error = Object.assign(new Error("employee@example.com token-value"), {
      payload: { answers: ["secret"] },
      userId: "employee-id",
    });

    const event = buildSafeErrorEvent(
      "application.render_failure",
      error,
      "reference-id",
    );

    expect(event).toMatchObject({
      event: "application.render_failure",
      correlationId: "reference-id",
      errorType: "Error",
    });
    expect(JSON.stringify(event)).not.toMatch(
      /employee@example|token-value|secret|employee-id|stack|message|payload/i,
    );
  });

  it("normalizes unsafe event names", () => {
    const error = new Error("safe message is not emitted");
    error.name = "employee@example.com";
    const event = buildSafeErrorEvent(
      "employee@example.com logged in",
      error,
      "employee@example.com",
    );

    expect(event.event).toBe("application.error");
    expect(event.errorType).toBe("Error");
    expect(event.correlationId).not.toContain("@");
  });
});
