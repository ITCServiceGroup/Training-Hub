import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../contexts/ThemeContext", () => ({
  useTheme: () => ({ theme: "light" }),
}));

vi.mock("./charts/ScoreDistributionChart", () => ({
  default: ({ data }) => (
    <div data-testid="score-chart">{data.length} results</div>
  ),
}));

import LazyChartLoader from "./LazyChartLoader";

describe("LazyChartLoader", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads charts when IntersectionObserver is unavailable", async () => {
    vi.stubGlobal("IntersectionObserver", undefined);

    const { container } = render(
      <LazyChartLoader
        chartId="score-distribution"
        chartProps={{ data: [{ id: 1 }] }}
      />,
    );

    expect(await screen.findByTestId("score-chart")).toHaveTextContent(
      "1 results",
    );
    expect(container.firstChild).toHaveClass("h-full", "min-h-0", "w-full");
  });

  it("loads immediately without waiting for an intersection callback", async () => {
    const observe = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      vi.fn(() => ({ observe, disconnect: vi.fn() })),
    );

    render(
      <LazyChartLoader
        chartId="score-distribution"
        chartProps={{ data: [{ id: 1 }, { id: 2 }] }}
        loadImmediately
      />,
    );

    expect(await screen.findByTestId("score-chart")).toHaveTextContent(
      "2 results",
    );
  });
});
