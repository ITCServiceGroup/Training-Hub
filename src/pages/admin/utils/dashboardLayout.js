import { AVAILABLE_TILES } from "../config/availableTiles";

const COLUMN_COUNT = 3;

const getTileDefinition = (tileId) =>
  AVAILABLE_TILES[
    tileId === "question-level-analytics" ? "question-analytics" : tileId
  ];

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export const getTileSize = (tile) => {
  const tileId = typeof tile === "string" ? tile : tile.id;
  const definition = getTileDefinition(tileId);
  const storedWidth =
    typeof tile === "string" ? undefined : (tile.size?.w ?? tile.position?.w);
  const storedHeight =
    typeof tile === "string" ? undefined : (tile.size?.h ?? tile.position?.h);
  const minimumWidth = definition?.minSize?.w ?? 1;
  const maximumWidth = Math.min(
    definition?.maxSize?.w ?? COLUMN_COUNT,
    COLUMN_COUNT,
  );
  const minimumHeight = definition?.minSize?.h ?? 1;
  const maximumHeight = definition?.maxSize?.h ?? 2;

  return {
    w: clamp(
      storedWidth ?? definition?.size?.w ?? 1,
      minimumWidth,
      maximumWidth,
    ),
    h: clamp(
      storedHeight ?? definition?.size?.h ?? 1,
      minimumHeight,
      maximumHeight,
    ),
    minW: minimumWidth,
    maxW: maximumWidth,
    minH: minimumHeight,
    maxH: maximumHeight,
  };
};

const occupies = (occupied, x, y, width, height) => {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      if (occupied.has(`${column}:${row}`)) return true;
    }
  }
  return false;
};

const markOccupied = (occupied, x, y, width, height) => {
  for (let row = y; row < y + height; row += 1) {
    for (let column = x; column < x + width; column += 1) {
      occupied.add(`${column}:${row}`);
    }
  }
};

const findOpenPosition = (occupied, width, height) => {
  for (let row = 0; ; row += 1) {
    for (let column = 0; column <= COLUMN_COUNT - width; column += 1) {
      if (!occupies(occupied, column, row, width, height)) {
        return { x: column, y: row };
      }
    }
  }
};

export const packDashboardTiles = (tiles) => {
  const occupied = new Set();

  return tiles.map((tile, index) => {
    const tileId = typeof tile === "string" ? tile : tile.id;
    const size = getTileSize(tile);
    const position = findOpenPosition(occupied, size.w, size.h);
    markOccupied(occupied, position.x, position.y, size.w, size.h);

    return {
      ...(typeof tile === "string" ? {} : tile),
      id: tileId,
      position,
      size: { w: size.w, h: size.h },
      priority:
        typeof tile === "string" ? index + 1 : (tile.priority ?? index + 1),
      isVisible: typeof tile === "string" ? true : (tile.isVisible ?? true),
      config: typeof tile === "string" ? {} : (tile.config ?? {}),
      customSettings:
        typeof tile === "string" ? {} : (tile.customSettings ?? {}),
    };
  });
};

export const repairCollapsedDashboardTiles = (tiles) => {
  if (!Array.isArray(tiles) || tiles.length < 6) return tiles;

  const isSingleColumnStack = tiles.every((tile, index) => {
    if (typeof tile === "string") return false;
    const x = Number.isFinite(tile.position?.x) ? tile.position.x : 0;
    const y = Number.isFinite(tile.position?.y) ? tile.position.y : index;
    return x === 0 && y >= index;
  });

  return isSingleColumnStack ? packDashboardTiles(tiles) : tiles;
};

const needsMinimumSizeRepair = (tiles) =>
  tiles.some((tile) => {
    if (typeof tile === "string") return true;
    const definition = getTileDefinition(tile.id);
    const storedWidth = tile.size?.w ?? tile.position?.w ?? 1;
    const storedHeight = tile.size?.h ?? tile.position?.h ?? 1;
    return (
      storedWidth < (definition?.minSize?.w ?? 1) ||
      storedHeight < (definition?.minSize?.h ?? 1)
    );
  });

const normalizeDashboardTiles = (tiles) => {
  if (
    tiles.some((tile) => typeof tile === "string") ||
    needsMinimumSizeRepair(tiles)
  ) {
    return packDashboardTiles(tiles);
  }

  return repairCollapsedDashboardTiles(tiles);
};

export const appendTileToDashboard = (tiles, tileId) => {
  const normalizedTiles = normalizeDashboardTiles(tiles);
  const occupied = new Set();

  normalizedTiles.forEach((tile) => {
    const size = getTileSize(tile);
    markOccupied(
      occupied,
      tile.position?.x ?? 0,
      tile.position?.y ?? 0,
      size.w,
      size.h,
    );
  });

  const size = getTileSize(tileId);
  const position = findOpenPosition(occupied, size.w, size.h);

  return [
    ...normalizedTiles,
    {
      id: tileId,
      position,
      size: { w: size.w, h: size.h },
      priority: normalizedTiles.length + 1,
      isVisible: true,
      config: {},
      customSettings: {},
    },
  ];
};

export const tileConfigsToGridLayout = (tileConfigs) => {
  if (!Array.isArray(tileConfigs)) return [];

  const normalizedTiles = normalizeDashboardTiles(tileConfigs);

  return normalizedTiles.map((tile) => {
    if (typeof tile === "string") {
      throw new Error(
        "Legacy tile IDs must be normalized before layout conversion",
      );
    }

    const size = getTileSize(tile);
    const x = Number.isFinite(tile.position?.x) ? tile.position.x : 0;
    const y = Number.isFinite(tile.position?.y) ? tile.position.y : 0;

    return {
      i: tile.id,
      x: clamp(x, 0, COLUMN_COUNT - size.w),
      y: Math.max(y, 0),
      ...size,
    };
  });
};
