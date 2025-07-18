import { useState, useCallback, useEffect } from 'react';
import { 
  AVAILABLE_TILES, 
  DEFAULT_DASHBOARD_TILES,
  getTileById,
  validateTileConfiguration 
} from '../config/availableTiles';

export const useTileLibrary = (initialTiles = DEFAULT_DASHBOARD_TILES) => {
  const [activeTiles, setActiveTiles] = useState(initialTiles);
  const [tileConfigurations, setTileConfigurations] = useState({});

  // Initialize tile configurations
  useEffect(() => {
    const configs = {};
    activeTiles.forEach(tileId => {
      const tile = getTileById(tileId);
      if (tile) {
        configs[tileId] = {
          id: tileId,
          size: { ...tile.size },
          position: { x: 0, y: 0 },
          priority: 0
        };
      }
    });
    setTileConfigurations(configs);
  }, [activeTiles]);

  // Add a tile to the dashboard
  const addTile = useCallback((tileId) => {
    const tile = getTileById(tileId);
    if (!tile) {
      console.warn(`Tile with ID "${tileId}" not found`);
      return false;
    }

    if (activeTiles.includes(tileId)) {
      console.warn(`Tile "${tileId}" is already active`);
      return false;
    }

    setActiveTiles(prev => [...prev, tileId]);
    
    // Add default configuration for the new tile
    setTileConfigurations(prev => ({
      ...prev,
      [tileId]: {
        id: tileId,
        size: { ...tile.size },
        position: { x: 0, y: 0 },
        priority: activeTiles.length
      }
    }));

    console.log(`✅ Added tile: ${tile.name}`);
    return true;
  }, [activeTiles]);

  // Remove a tile from the dashboard
  const removeTile = useCallback((tileId) => {
    if (!activeTiles.includes(tileId)) {
      console.warn(`Tile "${tileId}" is not active`);
      return false;
    }

    setActiveTiles(prev => prev.filter(id => id !== tileId));
    
    // Remove tile configuration
    setTileConfigurations(prev => {
      const newConfigs = { ...prev };
      delete newConfigs[tileId];
      return newConfigs;
    });

    const tile = getTileById(tileId);
    console.log(`🗑️ Removed tile: ${tile?.name || tileId}`);
    return true;
  }, [activeTiles]);

  // Reorder tiles
  const reorderTiles = useCallback((newOrder) => {
    // Validate that all tiles in newOrder exist in activeTiles
    const validOrder = newOrder.filter(tileId => activeTiles.includes(tileId));
    
    if (validOrder.length !== activeTiles.length) {
      console.warn('Invalid tile order provided');
      return false;
    }

    setActiveTiles(validOrder);
    
    // Update priorities in configurations
    setTileConfigurations(prev => {
      const newConfigs = { ...prev };
      validOrder.forEach((tileId, index) => {
        if (newConfigs[tileId]) {
          newConfigs[tileId].priority = index;
        }
      });
      return newConfigs;
    });

    return true;
  }, [activeTiles]);

  // Update tile configuration (size, position, etc.)
  const updateTileConfig = useCallback((tileId, updates) => {
    if (!activeTiles.includes(tileId)) {
      console.warn(`Cannot update config for inactive tile: ${tileId}`);
      return false;
    }

    const currentConfig = tileConfigurations[tileId];
    const newConfig = { ...currentConfig, ...updates };
    
    // Validate the new configuration
    const validation = validateTileConfiguration(newConfig);
    if (!validation.isValid) {
      console.warn(`Invalid tile configuration: ${validation.errors.join(', ')}`);
      return false;
    }

    setTileConfigurations(prev => ({
      ...prev,
      [tileId]: newConfig
    }));

    return true;
  }, [activeTiles, tileConfigurations]);

  // Get tile configuration
  const getTileConfig = useCallback((tileId) => {
    return tileConfigurations[tileId] || null;
  }, [tileConfigurations]);

  // Get all active tile data with configurations
  const getActiveTilesWithConfig = useCallback(() => {
    return activeTiles.map(tileId => {
      const tile = getTileById(tileId);
      const config = tileConfigurations[tileId];
      return {
        ...tile,
        config
      };
    }).filter(Boolean);
  }, [activeTiles, tileConfigurations]);

  // Check if a tile is active
  const isTileActive = useCallback((tileId) => {
    return activeTiles.includes(tileId);
  }, [activeTiles]);

  // Get available tiles (not currently active)
  const getAvailableTiles = useCallback(() => {
    return Object.values(AVAILABLE_TILES).filter(tile => !activeTiles.includes(tile.id));
  }, [activeTiles]);

  // Reset to default tiles
  const resetToDefault = useCallback(() => {
    setActiveTiles(DEFAULT_DASHBOARD_TILES);
  }, []);

  // Clear all tiles
  const clearAllTiles = useCallback(() => {
    setActiveTiles([]);
    setTileConfigurations({});
  }, []);

  // Load tiles from a saved layout
  const loadTilesFromLayout = useCallback((layoutTiles) => {
    if (!Array.isArray(layoutTiles)) {
      console.warn('Invalid layout tiles format');
      return false;
    }

    const validTiles = layoutTiles.filter(tileData => {
      const tileId = typeof tileData === 'string' ? tileData : tileData.id;
      return getTileById(tileId);
    });

    const tileIds = validTiles.map(tileData => 
      typeof tileData === 'string' ? tileData : tileData.id
    );

    setActiveTiles(tileIds);

    // Set configurations from layout data
    const configs = {};
    validTiles.forEach((tileData, index) => {
      const tileId = typeof tileData === 'string' ? tileData : tileData.id;
      const tile = getTileById(tileId);
      
      if (tile) {
        configs[tileId] = {
          id: tileId,
          size: tileData.size || { ...tile.size },
          position: tileData.position || { x: 0, y: 0 },
          priority: tileData.priority || index
        };
      }
    });

    setTileConfigurations(configs);
    return true;
  }, []);

  // Export current state for saving
  const exportTileState = useCallback(() => {
    return {
      tiles: activeTiles,
      configurations: tileConfigurations
    };
  }, [activeTiles, tileConfigurations]);

  // Get statistics
  const getStats = useCallback(() => {
    const totalAvailable = Object.keys(AVAILABLE_TILES).length;
    const coreActive = activeTiles.filter(tileId => {
      const tile = getTileById(tileId);
      return tile?.isCore;
    }).length;

    return {
      active: activeTiles.length,
      available: totalAvailable - activeTiles.length,
      total: totalAvailable,
      coreActive,
      utilizationPercent: Math.round((activeTiles.length / totalAvailable) * 100)
    };
  }, [activeTiles]);

  // Bulk operations
  const addMultipleTiles = useCallback((tileIds) => {
    let addedCount = 0;
    tileIds.forEach(tileId => {
      if (addTile(tileId)) {
        addedCount++;
      }
    });
    return addedCount;
  }, [addTile]);

  const removeMultipleTiles = useCallback((tileIds) => {
    let removedCount = 0;
    tileIds.forEach(tileId => {
      if (removeTile(tileId)) {
        removedCount++;
      }
    });
    return removedCount;
  }, [removeTile]);

  return {
    // State
    activeTiles,
    tileConfigurations,
    
    // Actions
    addTile,
    removeTile,
    reorderTiles,
    updateTileConfig,
    resetToDefault,
    clearAllTiles,
    loadTilesFromLayout,
    
    // Bulk actions
    addMultipleTiles,
    removeMultipleTiles,
    
    // Getters
    getTileConfig,
    getActiveTilesWithConfig,
    isTileActive,
    getAvailableTiles,
    getStats,
    exportTileState
  };
};

export default useTileLibrary;
