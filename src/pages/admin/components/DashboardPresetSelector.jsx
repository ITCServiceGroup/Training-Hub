import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { 
  getAvailablePresets, 
  getRecommendedPresets, 
  getDefaultPreset 
} from '../config/dashboardPresets';
import { FaChevronDown, FaCheck, FaStar, FaEye } from 'react-icons/fa';

const DashboardPresetSelector = ({ 
  currentPreset, 
  onPresetChange, 
  onPresetPreview = null 
}) => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [previewPreset, setPreviewPreset] = useState(null);

  const allPresets = getAvailablePresets();
  const recommendedPresets = getRecommendedPresets(user?.role || 'user');
  const recommendedIds = recommendedPresets.map(p => p.id);

  const handlePresetSelect = (preset) => {
    onPresetChange(preset);
    setIsOpen(false);
    setPreviewPreset(null);
  };

  const handlePresetPreview = (preset, event) => {
    event.stopPropagation();
    if (onPresetPreview) {
      setPreviewPreset(preset);
      onPresetPreview(preset);
    }
  };

  const stopPreview = () => {
    if (previewPreset && onPresetPreview) {
      setPreviewPreset(null);
      onPresetPreview(null);
    }
  };

  return (
    <div className="relative">
      {/* Preset Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-3 px-4 py-2 rounded-lg border transition-all duration-200 shadow-sm
          ${isDark
            ? 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-slate-500'
            : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
          }
          ${isOpen ? 'ring-2 ring-blue-500/20' : ''}
        `}
      >
        <span className="text-lg">{currentPreset?.icon || '📊'}</span>
        <div className="flex flex-col items-start">
          <span className="font-medium text-sm">{currentPreset?.name || 'Select Preset'}</span>
          {currentPreset && (
            <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {currentPreset.tiles.length} charts
            </span>
          )}
        </div>
        <FaChevronDown
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => {
              setIsOpen(false);
              stopPreview();
            }}
          />
          
          {/* Dropdown Content */}
          <div className={`
            absolute top-full left-0 mt-2 w-80 rounded-lg shadow-xl border z-20
            ${isDark 
              ? 'bg-slate-800 border-slate-600' 
              : 'bg-white border-slate-200'
            }
          `}>
            <div className="p-3">
              <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                Dashboard Presets
              </h3>
              
              {/* Recommended Section */}
              {recommendedPresets.length > 0 && (
                <div className="mb-4">
                  <div className={`text-xs font-medium mb-2 flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <FaStar className="text-yellow-500" />
                    Recommended for you
                  </div>
                  <div className="space-y-1">
                    {recommendedPresets.map((preset) => (
                      <PresetOption
                        key={preset.id}
                        preset={preset}
                        isSelected={currentPreset?.id === preset.id}
                        isPreviewing={previewPreset?.id === preset.id}
                        isRecommended={true}
                        onSelect={handlePresetSelect}
                        onPreview={onPresetPreview ? handlePresetPreview : null}
                        isDark={isDark}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* All Presets Section */}
              <div>
                <div className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  All Presets
                </div>
                <div className="space-y-1">
                  {allPresets
                    .filter(preset => !recommendedIds.includes(preset.id))
                    .map((preset) => (
                      <PresetOption
                        key={preset.id}
                        preset={preset}
                        isSelected={currentPreset?.id === preset.id}
                        isPreviewing={previewPreset?.id === preset.id}
                        isRecommended={false}
                        onSelect={handlePresetSelect}
                        onPreview={onPresetPreview ? handlePresetPreview : null}
                        isDark={isDark}
                      />
                    ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const PresetOption = ({ 
  preset, 
  isSelected, 
  isPreviewing, 
  isRecommended, 
  onSelect, 
  onPreview, 
  isDark 
}) => {
  return (
    <div
      className={`
        flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors
        ${isSelected 
          ? isDark ? 'bg-blue-900/50 border border-blue-600' : 'bg-blue-50 border border-blue-200'
          : isPreviewing
          ? isDark ? 'bg-slate-700 border border-slate-500' : 'bg-slate-100 border border-slate-300'
          : isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-50'
        }
      `}
      onClick={() => onSelect(preset)}
    >
      <div className="flex items-center gap-3 flex-1">
        <span className="text-lg">{preset.icon}</span>
        <div className="flex-1">
          <div className={`font-medium text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            {preset.name}
            {isRecommended && <FaStar className="inline ml-1 text-xs text-yellow-500" />}
          </div>
          <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {preset.description}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {preset.tiles.length} charts
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {onPreview && (
          <button
            onClick={(e) => onPreview(preset, e)}
            className={`
              p-1 rounded transition-colors
              ${isDark 
                ? 'hover:bg-slate-600 text-slate-400 hover:text-slate-200' 
                : 'hover:bg-slate-200 text-slate-500 hover:text-slate-700'
              }
            `}
            title="Preview layout"
          >
            <FaEye size={12} />
          </button>
        )}
        
        {isSelected && (
          <FaCheck className="text-blue-500" size={14} />
        )}
      </div>
    </div>
  );
};

export default DashboardPresetSelector;
