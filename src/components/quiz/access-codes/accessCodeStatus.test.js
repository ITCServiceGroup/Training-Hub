import { describe, expect, it } from "vitest";
import { getAccessCodeStatus } from "./accessCodeStatus";

const now = new Date("2026-09-03T12:00:00Z");

describe("getAccessCodeStatus", () => {
  it("uses one consistent precedence for retained code history", () => {
    expect(
      getAccessCodeStatus(
        {
          revoked_at: "2026-09-03T11:00:00Z",
          is_used: true,
          expires_at: "2026-09-02T12:00:00Z",
        },
        now,
      ),
    ).toBe("revoked");
    expect(
      getAccessCodeStatus(
        { is_used: true, expires_at: "2026-09-02T12:00:00Z" },
        now,
      ),
    ).toBe("used");
    expect(
      getAccessCodeStatus(
        { is_used: false, expires_at: "2026-09-02T12:00:00Z" },
        now,
      ),
    ).toBe("expired");
    expect(
      getAccessCodeStatus(
        { is_used: false, expires_at: "2026-09-04T12:00:00Z" },
        now,
      ),
    ).toBe("unused");
  });
});
