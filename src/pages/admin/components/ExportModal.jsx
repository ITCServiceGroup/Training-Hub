/**
 * Export Modal Component
 * 
 * Advanced export dialog with customizable options for dashboard exports
 * Provides format selection, quality settings, and export previews
 */

import React, { useState, useEffect } from 'react';
import { BiX, BiDownload, BiImage, BiFile, BiLoader } from 'react-icons/bi';
import { useTheme } from '../../../contexts/ThemeContext';
import exportService from '../services/exportService';

const ExportModal = ({ 
  isOpen, 
  onClose, 
  targetElement = null,
  targetSelector = null,
  defaultFilename = null,
  title = 'Export Options'
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [exportFormat, setExportFormat] = useState('PNG');
  const [filename, setFilename] = useState('');
  const [quality, setQuality] = useState('high');
  const [includeTitle, setIncludeTitle] = useState(true);
  const [includeTimestamp, setIncludeTimestamp] = useState(true);
  const [chartsPerPage, setChartsPerPage] = useState(2);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState('');

  // Initialize filename when modal opens
  useEffect(() => {
    if (isOpen && !filename) {
      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = defaultFilename || 'dashboard';
      setFilename(`${baseFilename}_${timestamp}`);
    }
  }, [isOpen, defaultFilename, filename]);

  // Get target element for export
  const getTargetElement = () => {
    if (targetElement) return targetElement;
    if (targetSelector) return document.querySelector(targetSelector);
    return null;
  };

  // Handle export
  const handleExport = async () => {
    const element = getTargetElement();
    if (!element) {
      setExportProgress('Error: No element found to export');
      return;
    }

    setIsExporting(true);
    setExportProgress('Preparing export...');

    try {
      const exportOptions = {
        filename,
        title: includeTitle ? (title || 'Export') : null,
        includeTimestamp,
        quality: quality === 'high' ? 1.0 : quality === 'medium' ? 0.8 : 0.6,
        chartsPerPage: chartsPerPage
      };

      setExportProgress('Capturing dashboard...');
      if (exportFormat === 'PNG') {
        await exportService.exportDashboardAsPNG(element, filename);
      } else {
        await exportService.exportDashboardAsPDF(element, exportOptions);
      }

      setExportProgress('Export completed successfully!');
      setTimeout(() => {
        onClose();
        setExportProgress('');
      }, 2000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportProgress(`Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        w-full max-w-md mx-4 rounded-lg shadow-xl
        ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}
      `}>
        {/* Header */}
        <div className={`
          flex items-center justify-between p-4 border-b
          ${isDark ? 'border-slate-600' : 'border-slate-200'}
        `}>
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className={`
              p-1 rounded transition-colors
              ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}
            `}
          >
            <BiX size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setExportFormat('PNG')}
                className={`
                  flex items-center gap-2 p-3 rounded border transition-colors
                  ${exportFormat === 'PNG'
                    ? isDark 
                      ? 'bg-blue-600 border-blue-500 text-white' 
                      : 'bg-blue-50 border-blue-500 text-blue-700'
                    : isDark 
                      ? 'border-slate-600 hover:bg-slate-700' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }
                `}
              >
                <BiImage size={20} />
                <div className="text-left">
                  <div className="font-medium">PNG</div>
                  <div className="text-xs opacity-75">High-quality image</div>
                </div>
              </button>
              
              <button
                onClick={() => setExportFormat('PDF')}
                className={`
                  flex items-center gap-2 p-3 rounded border transition-colors
                  ${exportFormat === 'PDF'
                    ? isDark 
                      ? 'bg-red-600 border-red-500 text-white' 
                      : 'bg-red-50 border-red-500 text-red-700'
                    : isDark 
                      ? 'border-slate-600 hover:bg-slate-700' 
                      : 'border-slate-200 hover:bg-slate-50'
                  }
                `}
              >
                <BiFile size={20} />
                <div className="text-left">
                  <div className="font-medium">PDF</div>
                  <div className="text-xs opacity-75">Printable document</div>
                </div>
              </button>
            </div>
          </div>

          {/* Filename */}
          <div>
            <label className="block text-sm font-medium mb-2">Filename</label>
            <input
              type="text"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              className={`
                w-full px-3 py-2 rounded border transition-colors
                ${isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-200 text-slate-900 placeholder-slate-500'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
              placeholder="Enter filename"
            />
          </div>

          {/* Quality Settings */}
          <div>
            <label className="block text-sm font-medium mb-2">Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className={`
                w-full px-3 py-2 rounded border transition-colors
                ${isDark 
                  ? 'bg-slate-700 border-slate-600 text-white' 
                  : 'bg-white border-slate-200 text-slate-900'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              <option value="high">High Quality (Larger file)</option>
              <option value="medium">Medium Quality (Balanced)</option>
              <option value="low">Low Quality (Smaller file)</option>
            </select>
          </div>

          {/* Dashboard PDF options */}
          {exportFormat === 'PDF' && (
            <div>
              <label className="block text-sm font-medium mb-2">Charts per Page</label>
              <select
                value={chartsPerPage}
                onChange={(e) => setChartsPerPage(parseInt(e.target.value))}
                className={`
                  w-full px-3 py-2 rounded border transition-colors
                  ${isDark 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-white border-slate-200 text-slate-900'
                  }
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                `}
              >
                <option value={1}>1 chart per page</option>
                <option value={2}>2 charts per page</option>
                <option value={3}>3 charts per page</option>
                <option value={4}>4 charts per page</option>
              </select>
            </div>
          )}

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTitle}
                onChange={(e) => setIncludeTitle(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Include title</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={includeTimestamp}
                onChange={(e) => setIncludeTimestamp(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Include timestamp</span>
            </label>
          </div>

          {/* Export Progress */}
          {exportProgress && (
            <div className={`
              p-3 rounded border
              ${isDark 
                ? 'bg-slate-700 border-slate-600' 
                : 'bg-slate-50 border-slate-200'
              }
            `}>
              <div className="flex items-center gap-2">
                {isExporting && <BiLoader className="animate-spin" size={16} />}
                <span className="text-sm">{exportProgress}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`
          flex items-center justify-end gap-2 p-4 border-t
          ${isDark ? 'border-slate-600' : 'border-slate-200'}
        `}>
          <button
            onClick={onClose}
            disabled={isExporting}
            className={`
              px-4 py-2 rounded transition-colors
              ${isDark 
                ? 'hover:bg-slate-700 text-slate-300' 
                : 'hover:bg-slate-100 text-slate-600'
              }
              ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            Cancel
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting || !filename.trim()}
            className={`
              flex items-center gap-2 px-4 py-2 rounded transition-colors
              ${isDark 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-blue-500 hover:bg-blue-600 text-white'
              }
              ${(isExporting || !filename.trim()) ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isExporting ? (
              <BiLoader className="animate-spin" size={16} />
            ) : (
              <BiDownload size={16} />
            )}
            Export {exportFormat}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
