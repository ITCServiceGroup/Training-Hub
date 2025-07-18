/**
 * Configuration Selector Dropdown
 * 
 * Unified dropdown for selecting dashboard configurations
 * Replaces separate preset and layout selectors
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { CONFIGURATION_TYPES } from '../types/DashboardConfiguration';
import { 
  FaChevronDown, 
  FaPlus, 
  FaEdit, 
  FaEye,
  FaStar,
  FaRegStar,
  FaCopy,
  FaTrash,
  FaUsers,
  FaUser,
  FaCog,
  FaChartBar,
  FaGraduationCap,
  FaSearch,
  FaTachometerAlt
} from 'react-icons/fa';

const ConfigurationSelector = ({
  configurations = [],
  activeConfiguration,
  defaultConfiguration,
  onConfigurationChange,
  onStartEditing,
  onClone,
  onDelete,
  onSetDefault,
  loading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter configurations based on search
  const filteredConfigurations = configurations.filter(config =>
    config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    config.metadata?.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Group configurations by type
  const systemConfigs = filteredConfigurations.filter(c => c.type === CONFIGURATION_TYPES.SYSTEM);
  const userConfigs = filteredConfigurations.filter(c => c.type === CONFIGURATION_TYPES.USER);

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

  const handleConfigurationSelect = (config) => {
    onConfigurationChange(config.id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleAction = (action, config, event) => {
    event.stopPropagation();

    switch (action) {
      case 'edit':
        onStartEditing(config.id);
        setIsOpen(false);
        break;
      case 'clone':
        onClone(config.id, `${config.name} (Copy)`);
        setIsOpen(false);
        break;
      case 'delete':
        onDelete(config.id);
        setIsOpen(false);
        break;
      case 'setDefault':
        onSetDefault(config.id);
        // Don't close dropdown for setDefault - let user see the change
        break;
    }
  };

  const ConfigurationItem = ({ config, isActive = false }) => {
    const IconComponent = getConfigurationIcon(config);
    const isSystem = config.type === CONFIGURATION_TYPES.SYSTEM;
    // Check if this configuration is the default (works for both user and system configs)
    const isDefault = defaultConfiguration?.id === config.id;

    return (
      <div
        className={`flex items-center justify-between p-3 cursor-pointer transition-colors ${
          isActive
            ? isDark ? 'bg-blue-900/50 text-blue-200' : 'bg-blue-50 text-blue-700'
            : isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
        }`}
        onClick={() => handleConfigurationSelect(config)}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-2 rounded-lg ${
            isActive
              ? isDark ? 'bg-blue-800' : 'bg-blue-100'
              : isDark ? 'bg-slate-600' : 'bg-slate-100'
          }`}>
            <IconComponent size={16} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium truncate">{config.name}</span>
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
              <p className={`text-xs truncate ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {config.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {config.tiles?.length || 0} tiles
              </span>
              {config.metadata?.popularity && (
                <span className={`text-xs ${
                  isDark ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  • {config.metadata.popularity}% popular
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2">
          {/* Set as Default button - available for all configurations */}
          <button
            onClick={(e) => handleAction('setDefault', config, e)}
            className={`p-1 rounded transition-colors ${
              isDefault
                ? 'text-yellow-500'
                : isDark
                  ? 'text-slate-400 hover:text-yellow-500'
                  : 'text-slate-500 hover:text-yellow-500'
            }`}
            title={isDefault ? 'Default configuration' : 'Set as default'}
          >
            {isDefault ? <FaStar size={12} /> : <FaRegStar size={12} />}
          </button>

          {/* Edit and Delete buttons - only for user configurations */}
          {!isSystem && (
            <>
              <button
                onClick={(e) => handleAction('edit', config, e)}
                className={`p-1 rounded transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Edit configuration"
              >
                <FaEdit size={12} />
              </button>
            </>
          )}
          
          <button
            onClick={(e) => handleAction('clone', config, e)}
            className={`p-1 rounded transition-colors ${
              isDark 
                ? 'text-slate-400 hover:text-white' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
            title="Clone configuration"
          >
            <FaCopy size={12} />
          </button>
          
          {!isSystem && (
            <button
              onClick={(e) => handleAction('delete', config, e)}
              className={`p-1 rounded transition-colors ${
                isDark 
                  ? 'text-slate-400 hover:text-red-400' 
                  : 'text-slate-500 hover:text-red-500'
              }`}
              title="Delete configuration"
            >
              <FaTrash size={12} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
          isDark 
            ? 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600' 
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {activeConfiguration && (
            <>
              {React.createElement(getConfigurationIcon(activeConfiguration), { size: 16 })}
              <span className="font-medium truncate max-w-48">
                {activeConfiguration.name}
              </span>
            </>
          )}
          {!activeConfiguration && (
            <span className="text-slate-500">Select Configuration</span>
          )}
        </div>
        <FaChevronDown 
          size={12} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={`absolute top-full left-0 mt-1 w-96 max-h-[70vh] overflow-hidden rounded-lg border shadow-lg z-50 ${
          isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200'
        }`}>
          {/* Header with Search */}
          <div className={`p-3 border-b ${
            isDark ? 'border-slate-600' : 'border-slate-200'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <h3 className={`font-medium ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Dashboard Configurations
              </h3>
              <button
                onClick={() => {
                  onStartEditing();
                  setIsOpen(false);
                }}
                className={`ml-auto p-1 rounded transition-colors ${
                  isDark 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
                title="Create new configuration"
              >
                <FaPlus size={14} />
              </button>
            </div>
            
            <div className="relative">
              <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`} size={12} />
              <input
                type="text"
                placeholder="Search configurations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 text-sm rounded border ${
                  isDark 
                    ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
                }`}
              />
            </div>
          </div>

          {/* Configuration Lists */}
          <div className="max-h-[calc(70vh-8rem)] overflow-y-auto">
            {/* System Configurations */}
            {systemConfigs.length > 0 && (
              <div>
                <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-slate-400 bg-slate-700/50' : 'text-slate-500 bg-slate-50'
                }`}>
                  System Configurations
                </div>
                {systemConfigs.map(config => (
                  <ConfigurationItem
                    key={config.id}
                    config={config}
                    isActive={activeConfiguration?.id === config.id}
                  />
                ))}
              </div>
            )}

            {/* User Configurations */}
            {userConfigs.length > 0 && (
              <div>
                <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wide ${
                  isDark ? 'text-slate-400 bg-slate-700/50' : 'text-slate-500 bg-slate-50'
                }`}>
                  Your Configurations
                </div>
                {userConfigs.map(config => (
                  <ConfigurationItem
                    key={config.id}
                    config={config}
                    isActive={activeConfiguration?.id === config.id}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {filteredConfigurations.length === 0 && (
              <div className="p-6 text-center">
                <p className={`text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {searchQuery ? 'No configurations found' : 'No configurations available'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => {
                      onStartEditing();
                      setIsOpen(false);
                    }}
                    className={`mt-2 px-3 py-1 text-sm rounded transition-colors ${
                      isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    Create First Configuration
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigurationSelector;
