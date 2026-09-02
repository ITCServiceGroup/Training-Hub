import { beforeEach, describe, expect, it, vi } from "vitest";

const { authGetUser, databaseFrom, storageFrom, upload, remove, getPublicUrl } =
  vi.hoisted(() => ({
    authGetUser: vi.fn(),
    databaseFrom: vi.fn(),
    storageFrom: vi.fn(),
    upload: vi.fn(),
    remove: vi.fn(),
    getPublicUrl: vi.fn(),
  }));

vi.mock("../../config/supabase", () => ({
  supabase: {
    auth: { getUser: authGetUser },
    from: databaseFrom,
    storage: { from: storageFrom },
  },
}));

import { uploadMedia } from "./media";

describe("media upload boundary", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    authGetUser.mockReset();
    databaseFrom.mockReset();
    storageFrom.mockReset();
    upload.mockReset();
    remove.mockReset();
    getPublicUrl.mockReset();
    storageFrom.mockReturnValue({ upload, remove, getPublicUrl });
  });

  it("rejects unsupported file formats before contacting authentication or storage", async () => {
    const file = new File(["payload"], "payload.svg", {
      type: "image/svg+xml",
    });

    await expect(uploadMedia(file, "user-1")).rejects.toThrow(
      "Unsupported media type or file size.",
    );
    expect(authGetUser).not.toHaveBeenCalled();
    expect(upload).not.toHaveBeenCalled();
  });

  it("uses authenticated ownership, a MIME-derived path, and regional metadata", async () => {
    const profileQuery = {
      select: vi.fn(),
      eq: vi.fn(),
      single: vi.fn(),
    };
    profileQuery.select.mockReturnValue(profileQuery);
    profileQuery.eq.mockReturnValue(profileQuery);
    profileQuery.single.mockResolvedValue({
      data: {
        user_id: "user-1",
        role: "supervisor",
        market_id: 7,
        is_active: true,
      },
      error: null,
    });

    const insertQuery = {
      insert: vi.fn(),
      select: vi.fn(),
      single: vi.fn(),
    };
    insertQuery.insert.mockReturnValue(insertQuery);
    insertQuery.select.mockReturnValue(insertQuery);
    insertQuery.single.mockResolvedValue({
      data: { id: "media-1" },
      error: null,
    });
    databaseFrom.mockImplementation((table) =>
      table === "user_profiles" ? profileQuery : insertQuery,
    );

    authGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
      error: null,
    });
    upload.mockImplementation(async (path) => ({
      data: { path },
      error: null,
    }));
    getPublicUrl.mockImplementation((path) => ({
      data: { publicUrl: `https://media/${path}` },
    }));
    vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(
      "00000000-0000-4000-8000-000000000001",
    );

    const file = new File(["jpeg"], "employee-photo.exe", {
      type: "image/jpeg",
    });
    await expect(
      uploadMedia(file, "user-1", { alt_text: "  Employee portrait  " }),
    ).resolves.toEqual({ id: "media-1" });

    const expectedPath = "user-1/00000000-0000-4000-8000-000000000001.jpg";
    expect(upload).toHaveBeenCalledWith(expectedPath, file, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        uploaded_by: "user-1",
        created_by: "user-1",
        market_id: 7,
        is_nationwide: false,
        storage_path: expectedPath,
        alt_text: "Employee portrait",
      }),
    );
  });
});
