import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import ConfigurationEditor from './ConfigurationEditor';
import ConfigurationGallery from './ConfigurationGallery';
import {
  FaChevronDown,
  FaEdit,
  FaLayerGroup,
  FaPlus,
  FaCopy,
  FaTrash,
  FaEye,
  FaTachometerAlt,
  FaStar,
  FaRegStar
} from 'react-icons/fa';

/**
 * Beautiful Dashboard Manager Dropdown
 * 
 * A sleek dropdown that provides access to dashboard management
 * including the configuration editor and gallery modals
 */
const DashboardManagerDropdown = ({
  dashboards = [],
  activeDashboard,
  onDashboardChange,
  onCreateDashboard,
  onUpdateDashboard,
  onDuplicateDashboard,
  onDeleteDashboard,
  onSetDefaultDashboard,
  loading = false
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState(null);
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

  const handleEditDashboard = (dashboard = null) => {
    const dashboardToEdit = dashboard || activeDashboard;
    if (!dashboardToEdit) return;
    
    // Convert dashboard to configuration format expected by ConfigurationEditor
    const configurationData = {
      id: dashboardToEdit.id,
      name: dashboardToEdit.name,
      description: dashboardToEdit.description || '',
      type: 'user',
      tiles: dashboardToEdit.tiles || [],
      filters: dashboardToEdit.filters || { dateRange: 'last-30-days', market: 'all', supervisor: 'all' },
      layout: dashboardToEdit.layout || { columns: 3, rowHeight: 375 },
      settings: dashboardToEdit.settings || {}
    };
    
    setEditingDashboard(configurationData);
    setShowEditor(true);
    setIsOpen(false);
  };

  const handleCreateNew = () => {
    const newConfiguration = {
      id: null, // Will be generated on save
      name: 'New Dashboard',
      description: '',
      type: 'user',
      tiles: [],
      filters: { dateRange: 'last-30-days', market: 'all', supervisor: 'all' },
      layout: { columns: 3, rowHeight: 375 },
      settings: {}
    };
    
    setEditingDashboard(newConfiguration);
    setShowEditor(true);
    setIsOpen(false);
  };

  const handleSaveConfiguration = async (configurationData) => {
    try {
      console.log('🔧 Saving configuration:', configurationData);
      
      // Convert configuration format back to dashboard format
      const dashboardData = {
        id: configurationData.id,
        name: configurationData.name,
        description: configurationData.description,
        tiles: configurationData.tiles,
        filters: configurationData.filters,
        layout: configurationData.layout
      };

      console.log('🔧 Dashboard data:', dashboardData);

      if (configurationData.id) {
        console.log('🔧 Updating existing dashboard with ID:', configurationData.id);
        // Update existing dashboard
        await onUpdateDashboard(dashboardData);
      } else {
        console.log('🔧 Creating new dashboard');
        // Create new dashboard
        await onCreateDashboard(dashboardData);
      }
      setShowEditor(false);
      setEditingDashboard(null);
    } catch (error) {
      console.error('Failed to save dashboard:', error);
      alert('Failed to save dashboard: ' + error.message);
    }
  };

  const handleDuplicate = async (dashboardId) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (!dashboard) return;

    const newName = `${dashboard.name} (Copy)`;
    try {
      await onDuplicateDashboard(dashboardId, newName);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to duplicate dashboard:', error);
      alert('Failed to duplicate dashboard: ' + error.message);
    }
  };

  const handleDelete = async (dashboardId) => {
    const dashboard = dashboards.find(d => d.id === dashboardId);
    if (!dashboard) return;
    
    if (window.confirm(`Are you sure you want to delete "${dashboard.name}"?`)) {
      try {
        await onDeleteDashboard(dashboardId);
        setIsOpen(false);
      } catch (error) {
        console.error('Failed to delete dashboard:', error);
        alert('Failed to delete dashboard: ' + error.message);
      }
    }
  };

  const handleBrowseAll = () => {
    // Convert dashboards to configuration format for the gallery
    const configurations = dashboards.map(dashboard => ({
      id: dashboard.id,
      name: dashboard.name,
      description: dashboard.description || '',
      type: 'user',
      tiles: dashboard.tiles || [],
      filters: dashboard.filters || {},
      layout: dashboard.layout || {},
      settings: dashboard.settings || {},
      updated_at: dashboard.updated_at,
      created_at: dashboard.created_at
    }));
    
    setShowGallery(true);
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        {/* Main Dropdown Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-200 min-w-[280px] ${
            isDark
              ? 'bg-slate-800 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
          } ${isOpen ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
        >
          <FaTachometerAlt size={16} className="text-blue-500" />
          <div className="flex-1 text-left">
            <div className="font-medium truncate">
              {activeDashboard?.name || 'Select Dashboard'}
            </div>
            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {dashboards.length} dashboard{dashboards.length !== 1 ? 's' : ''} available
            </div>
          </div>
          <FaChevronDown 
            size={14} 
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className={`absolute top-full left-0 mt-2 rounded-lg border shadow-xl z-50 min-w-[380px] ${
            isDark
              ? 'bg-slate-800 border-slate-600'
              : 'bg-white border-slate-200'
          }`}>
            {/* Header Actions */}
            <div className={`p-3 border-b ${isDark ? 'border-slate-600' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCreateNew}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <FaPlus size={12} />
                  New
                </button>
                
                <button
                  onClick={() => handleEditDashboard()}
                  disabled={!activeDashboard}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    !activeDashboard
                      ? 'opacity-50 cursor-not-allowed'
                      : isDark
                        ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <FaEdit size={12} />
                  Edit
                </button>
                
                <button
                  onClick={handleBrowseAll}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    isDark
                      ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <FaLayerGroup size={12} />
                  Browse All
                </button>
              </div>
            </div>

            {/* Dashboard List */}
            <div className="max-h-64 overflow-y-auto">
              {dashboards.length === 0 ? (
                <div className={`p-4 text-center text-sm ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  No dashboards available
                </div>
              ) : (
                dashboards.map((dashboard) => {
                  const isActive = activeDashboard?.id === dashboard.id;
                  const isDefault = dashboard.is_default;
                  return (
                    <div
                      key={dashboard.id}
                      className={`flex items-center justify-between p-3 transition-colors ${
                        isActive
                          ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                          : isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => {
                          onDashboardChange(dashboard.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{dashboard.name}</span>
                          {isDefault && <FaStar className="text-yellow-500" size={12} />}
                        </div>
                        {dashboard.description && (
                          <div className={`text-xs ${
                            isActive
                              ? isDark ? 'text-blue-400' : 'text-blue-600'
                              : isDark ? 'text-slate-400' : 'text-slate-500'
                          }`}>
                            {dashboard.description}
                          </div>
                        )}
                        <div className={`text-xs ${
                          isActive
                            ? isDark ? 'text-blue-400' : 'text-blue-600'
                            : isDark ? 'text-slate-400' : 'text-slate-500'
                        }`}>
                          {dashboard.tiles?.length || 0} charts
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => onSetDefaultDashboard && onSetDefaultDashboard(isDefault ? null : dashboard.id)}
                          className={`p-1.5 rounded transition-colors ${
                            isDefault
                              ? 'text-yellow-500'
                              : isDark
                                ? 'hover:bg-slate-600 text-slate-400 hover:text-yellow-500'
                                : 'hover:bg-slate-200 text-slate-500 hover:text-yellow-500'
                          }`}
                          title={isDefault ? 'Remove as default' : 'Set as default'}
                        >
                          {isDefault ? <FaStar size={12} /> : <FaRegStar size={12} />}
                        </button>

                        <button
                          onClick={() => handleEditDashboard(dashboard)}
                          className={`p-1.5 rounded transition-colors ${
                            isDark
                              ? 'hover:bg-slate-600 text-slate-400 hover:text-slate-300'
                              : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                          }`}
                          title="Edit dashboard"
                        >
                          <FaEdit size={12} />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicate(dashboard.id)}
                          className={`p-1.5 rounded transition-colors ${
                            isDark
                              ? 'hover:bg-slate-600 text-slate-400 hover:text-slate-300'
                              : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
                          }`}
                          title="Duplicate dashboard"
                        >
                          <FaCopy size={12} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(dashboard.id)}
                          className={`p-1.5 rounded transition-colors ${
                            isDark
                              ? 'hover:bg-red-600 text-slate-400 hover:text-red-300'
                              : 'hover:bg-red-100 text-slate-500 hover:text-red-700'
                          }`}
                          title="Delete dashboard"
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Configuration Editor Modal */}
      {showEditor && editingDashboard && (
        <ConfigurationEditor
          configuration={editingDashboard}
          onSave={() => handleSaveConfiguration(editingDashboard)}
          onCancel={() => {
            setShowEditor(false);
            setEditingDashboard(null);
          }}
          onUpdateConfiguration={(updates) => 
            setEditingDashboard(prev => ({ ...prev, ...updates }))
          }
          isLoading={loading}
        />
      )}

      {/* Configuration Gallery Modal */}
      {showGallery && (
        <ConfigurationGallery
          configurations={dashboards.map(d => ({
            ...d,
            type: 'user'
          }))}
          activeConfiguration={activeDashboard}
          onConfigurationSelect={(config) => {
            onDashboardChange(config.id);
            setShowGallery(false);
          }}
          onEdit={(config) => {
            handleEditDashboard(config);
            setShowGallery(false);
          }}
          onClone={(configId) => {
            handleDuplicate(configId);
            setShowGallery(false);
          }}
          onDelete={(configId) => {
            handleDelete(configId);
            setShowGallery(false);
          }}
          onSetDefault={(configId) => {
            onSetDefaultDashboard && onSetDefaultDashboard(configId);
          }}
          onClose={() => setShowGallery(false)}
          loading={loading}
        />
      )}
    </>
  );
};

export default DashboardManagerDropdown;
