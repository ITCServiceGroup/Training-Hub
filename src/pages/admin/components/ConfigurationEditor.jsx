/**
 * Unified Configuration Editor
 * 
 * Comprehensive editor that combines tile library, dashboard preview, 
 * and configuration settings in one interface
 */

import React, { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  AVAILABLE_TILES, 
  TILE_CATEGORIES, 
  getTilesByCategory, 
  searchTiles,
  getTilesByPopularity 
} from '../config/availableTiles';
import { validateConfiguration } from '../types/DashboardConfiguration';
import { 
  FaSave, 
  FaTimes, 
  FaSearch, 
  FaLayerGroup,
  FaFire,
  FaPlus,
  FaMinus,
  FaExpand,
  FaCompress,
  FaCog,
  FaEye,
  FaEdit,
  FaGripVertical
} from 'react-icons/fa';

const ConfigurationEditor = ({
  configuration,
  onSave,
  onCancel,
  onUpdateConfiguration,
  isLoading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('category'); // 'category', 'popular', 'search'
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Get current tiles in configuration
  const currentTileIds = useMemo(() => 
    configuration?.tiles?.map(tile => tile.id) || [],
    [configuration?.tiles]
  );

  // Filter available tiles
  const filteredTiles = useMemo(() => {
    let tiles = [];
    
    if (viewMode === 'search' && searchQuery) {
      tiles = searchTiles(searchQuery);
    } else if (viewMode === 'popular') {
      tiles = getTilesByPopularity();
    } else if (selectedCategory === 'all') {
      tiles = Object.values(AVAILABLE_TILES);
    } else {
      tiles = getTilesByCategory(selectedCategory);
    }
    
    // Filter out already added tiles if showOnlyAvailable is true
    if (showOnlyAvailable) {
      tiles = tiles.filter(tile => !currentTileIds.includes(tile.id));
    }
    
    return tiles;
  }, [searchQuery, selectedCategory, viewMode, currentTileIds, showOnlyAvailable]);

  // Group tiles by category for category view
  const tilesByCategory = useMemo(() => {
    if (viewMode !== 'category') return {};
    
    const grouped = {};
    Object.values(TILE_CATEGORIES).forEach(category => {
      const categoryTiles = filteredTiles.filter(tile => tile.category === category.id);
      if (categoryTiles.length > 0) {
        grouped[category.id] = {
          category,
          tiles: categoryTiles
        };
      }
    });
    return grouped;
  }, [filteredTiles, viewMode]);

  // Handle search
  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('category');
    }
  }, []);

  // Handle adding a tile
  const handleAddTile = useCallback((tileId) => {
    const tile = AVAILABLE_TILES[tileId];
    if (!tile || currentTileIds.includes(tileId)) return;

    const newTile = {
      id: tileId,
      position: { x: 0, y: 0 },
      size: { ...tile.size },
      priority: configuration.tiles.length,
      config: {},
      customSettings: {}
    };

    onUpdateConfiguration({
      tiles: [...configuration.tiles, newTile]
    });
  }, [configuration.tiles, currentTileIds, onUpdateConfiguration]);

  // Handle removing a tile
  const handleRemoveTile = useCallback((tileId) => {
    const updatedTiles = configuration.tiles.filter(tile => tile.id !== tileId);
    // Update priorities
    const reorderedTiles = updatedTiles.map((tile, index) => ({
      ...tile,
      priority: index
    }));

    onUpdateConfiguration({
      tiles: reorderedTiles
    });
  }, [configuration.tiles, onUpdateConfiguration]);

  // Handle configuration field updates
  const handleFieldUpdate = useCallback((field, value) => {
    onUpdateConfiguration({ [field]: value });
  }, [onUpdateConfiguration]);

  // Handle metadata updates
  const handleMetadataUpdate = useCallback((field, value) => {
    onUpdateConfiguration({
      metadata: {
        ...configuration.metadata,
        [field]: value
      }
    });
  }, [configuration.metadata, onUpdateConfiguration]);

  // Validate current configuration
  const validation = useMemo(() => 
    validateConfiguration(configuration),
    [configuration]
  );

  const TileCard = ({ tile, isAdded = false }) => {
    const IconComponent = tile.icon;
    
    return (
      <div className={`p-3 rounded-lg border transition-all duration-200 ${
        isAdded
          ? isDark 
            ? 'border-green-500 bg-green-900/20' 
            : 'border-green-500 bg-green-50'
          : isDark 
            ? 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500' 
            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded ${
              isDark ? 'bg-slate-600' : 'bg-slate-100'
            }`}>
              <IconComponent size={16} className={
                isDark ? 'text-slate-300' : 'text-slate-600'
              } />
            </div>
            <div>
              <h4 className={`font-medium text-sm ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {tile.name}
              </h4>
              <div className="flex items-center gap-1 mt-0.5">
                {tile.isCore && (
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    Core
                  </span>
                )}
                <span className={`text-xs px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tile.size.w}×{tile.size.h}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => isAdded ? handleRemoveTile(tile.id) : handleAddTile(tile.id)}
            className={`p-1.5 rounded transition-colors ${
              isAdded
                ? isDark 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-red-500 hover:bg-red-600 text-white'
                : isDark 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={isAdded ? 'Remove from dashboard' : 'Add to dashboard'}
          >
            {isAdded ? <FaMinus size={12} /> : <FaPlus size={12} />}
          </button>
        </div>
        
        <p className={`text-xs mb-2 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {tile.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tile.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className={`text-xs px-1.5 py-0.5 rounded ${
                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-1">
            <FaFire size={10} className="text-orange-500" />
            <span className={`text-xs ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>
              {tile.popularity}%
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-7xl h-[90vh] max-h-[800px] min-h-[600px] overflow-hidden rounded-lg shadow-xl flex flex-col ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b flex-shrink-0 ${
          isDark ? 'border-slate-600' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {configuration?.id ? 'Edit Configuration' : 'Create Configuration'}
            </h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {configuration?.name || 'New Configuration'} • {configuration?.tiles?.length || 0} tiles
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              disabled={!validation.isValid || isLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                validation.isValid && !isLoading
                  ? isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-slate-400 text-slate-600 cursor-not-allowed'
              }`}
            >
              <FaSave size={14} />
              {isLoading ? 'Saving...' : 'Save'}
            </button>
            
            <button
              onClick={onCancel}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
                  ? 'hover:bg-slate-700 text-slate-400' 
                  : 'hover:bg-slate-100 text-slate-600'
              }`}
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Dashboard Name & Description */}
              <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-600">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className={`block text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={configuration?.name || ''}
                      onChange={(e) => handleFieldUpdate('name', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="Enter dashboard name"
                      maxLength={100}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <label className={`block text-xs font-medium mb-1 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>
                      Description
                    </label>
                    <input
                      type="text"
                      value={configuration?.description || ''}
                      onChange={(e) => handleFieldUpdate('description', e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-slate-700 border-slate-600 text-white' 
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                      placeholder="Optional description"
                      maxLength={500}
                    />
                  </div>

                  {/* Validation Errors */}
                  {!validation.isValid && (
                    <div className="flex items-center">
                      <span className={`text-sm text-red-500 ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Fix: {validation.errors[0]}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Charts Section */}
              <div className="flex-1 flex overflow-hidden">
                {/* Chart Library */}
                <div className="w-1/2 border-r border-slate-200 dark:border-slate-600 flex flex-col">
                  {/* Chart Library Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-600">
                    <h4 className={`text-md font-medium mb-3 ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      Available Charts
                    </h4>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1 relative">
                        <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-slate-400' : 'text-slate-500'
                        }`} size={14} />
                        <input
                          type="text"
                          placeholder="Search charts..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                        }`}
                      />
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewMode('category')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          viewMode === 'category'
                            ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <FaLayerGroup size={14} />
                        Categories
                      </button>
                      
                      <button
                        onClick={() => setViewMode('popular')}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                          viewMode === 'popular'
                            ? isDark ? 'bg-orange-700 text-orange-200' : 'bg-orange-100 text-orange-700'
                            : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <FaFire size={14} />
                        Popular
                      </button>
                    </div>
                  </div>
                  
                  {/* Category Filter */}
                  {viewMode === 'category' && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setSelectedCategory('all')}
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          selectedCategory === 'all'
                            ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                            : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        All
                      </button>
                      
                      {Object.values(TILE_CATEGORIES).map(category => {
                        const IconComponent = category.icon;
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg transition-colors ${
                              selectedCategory === category.id
                                ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                                : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            <IconComponent size={12} />
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Tile Grid */}
                <div className="p-4 flex-1 overflow-y-auto">
                  {viewMode === 'category' ? (
                    <div className="space-y-6">
                      {Object.values(tilesByCategory).map(({ category, tiles }) => {
                        const IconComponent = category.icon;
                        return (
                          <div key={category.id}>
                            <div className="flex items-center gap-2 mb-3">
                              <div className="p-1.5 rounded" style={{ backgroundColor: `${category.color}20` }}>
                                <IconComponent size={16} style={{ color: category.color }} />
                              </div>
                              <h3 className={`font-medium ${
                                isDark ? 'text-white' : 'text-slate-900'
                              }`}>
                                {category.name}
                              </h3>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-3">
                              {tiles.map(tile => (
                                <TileCard 
                                  key={tile.id} 
                                  tile={tile} 
                                  isAdded={currentTileIds.includes(tile.id)}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {filteredTiles.map(tile => (
                        <TileCard 
                          key={tile.id} 
                          tile={tile} 
                          isAdded={currentTileIds.includes(tile.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Charts */}
              <div className="w-1/2 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-600 flex-shrink-0">
                  <h3 className={`font-medium ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Selected Charts
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {configuration?.tiles?.length || 0} charts selected
                  </p>
                </div>
                
                <div className="p-4 flex-1 overflow-y-auto">
                  {configuration?.tiles?.length > 0 ? (
                    <div className="space-y-3">
                      {configuration.tiles
                        .sort((a, b) => a.priority - b.priority)
                        .map((configTile, index) => {
                          const tile = AVAILABLE_TILES[configTile.id];
                          if (!tile) return null;
                          
                          return (
                            <div
                              key={configTile.id}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                isDark 
                                  ? 'border-slate-600 bg-slate-700/50' 
                                  : 'border-slate-200 bg-slate-50'
                              }`}
                            >
                              <FaGripVertical className={`${
                                isDark ? 'text-slate-400' : 'text-slate-500'
                              }`} size={12} />
                              
                              <div className={`p-1.5 rounded ${
                                isDark ? 'bg-slate-600' : 'bg-slate-100'
                              }`}>
                                {React.createElement(tile.icon, { 
                                  size: 16, 
                                  className: isDark ? 'text-slate-300' : 'text-slate-600' 
                                })}
                              </div>
                              
                              <div className="flex-1">
                                <h4 className={`font-medium text-sm ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {tile.name}
                                </h4>
                                <p className={`text-xs ${
                                  isDark ? 'text-slate-400' : 'text-slate-600'
                                }`}>
                                  {configTile.size.w}×{configTile.size.h} • Priority {configTile.priority + 1}
                                </p>
                              </div>
                              
                              <button
                                onClick={() => handleRemoveTile(configTile.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  isDark 
                                    ? 'text-slate-400 hover:text-red-400' 
                                    : 'text-slate-500 hover:text-red-500'
                                }`}
                              >
                                <FaTimes size={12} />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        No tiles selected. Add tiles from the library on the left.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationEditor;
