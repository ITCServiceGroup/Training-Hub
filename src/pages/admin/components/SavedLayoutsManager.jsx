import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSavedLayouts } from '../hooks/useSavedLayouts';
import { 
  FaSave, 
  FaTrash, 
  FaCopy, 
  FaStar, 
  FaRegStar, 
  FaEdit, 
  FaCheck, 
  FaTimes,
  FaPlus,
  FaEye
} from 'react-icons/fa';

const SavedLayoutsManager = ({ 
  currentTileOrder, 
  currentFilters, 
  onApplyLayout, 
  activeLayoutId,
  onClose 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const {
    savedLayouts,
    loading,
    error,
    defaultLayoutId,
    saveCurrentLayout,
    updateLayout,
    deleteLayoutById,
    setLayoutAsDefault,
    duplicateLayoutById,
    getLayoutStats,
    hasUnsavedChanges,
    canSaveLayout,
    layoutToTileOrder,
    layoutToFilters,
    clearError
  } = useSavedLayouts();

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [editingLayout, setEditingLayout] = useState(null);
  const [saveForm, setSaveForm] = useState({ name: '', description: '' });
  const [editForm, setEditForm] = useState({ name: '', description: '' });

  const stats = getLayoutStats();
  const hasChanges = hasUnsavedChanges(currentTileOrder, currentFilters, activeLayoutId);

  const handleSaveNew = async () => {
    if (!saveForm.name.trim()) return;
    
    try {
      await saveCurrentLayout(
        saveForm.name,
        saveForm.description,
        currentTileOrder,
        currentFilters
      );
      setSaveForm({ name: '', description: '' });
      setShowSaveDialog(false);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleUpdateLayout = async (layoutId) => {
    if (!editForm.name.trim()) return;
    
    try {
      await updateLayout(layoutId, {
        name: editForm.name,
        description: editForm.description
      });
      setEditingLayout(null);
      setEditForm({ name: '', description: '' });
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const handleApplyLayout = (layout) => {
    const tileOrder = layoutToTileOrder(layout);
    const filters = layoutToFilters(layout);
    onApplyLayout(layout.id, tileOrder, filters);
  };

  const handleDuplicate = async (layout) => {
    try {
      await duplicateLayoutById(layout.id, `${layout.name} (Copy)`);
    } catch (err) {
      // Error is handled by the hook
    }
  };

  const startEdit = (layout) => {
    setEditingLayout(layout.id);
    setEditForm({ name: layout.name, description: layout.description || '' });
  };

  const cancelEdit = () => {
    setEditingLayout(null);
    setEditForm({ name: '', description: '' });
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50`}>
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-lg shadow-xl ${
        isDark ? 'bg-slate-800' : 'bg-white'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-slate-600' : 'border-slate-200'
        }`}>
          <div>
            <h2 className={`text-xl font-semibold ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Saved Layouts
            </h2>
            <p className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {stats.total} of 10 layouts saved
              {hasChanges && <span className="text-orange-500 ml-2">• Unsaved changes</span>}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {canSaveLayout() && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaPlus size={14} />
                Save Current
              </button>
            )}
            
            <button
              onClick={onClose}
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

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center justify-between">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              <button
                onClick={clearError}
                className="text-red-500 hover:text-red-700 dark:hover:text-red-300"
              >
                <FaTimes size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-500 dark:text-slate-400">Loading layouts...</div>
            </div>
          ) : savedLayouts.length === 0 ? (
            <div className="text-center py-8">
              <div className={`text-slate-500 dark:text-slate-400 mb-4`}>
                No saved layouts yet
              </div>
              <button
                onClick={() => setShowSaveDialog(true)}
                className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                <FaSave size={14} />
                Save Your First Layout
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {savedLayouts.map((layout) => (
                <div
                  key={layout.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    activeLayoutId === layout.id
                      ? isDark 
                        ? 'border-blue-500 bg-blue-900/20' 
                        : 'border-blue-500 bg-blue-50'
                      : isDark 
                        ? 'border-slate-600 bg-slate-700/50 hover:bg-slate-700' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingLayout === layout.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                            className={`w-full px-3 py-1 rounded border ${
                              isDark 
                                ? 'bg-slate-600 border-slate-500 text-white' 
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="Layout name"
                          />
                          <textarea
                            value={editForm.description}
                            onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                            className={`w-full px-3 py-1 rounded border resize-none ${
                              isDark 
                                ? 'bg-slate-600 border-slate-500 text-white' 
                                : 'bg-white border-slate-300 text-slate-900'
                            }`}
                            placeholder="Description (optional)"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleUpdateLayout(layout.id)}
                              className="flex items-center gap-1 px-2 py-1 text-sm bg-green-500 hover:bg-green-600 text-white rounded"
                            >
                              <FaCheck size={12} />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="flex items-center gap-1 px-2 py-1 text-sm bg-slate-500 hover:bg-slate-600 text-white rounded"
                            >
                              <FaTimes size={12} />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-medium ${
                              isDark ? 'text-white' : 'text-slate-900'
                            }`}>
                              {layout.name}
                            </h3>
                            {layout.is_default && (
                              <FaStar className="text-yellow-500" size={14} />
                            )}
                            {activeLayoutId === layout.id && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500 text-white rounded">
                                Active
                              </span>
                            )}
                          </div>
                          {layout.description && (
                            <p className={`text-sm ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              {layout.description}
                            </p>
                          )}
                          <div className={`text-xs mt-2 ${
                            isDark ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                            {layout.tiles?.length || 0} tiles • 
                            Updated {new Date(layout.updated_at).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                    </div>

                    {editingLayout !== layout.id && (
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => handleApplyLayout(layout)}
                          className={`p-2 rounded transition-colors ${
                            isDark 
                              ? 'hover:bg-slate-600 text-slate-400 hover:text-white' 
                              : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                          title="Apply layout"
                        >
                          <FaEye size={14} />
                        </button>
                        
                        <button
                          onClick={() => setLayoutAsDefault(layout.id)}
                          className={`p-2 rounded transition-colors ${
                            layout.is_default
                              ? 'text-yellow-500'
                              : isDark 
                                ? 'hover:bg-slate-600 text-slate-400 hover:text-yellow-500' 
                                : 'hover:bg-slate-200 text-slate-600 hover:text-yellow-500'
                          }`}
                          title={layout.is_default ? 'Default layout' : 'Set as default'}
                        >
                          {layout.is_default ? <FaStar size={14} /> : <FaRegStar size={14} />}
                        </button>
                        
                        <button
                          onClick={() => startEdit(layout)}
                          className={`p-2 rounded transition-colors ${
                            isDark 
                              ? 'hover:bg-slate-600 text-slate-400 hover:text-white' 
                              : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                          title="Edit layout"
                        >
                          <FaEdit size={14} />
                        </button>
                        
                        <button
                          onClick={() => handleDuplicate(layout)}
                          className={`p-2 rounded transition-colors ${
                            isDark 
                              ? 'hover:bg-slate-600 text-slate-400 hover:text-white' 
                              : 'hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                          }`}
                          title="Duplicate layout"
                        >
                          <FaCopy size={14} />
                        </button>
                        
                        <button
                          onClick={() => deleteLayoutById(layout.id)}
                          className={`p-2 rounded transition-colors ${
                            isDark 
                              ? 'hover:bg-red-600 text-slate-400 hover:text-white' 
                              : 'hover:bg-red-100 text-slate-600 hover:text-red-600'
                          }`}
                          title="Delete layout"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Dialog */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className={`w-full max-w-md p-6 rounded-lg ${
              isDark ? 'bg-slate-700' : 'bg-white'
            }`}>
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Save Current Layout
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Layout Name *
                  </label>
                  <input
                    type="text"
                    value={saveForm.name}
                    onChange={(e) => setSaveForm(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded border ${
                      isDark 
                        ? 'bg-slate-600 border-slate-500 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Enter layout name"
                    maxLength={50}
                  />
                </div>
                
                <div>
                  <label className={`block text-sm font-medium mb-1 ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    Description
                  </label>
                  <textarea
                    value={saveForm.description}
                    onChange={(e) => setSaveForm(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 rounded border resize-none ${
                      isDark 
                        ? 'bg-slate-600 border-slate-500 text-white' 
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                    placeholder="Optional description"
                    rows={3}
                    maxLength={200}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className={`px-4 py-2 rounded transition-colors ${
                    isDark 
                      ? 'bg-slate-600 hover:bg-slate-500 text-white' 
                      : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNew}
                  disabled={!saveForm.name.trim()}
                  className={`px-4 py-2 rounded transition-colors ${
                    saveForm.name.trim()
                      ? isDark 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-slate-400 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  Save Layout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedLayoutsManager;
