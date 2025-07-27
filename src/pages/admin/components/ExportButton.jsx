/**
 * Export Button Component
 * 
 * Provides export functionality for dashboard views
 * Supports PNG and PDF export formats with customizable options
 */

import React, { useState, useRef } from 'react';
import { BiDownload, BiImage, BiFile, BiLoader, BiCloud } from 'react-icons/bi';
import { useTheme } from '../../../contexts/ThemeContext';
import exportService from '../services/exportService';
import appsScriptExportService from '../../../services/appsScriptExport';

const ExportButton = ({
  targetElement = null,
  targetSelector = null,
  filename = null,
  title = null,
  showLabel = true,
  size = 'normal', // 'small', 'normal', 'large'
  variant = 'dropdown', // 'dropdown', 'buttons', 'icon'
  dashboardContext = null,
  rawData = null
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [exportStatus, setExportStatus] = useState('');
  const dropdownRef = useRef(null);

  // Get target element for export
  const getTargetElement = () => {
    if (targetElement) return targetElement;
    if (targetSelector) return document.querySelector(targetSelector);
    return null;
  };

  // Generate filename based on current date
  const generateFilename = (format) => {
    if (filename) return filename;
    
    const timestamp = new Date().toISOString().split('T')[0];
    return `dashboard_${timestamp}`;
  };

  // Handle export operations
  const handleExport = async (format) => {
    const element = getTargetElement();
    
    // Google Sheets export doesn't need DOM element
    if (format !== 'SHEETS' && !element) {
      setExportStatus('No element found to export');
      return;
    }

    setIsExporting(true);
    setExportStatus(`Exporting as ${format}...`);
    setShowDropdown(false);

    try {
      const exportFilename = generateFilename(format);
      
      if (format === 'PNG') {
        await exportService.exportDashboardAsPNG(element, exportFilename);
      } else if (format === 'PDF') {
        await exportService.exportDashboardAsPDF(element, {
          filename: exportFilename,
          title: title || 'Dashboard Export',
          includeFilters: true,
          chartsPerPage: 4,
          dashboardContext,
          rawData
        });
      } else if (format === 'SHEETS') {
        // Handle Google Sheets export
        if (!rawData) {
          throw new Error('No data available for Google Sheets export');
        }
        
        const result = await appsScriptExportService.exportToGoogleSheets(rawData, {
          dashboardName: title || 'Training Hub Dashboard',
          includeFilters: true,
          filters: dashboardContext?.filters || {},
          metadata: {
            exportType: 'Dashboard Export',
            timestamp: new Date().toISOString()
          }
        });
        
        // Show success message with Drive link
        setExportStatus(
          <span>
            ✅ Export sent to Google Drive! 
            <a 
              href="https://drive.google.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-2 underline hover:text-blue-500"
            >
              Open Google Drive
            </a>
          </span>
        );
        setTimeout(() => setExportStatus(''), 8000);
        return; // Skip the generic success message
      }
      
      setExportStatus(`${format} export completed!`);
      setTimeout(() => setExportStatus(''), 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus(`Export failed: ${error.message}`);
      setTimeout(() => setExportStatus(''), 5000);
    } finally {
      setIsExporting(false);
    }
  };

  // Size classes
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    normal: 'px-3 py-2 text-sm',
    large: 'px-4 py-3 text-base'
  };

  const iconSizes = {
    small: 14,
    normal: 16,
    large: 20
  };

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting}
          className={`
            flex items-center gap-2 rounded transition-colors
            ${sizeClasses[size]}
            ${isDark 
              ? 'bg-slate-700 hover:bg-slate-600 text-white border border-slate-600' 
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
            }
            ${isExporting ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-sm'}
          `}
          title="Export options"
        >
          {isExporting ? (
            <BiLoader className="animate-spin" size={iconSizes[size]} />
          ) : (
            <BiDownload size={iconSizes[size]} />
          )}
          {showLabel && <span>Export</span>}
        </button>

        {showDropdown && !isExporting && (
          <div className={`
            absolute top-full left-0 mt-1 w-60 rounded-lg shadow-lg border z-50
            ${isDark 
              ? 'bg-slate-800 border-slate-600' 
              : 'bg-white border-slate-200'
            }
          `}>
            <div className="py-1">
              <button
                onClick={() => handleExport('PNG')}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-700 text-white' 
                    : 'hover:bg-slate-50 text-slate-700'
                  }
                `}
              >
                <BiImage size={16} />
                <div>
                  <div className="font-medium">Export as PNG</div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    High-resolution image
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => handleExport('PDF')}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-700 text-white' 
                    : 'hover:bg-slate-50 text-slate-700'
                  }
                `}
              >
                <BiFile size={16} />
                <div>
                  <div className="font-medium">Export as PDF</div>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Multi-page document
                  </div>
                </div>
              </button>

              {rawData && appsScriptExportService.isConfigured() && (
                <button
                  onClick={() => handleExport('SHEETS')}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 text-left transition-colors
                    ${isDark 
                      ? 'hover:bg-slate-700 text-white' 
                      : 'hover:bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  <BiCloud size={16} />
                  <div>
                    <div className="font-medium">Export to Google Sheets</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Save data to Google Drive
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Status message */}
        {exportStatus && (
          <div className={`
            absolute top-full left-0 mt-1 px-3 py-2 rounded text-xs whitespace-nowrap
            ${isDark 
              ? 'bg-slate-700 text-white border border-slate-600' 
              : 'bg-white text-slate-700 border border-slate-200'
            }
          `}>
            {exportStatus}
          </div>
        )}

        {/* Click outside to close */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  // Buttons variant
  if (variant === 'buttons') {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => handleExport('PNG')}
          disabled={isExporting}
          className={`
            flex items-center gap-2 rounded transition-colors
            ${sizeClasses[size]}
            ${isDark 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
            }
            ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <BiImage size={iconSizes[size]} />
          PNG
        </button>
        
        <button
          onClick={() => handleExport('PDF')}
          disabled={isExporting}
          className={`
            flex items-center gap-2 rounded transition-colors
            ${sizeClasses[size]}
            ${isDark 
              ? 'bg-red-600 hover:bg-red-700 text-white' 
              : 'bg-red-500 hover:bg-red-600 text-white'
            }
            ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <BiFile size={iconSizes[size]} />
          PDF
        </button>

        {rawData && appsScriptExportService.isConfigured() && (
          <button
            onClick={() => handleExport('SHEETS')}
            disabled={isExporting}
            className={`
              flex items-center gap-2 rounded transition-colors
              ${sizeClasses[size]}
              ${isDark 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
              }
              ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <BiCloud size={iconSizes[size]} />
            Sheets
          </button>
        )}

        {/* Status message */}
        {exportStatus && (
          <div className={`
            flex items-center px-3 py-2 rounded text-xs
            ${isDark 
              ? 'bg-slate-700 text-white' 
              : 'bg-slate-100 text-slate-700'
            }
          `}>
            {isExporting && <BiLoader className="animate-spin mr-2" size={14} />}
            {exportStatus}
          </div>
        )}
      </div>
    );
  }

  // Icon variant
  if (variant === 'icon') {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isExporting}
          className={`
            p-2 rounded-full transition-colors
            ${isDark 
              ? 'hover:bg-slate-700 text-slate-300' 
              : 'hover:bg-slate-100 text-slate-600'
            }
            ${isExporting ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          title="Export"
        >
          {isExporting ? (
            <BiLoader className="animate-spin" size={iconSizes[size]} />
          ) : (
            <BiDownload size={iconSizes[size]} />
          )}
        </button>

        {showDropdown && !isExporting && (
          <div className={`
            absolute top-full right-0 mt-1 w-40 rounded-lg shadow-lg border z-50
            ${isDark 
              ? 'bg-slate-800 border-slate-600' 
              : 'bg-white border-slate-200'
            }
          `}>
            <div className="py-1">
              <button
                onClick={() => handleExport('PNG')}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-left transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-700 text-white' 
                    : 'hover:bg-slate-50 text-slate-700'
                  }
                `}
              >
                <BiImage size={14} />
                PNG
              </button>
              
              <button
                onClick={() => handleExport('PDF')}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-left transition-colors
                  ${isDark 
                    ? 'hover:bg-slate-700 text-white' 
                    : 'hover:bg-slate-50 text-slate-700'
                  }
                `}
              >
                <BiFile size={14} />
                PDF
              </button>

              {rawData && appsScriptExportService.isConfigured() && (
                <button
                  onClick={() => handleExport('SHEETS')}
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-left transition-colors
                    ${isDark 
                      ? 'hover:bg-slate-700 text-white' 
                      : 'hover:bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  <BiCloud size={14} />
                  Sheets
                </button>
              )}
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {showDropdown && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowDropdown(false)}
          />
        )}
      </div>
    );
  }

  return null;
};

export default ExportButton;
