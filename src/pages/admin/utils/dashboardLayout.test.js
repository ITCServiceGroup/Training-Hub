import { describe, expect, it } from "vitest";
import {
  appendTileToDashboard,
  repairCollapsedDashboardTiles,
  tileConfigsToGridLayout,
} from "./dashboardLayout";
import { AVAILABLE_TILES } from "../config/availableTiles";

const hasCollisions = (layout) => {
  const occupied = new Set();

  for (const tile of layout) {
    for (let y = tile.y; y < tile.y + tile.h; y += 1) {
      for (let x = tile.x; x < tile.x + tile.w; x += 1) {
        const key = `${x}:${y}`;
        if (occupied.has(key)) return true;
        occupied.add(key);
      }
    }
  }

  return false;
};

describe("dashboard layout repair", () => {
  const collapsedTiles = [
    "score-distribution",
    "score-trend",
    "time-distribution",
    "supervisor-performance",
    "pass-fail-rate",
    "market-results",
  ].map((id, index) => ({
    id,
    position: { x: 0, y: index },
    size: { w: 1, h: 1 },
  }));

  it("repairs a clearly collapsed large dashboard without collisions", () => {
    const repaired = repairCollapsedDashboardTiles(collapsedTiles);
    const layout = tileConfigsToGridLayout(repaired);

    expect(repaired).not.toBe(collapsedTiles);
    expect(new Set(layout.map((tile) => tile.x)).size).toBeGreaterThan(1);
    expect(
      layout.find((tile) => tile.i === "score-trend").w,
    ).toBeGreaterThanOrEqual(2);
    expect(hasCollisions(layout)).toBe(false);
  });

  it("preserves a deliberately arranged dashboard", () => {
    const arranged = [
      "score-distribution",
      "time-distribution",
      "supervisor-performance",
      "pass-fail-rate",
      "market-results",
      "quiz-type-performance",
    ].map((id, index) => ({
      id,
      position: { x: index % 3, y: Math.floor(index / 3) },
      size: { w: 1, h: 1 },
    }));

    expect(repairCollapsedDashboardTiles(arranged)).toBe(arranged);
  });

  it("places newly added charts in a valid packed layout", () => {
    const updated = appendTileToDashboard(
      collapsedTiles.slice(0, 2),
      "time-vs-score",
    );
    const layout = tileConfigsToGridLayout(updated);

    expect(updated).toHaveLength(3);
    expect(
      layout.find((tile) => tile.i === "time-vs-score").w,
    ).toBeGreaterThanOrEqual(2);
    expect(hasCollisions(layout)).toBe(false);
  });

  it("preserves existing positions when adding to a valid layout", () => {
    const arranged = [
      {
        id: "score-distribution",
        position: { x: 2, y: 0 },
        size: { w: 1, h: 1 },
      },
    ];

    const updated = appendTileToDashboard(arranged, "time-vs-score");

    expect(updated[0]).toEqual(arranged[0]);
    expect(updated[1].position).toEqual({ x: 0, y: 0 });
  });

  it("packs legacy tile ID lists without overlapping wide charts", () => {
    const layout = tileConfigsToGridLayout([
      "score-distribution",
      "score-trend",
      "time-distribution",
      "time-vs-score",
    ]);

    expect(layout).toHaveLength(4);
    expect(hasCollisions(layout)).toBe(false);
  });

  it.each(Object.keys(AVAILABLE_TILES))(
    "allows %s to span the full three-column desktop grid",
    (tileId) => {
      const [layoutItem] = tileConfigsToGridLayout([
        {
          id: tileId,
          position: { x: 0, y: 0 },
          size: { w: 3, h: 1 },
        },
      ]);

      expect(layoutItem.w).toBe(3);
      expect(layoutItem.maxW).toBe(3);
    },
  );
});
