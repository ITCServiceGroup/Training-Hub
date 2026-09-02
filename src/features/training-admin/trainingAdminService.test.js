import { beforeEach, describe, expect, it, vi } from "vitest";

const { rpc } = vi.hoisted(() => ({ rpc: vi.fn() }));

vi.mock("../../config/supabase", () => ({
  supabase: { rpc, from: vi.fn() },
}));

import { trainingAdminService } from "./trainingAdminService";

describe("trainingAdminService", () => {
  beforeEach(() => rpc.mockReset());

  it("restores a prior content version through the audited RPC", async () => {
    rpc.mockResolvedValueOnce({
      data: { id: "version-1", status: "published" },
      error: null,
    });

    await expect(
      trainingAdminService.republishContentVersion(
        "version-1",
        "Rollback after a production content defect",
      ),
    ).resolves.toMatchObject({ status: "published" });

    expect(rpc).toHaveBeenCalledWith("republish_content_version", {
      p_content_version_id: "version-1",
      p_reason: "Rollback after a production content defect",
      p_effective_at: expect.any(String),
    });
  });
});
