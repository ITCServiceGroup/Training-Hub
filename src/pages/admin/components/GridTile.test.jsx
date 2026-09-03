import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AVAILABLE_TILES } from "../config/availableTiles";

vi.mock("./DashboardTile", () => ({
  default: ({ children }) => <section>{children}</section>,
}));

vi.mock("./LazyChartLoader", () => ({
  default: ({ chartId, chartProps, loadImmediately, fillContainer }) => (
    <div
      data-testid={`chart-${chartId}`}
      data-result-count={chartProps.data.length}
      data-load-immediately={String(loadImmediately)}
      data-fill-container={String(fillContainer)}
    />
  ),
}));

import { GridTile } from "./GridTile";

describe("GridTile chart loading contract", () => {
  it.each(Object.keys(AVAILABLE_TILES))(
    "loads the %s chart immediately",
    (tileId) => {
      const chartId =
        tileId === "question-level-analytics" ? "question-analytics" : tileId;

      render(
        <GridTile
          tileId={tileId}
          tileData={[{ id: 1 }]}
          tileConfig={{}}
          isInitialLoad={false}
          loading={false}
          error={null}
          globalFilters={{}}
          hasCustomFilters={false}
          onFilterClick={vi.fn()}
          onRefresh={vi.fn()}
        />,
      );

      const chart = screen.getByTestId(`chart-${chartId}`);
      expect(chart).toHaveAttribute("data-load-immediately", "true");
      expect(chart).toHaveAttribute("data-fill-container", "true");
      expect(chart).toHaveAttribute("data-result-count", "1");
    },
  );
});
