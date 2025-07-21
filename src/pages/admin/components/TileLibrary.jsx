import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  AVAILABLE_TILES, 
  TILE_CATEGORIES, 
  getTilesByCategory, 
  searchTiles,
  getTilesByPopularity 
} from '../config/availableTiles';
import { 
  FaPlus, 
  FaSearch, 
  FaTimes, 
  FaFilter, 
  FaStar, 
  FaFire,
  FaLayerGroup,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';

const TileLibrary = ({ 
  currentTiles = [], 
  onAddTile, 
  onRemoveTile, 
  onClose 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('category'); // 'category', 'popular', 'search'
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  // Filter tiles based on current state
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
      tiles = tiles.filter(tile => !currentTiles.includes(tile.id));
    }
    
    return tiles;
  }, [searchQuery, selectedCategory, viewMode, currentTiles, showOnlyAvailable]);

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

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query.trim()) {
      setViewMode('search');
    } else {
      setViewMode('category');
    }
  };

  const handleAddTile = (tileId) => {
    onAddTile(tileId);
  };

  const handleRemoveTile = (tileId) => {
    onRemoveTile(tileId);
  };

  const isTileAdded = (tileId) => {
    return currentTiles.includes(tileId);
  };

  const TileCard = ({ tile }) => {
    const isAdded = isTileAdded(tile.id);
    const IconComponent = tile.icon;
    
    return (
      <div className={`p-4 rounded-lg border-2 transition-all duration-200 ${
        isAdded
          ? isDark 
            ? 'border-green-400 bg-green-900/30 shadow-lg shadow-green-500/20' 
            : 'border-green-500 bg-green-50 shadow-lg shadow-green-500/20'
          : isDark 
            ? 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500' 
            : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
      }`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isAdded
                ? isDark 
                  ? 'bg-green-700/50' 
                  : 'bg-green-100'
                : isDark 
                  ? 'bg-slate-600' 
                  : 'bg-slate-100'
            }`}>
              <IconComponent size={20} className={
                isAdded
                  ? isDark 
                    ? 'text-green-300' 
                    : 'text-green-700'
                  : isDark 
                    ? 'text-slate-300' 
                    : 'text-slate-600'
              } />
            </div>
            <div>
              <h3 className={`font-medium ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                {tile.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {tile.isCore && (
                  <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    <FaStar size={10} />
                    Core
                  </span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tile.size.w}×{tile.size.h}
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => isAdded ? handleRemoveTile(tile.id) : handleAddTile(tile.id)}
            className={`p-2 rounded-lg transition-colors ${
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
            {isAdded ? <FaTimes size={14} /> : <FaPlus size={14} />}
          </button>
        </div>
        
        <p className={`text-sm mb-3 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          {tile.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {tile.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className={`text-xs px-2 py-0.5 rounded ${
                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tag}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-1">
            <FaFire size={12} className="text-orange-500" />
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b ${
          isDark ? 'border-slate-600' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Tile Library
            </h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Add or remove charts from your dashboard • {currentTiles.length} tiles active
            </p>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark 
                ? 'hover:bg-slate-700 text-slate-400' 
                : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Controls */}
        <div className={`p-4 border-b ${
          isDark ? 'border-slate-600' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} size={14} />
              <input
                type="text"
                placeholder="Search tiles..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
            </div>
            
            {/* View Mode Toggle */}
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
            
            {/* Show Only Available Toggle */}
            <button
              onClick={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                showOnlyAvailable
                  ? isDark ? 'bg-green-700 text-green-200' : 'bg-green-100 text-green-700'
                  : isDark ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title={showOnlyAvailable ? 'Show all tiles' : 'Show only available tiles'}
            >
              {showOnlyAvailable ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
              Available Only
            </button>
          </div>
          
          {/* Category Filter (when in category mode) */}
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
                All Categories
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

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {viewMode === 'category' ? (
            // Category view
            <div className="space-y-8">
              {Object.values(tilesByCategory).map(({ category, tiles }) => {
                const IconComponent = category.icon;
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg" style={{ backgroundColor: `${category.color}20` }}>
                        <IconComponent size={20} style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          isDark ? 'text-white' : 'text-slate-900'
                        }`}>
                          {category.name}
                        </h3>
                        <p className={`text-sm ${
                          isDark ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                          {category.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tiles.map(tile => (
                        <TileCard key={tile.id} tile={tile} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // List view (popular or search)
            <div>
              {viewMode === 'popular' && (
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Most Popular Tiles
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Tiles ranked by usage and user preference
                  </p>
                </div>
              )}
              
              {viewMode === 'search' && (
                <div className="mb-6">
                  <h3 className={`text-lg font-semibold mb-2 ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    Search Results
                  </h3>
                  <p className={`text-sm ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {filteredTiles.length} tiles found for "{searchQuery}"
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTiles.map(tile => (
                  <TileCard key={tile.id} tile={tile} />
                ))}
              </div>
            </div>
          )}
          
          {filteredTiles.length === 0 && (
            <div className="text-center py-12">
              <div className={`text-slate-500 dark:text-slate-400 mb-4`}>
                {viewMode === 'search' 
                  ? `No tiles found for "${searchQuery}"`
                  : showOnlyAvailable 
                    ? 'All available tiles have been added'
                    : 'No tiles available'
                }
              </div>
              {viewMode === 'search' && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setViewMode('category');
                  }}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    isDark 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }`}
                >
                  Browse All Tiles
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TileLibrary;
