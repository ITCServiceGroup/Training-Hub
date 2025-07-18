/**
 * Configuration Gallery/Browser
 * 
 * Comprehensive interface for browsing all available configurations
 * with search, filters, and preview capabilities
 */

import React, { useState, useMemo } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CONFIGURATION_TYPES } from '../types/DashboardConfiguration';
import { AVAILABLE_TILES } from '../config/availableTiles';
import { 
  FaTimes, 
  FaSearch, 
  FaFilter,
  FaStar,
  FaRegStar,
  FaCopy,
  FaEdit,
  FaTrash,
  FaEye,
  FaUsers,
  FaUser,
  FaCog,
  FaChartBar,
  FaGraduationCap,
  FaTachometerAlt,
  FaLayerGroup,
  FaFire,
  FaClock
} from 'react-icons/fa';

const ConfigurationGallery = ({
  configurations = [],
  activeConfiguration,
  onConfigurationSelect,
  onEdit,
  onClone,
  onDelete,
  onSetDefault,
  onClose,
  loading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'system', 'user'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'updated', 'popularity', 'usage'
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list'

  // Get icon for configuration based on its content/category
  const getConfigurationIcon = (config) => {
    const category = config.metadata?.category;
    switch (category) {
      case 'executive': return FaTachometerAlt;
      case 'management': return FaUsers;
      case 'analytics': return FaChartBar;
      case 'training': return FaGraduationCap;
      case 'overview': return FaSearch;
      default: return config.type === CONFIGURATION_TYPES.SYSTEM ? FaCog : FaUser;
    }
  };

  // Filter and sort configurations
  const filteredConfigurations = useMemo(() => {
    let filtered = configurations.filter(config => {
      // Search filter
      const matchesSearch = !searchQuery || 
        config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        config.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Type filter
      const matchesType = selectedType === 'all' || config.type === selectedType;

      // Category filter
      const matchesCategory = selectedCategory === 'all' || config.metadata?.category === selectedCategory;

      return matchesSearch && matchesType && matchesCategory;
    });

    // Sort configurations
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'updated':
          return new Date(b.metadata?.updatedAt || b.updated_at || 0) - new Date(a.metadata?.updatedAt || a.updated_at || 0);
        case 'popularity':
          return (b.metadata?.popularity || 0) - (a.metadata?.popularity || 0);
        case 'usage':
          return (b.metadata?.usageCount || b.usage_count || 0) - (a.metadata?.usageCount || a.usage_count || 0);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [configurations, searchQuery, selectedType, selectedCategory, sortBy]);

  // Get unique categories from configurations
  const availableCategories = useMemo(() => {
    const categories = new Set();
    configurations.forEach(config => {
      if (config.metadata?.category) {
        categories.add(config.metadata.category);
      }
    });
    return Array.from(categories);
  }, [configurations]);

  const ConfigurationCard = ({ config }) => {
    const IconComponent = getConfigurationIcon(config);
    const isActive = activeConfiguration?.id === config.id;
    const isSystem = config.type === CONFIGURATION_TYPES.SYSTEM;
    const isDefault = config.isDefault || config.is_default;
    const tileCount = config.tiles?.length || 0;
    const popularity = config.metadata?.popularity || 0;
    const lastUsed = config.metadata?.lastUsedAt || config.last_used_at;

    return (
      <div
        className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
          isActive
            ? isDark ? 'border-blue-500 bg-blue-900/20' : 'border-blue-500 bg-blue-50'
            : isDark ? 'border-slate-600 bg-slate-700/50 hover:bg-slate-700 hover:border-slate-500' : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
        }`}
        onClick={() => {
          console.log('🔄 Applying configuration:', config.name, config.id);
          onConfigurationSelect(config.id);
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className={`p-2 rounded-lg ${
              isActive
                ? isDark ? 'bg-blue-800' : 'bg-blue-100'
                : isDark ? 'bg-slate-600' : 'bg-slate-100'
            }`}>
              <IconComponent size={20} className={
                isActive
                  ? isDark ? 'text-blue-300' : 'text-blue-600'
                  : isDark ? 'text-slate-300' : 'text-slate-600'
              } />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className={`font-medium truncate ${
                  isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {config.name}
                </h3>
                {isDefault && <FaStar className="text-yellow-500" size={12} />}
                {isSystem && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}>
                    System
                  </span>
                )}
              </div>
              
              {config.description && (
                <p className={`text-sm text-slate-500 dark:text-slate-400 line-clamp-2`}>
                  {config.description}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onConfigurationSelect(config.id);
              }}
              className={`p-2 rounded transition-colors ${
                isActive
                  ? isDark ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Apply configuration"
            >
              <FaEye size={14} />
            </button>
            
            {!isSystem && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(config.id);
                  }}
                  className={`p-2 rounded transition-colors ${
                    isDefault
                      ? 'text-yellow-500'
                      : isDark ? 'text-slate-400 hover:text-yellow-500' : 'text-slate-500 hover:text-yellow-500'
                  }`}
                  title={isDefault ? 'Default configuration' : 'Set as default'}
                >
                  {isDefault ? <FaStar size={14} /> : <FaRegStar size={14} />}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(config.id);
                  }}
                  className={`p-2 rounded transition-colors ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="Edit configuration"
                >
                  <FaEdit size={14} />
                </button>
              </>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone(config.id, `${config.name} (Copy)`);
              }}
              className={`p-2 rounded transition-colors ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
              title="Clone configuration"
            >
              <FaCopy size={14} />
            </button>

            {!isSystem && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(config.id);
                }}
                className={`p-2 rounded transition-colors ${
                  isDark ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-500'
                }`}
                title="Delete configuration"
              >
                <FaTrash size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Metadata */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className={`flex items-center gap-1 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                <FaLayerGroup size={12} />
                {tileCount} tiles
              </span>
              
              {popularity > 0 && (
                <span className={`flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <FaFire size={12} />
                  {popularity}%
                </span>
              )}
              
              {lastUsed && (
                <span className={`flex items-center gap-1 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  <FaClock size={12} />
                  {new Date(lastUsed).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Tags */}
          {config.metadata?.tags && config.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {config.metadata.tags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className={`text-xs px-2 py-0.5 rounded ${
                    isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tag}
                </span>
              ))}
              {config.metadata.tags.length > 3 && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  +{config.metadata.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Tile Preview */}
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {config.tiles?.slice(0, 6).map(tile => {
                const tileInfo = AVAILABLE_TILES[tile.id];
                if (!tileInfo) return null;
                
                const TileIcon = tileInfo.icon;
                return (
                  <div
                    key={tile.id}
                    className={`p-1 rounded ${
                      isDark ? 'bg-slate-600' : 'bg-slate-100'
                    }`}
                    title={tileInfo.name}
                  >
                    <TileIcon size={12} className={
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    } />
                  </div>
                );
              })}
              {config.tiles?.length > 6 && (
                <div className={`px-2 py-1 rounded text-xs ${
                  isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
                }`}>
                  +{config.tiles.length - 6}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className={`w-full max-w-7xl h-[90vh] max-h-[800px] min-h-[500px] overflow-hidden rounded-lg shadow-xl flex flex-col ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-6 border-b flex-shrink-0 ${
          isDark ? 'border-slate-600' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-2xl font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Configuration Gallery
            </h2>
            <p className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              Browse and manage all dashboard configurations • {filteredConfigurations.length} of {configurations.length} shown
            </p>
          </div>
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
            }`}
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Filters and Controls */}
        <div className={`p-4 border-b flex-shrink-0 ${
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
                placeholder="Search configurations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
            </div>
            
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">All Types</option>
              <option value="system">System</option>
              <option value="user">User</option>
            </select>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="all">All Categories</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-3 py-2 rounded-lg border ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            >
              <option value="name">Sort by Name</option>
              <option value="updated">Sort by Updated</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="usage">Sort by Usage</option>
            </select>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="p-6 flex-1 overflow-y-auto">
          {filteredConfigurations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredConfigurations.map(config => (
                <ConfigurationCard key={config.id} config={config} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FaSearch size={48} className={`mx-auto mb-4 ${
                isDark ? 'text-slate-600' : 'text-slate-400'
              }`} />
              <h3 className={`text-lg font-medium mb-2 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                No Configurations Found
              </h3>
              <p className={`text-sm ${
                isDark ? 'text-slate-400' : 'text-slate-600'
              }`}>
                {searchQuery || selectedType !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No configurations available'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigurationGallery;
