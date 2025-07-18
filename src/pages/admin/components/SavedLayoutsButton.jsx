import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useSavedLayouts } from '../hooks/useSavedLayouts';
import SavedLayoutsManager from './SavedLayoutsManager';
import { FaLayerGroup, FaSave, FaCircle } from 'react-icons/fa';

const SavedLayoutsButton = ({ 
  currentTileOrder, 
  currentFilters, 
  onApplyLayout, 
  activeLayoutId 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showManager, setShowManager] = useState(false);
  
  const {
    savedLayouts,
    hasUnsavedChanges,
    getLayoutStats
  } = useSavedLayouts();

  const stats = getLayoutStats();
  const hasChanges = hasUnsavedChanges(currentTileOrder, currentFilters, activeLayoutId);
  const activeLayout = savedLayouts.find(l => l.id === activeLayoutId);

  const handleApplyLayout = (layoutId, tileOrder, filters) => {
    onApplyLayout(layoutId, tileOrder, filters);
    setShowManager(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setShowManager(true)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            isDark 
              ? 'bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600' 
              : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200'
          }`}
          title="Manage saved layouts"
        >
          <FaLayerGroup size={16} />
          <span className="hidden sm:inline">Layouts</span>
          
          {/* Status indicators */}
          <div className="flex items-center gap-1">
            {stats.total > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
              }`}>
                {stats.total}
              </span>
            )}
            
            {hasChanges && (
              <FaCircle className="text-orange-500" size={8} title="Unsaved changes" />
            )}

            {activeLayout && (
              <FaCircle className="text-green-500" size={8} title={`Active: ${activeLayout.name}`} />
            )}
          </div>
        </button>

        {/* Quick status tooltip */}
        {(hasChanges || activeLayout) && (
          <div className={`absolute top-full left-0 mt-1 px-2 py-1 text-xs rounded shadow-lg z-10 whitespace-nowrap ${
            isDark ? 'bg-slate-800 text-slate-300 border border-slate-600' : 'bg-white text-slate-700 border border-slate-200'
          }`}>
            {activeLayout && (
              <div>Active: {activeLayout.name}</div>
            )}
            {hasChanges && (
              <div className="text-orange-500">Unsaved changes</div>
            )}
          </div>
        )}
      </div>

      {showManager && (
        <SavedLayoutsManager
          currentTileOrder={currentTileOrder}
          currentFilters={currentFilters}
          onApplyLayout={handleApplyLayout}
          activeLayoutId={activeLayoutId}
          onClose={() => setShowManager(false)}
        />
      )}
    </>
  );
};

export default SavedLayoutsButton;
