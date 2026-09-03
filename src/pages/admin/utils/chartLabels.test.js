import { describe, expect, it } from "vitest";
import { truncateChartLabel } from "./chartLabels";

describe("chart label formatting", () => {
  it("preserves short labels", () => {
    expect(truncateChartLabel("Austin", 12)).toBe("Austin");
  });

  it("keeps long labels inside the requested width", () => {
    const formatted = truncateChartLabel(
      "What are the advantages of a static IP?",
      18,
    );

    expect(formatted).toHaveLength(18);
    expect(formatted.endsWith("…")).toBe(true);
  });

  it("handles missing and extremely narrow labels safely", () => {
    expect(truncateChartLabel(null)).toBe("");
    expect(truncateChartLabel("Long", 1)).toBe("…");
  });
});
