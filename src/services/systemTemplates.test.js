import { describe, expect, it } from "vitest";
import { systemTemplatesService } from "./systemTemplates";
import { validateSystemTemplate } from "../data/templateContract";

describe("systemTemplatesService", () => {
  it("lists lightweight metadata without eagerly attaching generated content", async () => {
    const templates = await systemTemplatesService.getAll();

    expect(templates).toHaveLength(12);
    expect(templates.every((template) => template.isSystemTemplate)).toBe(true);
    expect(templates.every((template) => template.content === undefined)).toBe(
      true,
    );
    expect(
      templates.every((template) => typeof template.loadContent === "function"),
    ).toBe(true);
  });

  it("loads one complete template by id on demand", async () => {
    const template = await systemTemplatesService.getById(
      "system-interactive-learning",
    );

    expect(template.id).toBe("system-interactive-learning");
    expect(template.content).toContain("Interactive Study Guide");
  });

  it("returns null for an unknown system template", async () => {
    await expect(
      systemTemplatesService.getById("system-missing"),
    ).resolves.toBeNull();
  });

  it("rejects malformed generated content", () => {
    expect(() =>
      validateSystemTemplate({
        id: "system-invalid",
        name: "Invalid",
        description: "Invalid template fixture",
        category: "Test",
        tags: ["test"],
        isSystemTemplate: true,
        content: "{not-json}",
      }),
    ).toThrow("valid JSON");
  });
});
