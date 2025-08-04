import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import TileLibrary from './TileLibrary';
import { FaPlus, FaLayerGroup } from 'react-icons/fa';

const TileLibraryButton = ({ 
  currentTiles = [], 
  onAddTile, 
  onRemoveTile 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [showLibrary, setShowLibrary] = useState(false);

  const handleAddTile = (tileId) => {
    onAddTile(tileId);
  };

  const handleRemoveTile = (tileId) => {
    onRemoveTile(tileId);
  };

  return (
    <>
      <button
        onClick={() => setShowLibrary(true)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
          isDark 
            ? 'bg-slate-800 hover:bg-slate-600 text-slate-300 hover:text-white border border-slate-600 hover:border-slate-500' 
            : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
        }`}
        title="Edit dashboard - add or remove tiles"
      >
        <FaLayerGroup size={16} />
        <span className="hidden sm:inline">Edit</span>
        <div className={`flex items-center gap-1 ml-1 px-2 py-0.5 rounded text-xs ${
          isDark ? 'bg-slate-600 text-slate-300' : 'bg-slate-100 text-slate-600'
        }`}>
          <span>{currentTiles.length}</span>
        </div>
      </button>

      {showLibrary && (
        <TileLibrary
          currentTiles={currentTiles}
          onAddTile={handleAddTile}
          onRemoveTile={handleRemoveTile}
          onClose={() => setShowLibrary(false)}
        />
      )}
    </>
  );
};

export default TileLibraryButton;
