/**
 * Google Drive Export Settings Component
 * 
 * Allows users to configure and test Google Drive integration via Apps Script
 * Simple configuration with connection testing
 */

import React, { useState, useEffect } from 'react';
import { BiCloud, BiCheck, BiX, BiLoader, BiTestTube, BiInfo } from 'react-icons/bi';
import { useTheme } from '../../contexts/ThemeContext';
import appsScriptExportService from '../../services/appsScriptExport';

const DriveExportSettings = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [webAppUrl, setWebAppUrl] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);

  // Load current configuration on mount
  useEffect(() => {
    const currentUrl = import.meta.env.VITE_APPS_SCRIPT_WEB_APP_URL || '';
    setWebAppUrl(currentUrl);
  }, []);

  // Test connection to Apps Script web app
  const testConnection = async () => {
    if (!webAppUrl.trim()) {
      setConnectionStatus({
        success: false,
        message: 'Please enter a valid Apps Script web app URL'
      });
      return;
    }

    setIsTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Update the service URL temporarily for testing
      const originalUrl = appsScriptExportService.webAppUrl;
      appsScriptExportService.webAppUrl = webAppUrl.trim();
      
      const result = await appsScriptExportService.testConnection();
      
      // Restore original URL
      appsScriptExportService.webAppUrl = originalUrl;
      
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: `Connection failed: ${error.message}`
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Get current service status
  const serviceStatus = appsScriptExportService.getStatus();

  return (
    <div className={`p-6 rounded-lg border ${
      isDark 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-slate-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 rounded-lg ${
          isDark ? 'bg-blue-900' : 'bg-blue-100'
        }`}>
          <BiCloud className={`w-5 h-5 ${
            isDark ? 'text-blue-400' : 'text-blue-600'
          }`} />
        </div>
        <div>
          <h3 className={`text-lg font-semibold ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Google Drive Export
          </h3>
          <p className={`text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Export dashboard data directly to Google Sheets
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className={`p-4 rounded-lg mb-6 ${
        isDark ? 'bg-slate-700' : 'bg-slate-50'
      }`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`font-medium ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Current Status
          </span>
          <div className="flex items-center gap-2">
            {serviceStatus.isConfigured ? (
              <>
                <BiCheck className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500">Configured</span>
              </>
            ) : (
              <>
                <BiX className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-orange-500">Not Configured</span>
              </>
            )}
          </div>
        </div>
        {serviceStatus.isConfigured && (
          <p className={`text-sm ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            Web App URL: {serviceStatus.webAppUrl}
          </p>
        )}
      </div>

      {/* Configuration Form */}
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Google Apps Script Web App URL
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={webAppUrl}
              onChange={(e) => setWebAppUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
              className={`flex-1 px-3 py-2 rounded border text-sm ${
                isDark 
                  ? 'bg-slate-700 border-slate-600 text-white placeholder-slate-400' 
                  : 'bg-white border-slate-300 text-slate-900 placeholder-slate-500'
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
            <button
              onClick={testConnection}
              disabled={isTestingConnection || !webAppUrl.trim()}
              className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600'
                  : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-slate-300'
              } disabled:cursor-not-allowed`}
            >
              {isTestingConnection ? (
                <BiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <BiTestTube className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Connection Test Result */}
        {connectionStatus && (
          <div className={`p-3 rounded border-l-4 ${
            connectionStatus.success
              ? isDark
                ? 'bg-green-900 border-green-500 text-green-100'
                : 'bg-green-50 border-green-500 text-green-800'
              : isDark
                ? 'bg-red-900 border-red-500 text-red-100'
                : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              {connectionStatus.success ? (
                <BiCheck className="w-4 h-4 flex-shrink-0" />
              ) : (
                <BiX className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{connectionStatus.message}</span>
            </div>
          </div>
        )}

        {/* Setup Instructions */}
        <div>
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className={`flex items-center gap-2 text-sm ${
              isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            <BiInfo className="w-4 h-4" />
            {showInstructions ? 'Hide' : 'Show'} Setup Instructions
          </button>

          {showInstructions && (
            <div className={`mt-3 p-4 rounded border ${
              isDark 
                ? 'bg-slate-700 border-slate-600' 
                : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className={`font-medium mb-3 ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Setup Instructions
              </h4>
              <ol className={`space-y-2 text-sm ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                <li>1. Go to <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">script.google.com</code></li>
                <li>2. Create a new project named "Training Hub Export Handler"</li>
                <li>3. Copy the Apps Script code from <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">APPS_SCRIPT_CODE.gs</code> file</li>
                <li>4. Replace the default code with the provided code</li>
                <li>5. Update the <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">DRIVE_FOLDER_ID</code> in the configuration</li>
                <li>6. Deploy as Web App with execute as "Me" and access "Anyone"</li>
                <li>7. Copy the web app URL and paste it above</li>
                <li>8. Test the connection to verify everything works</li>
              </ol>
              
              <div className={`mt-4 p-3 rounded ${
                isDark ? 'bg-blue-900' : 'bg-blue-50'
              }`}>
                <p className={`text-sm ${
                  isDark ? 'text-blue-200' : 'text-blue-800'
                }`}>
                  <strong>Note:</strong> You'll need to add the web app URL to your environment variables as 
                  <code className="ml-1 bg-slate-200 dark:bg-slate-800 px-1 rounded">VITE_APPS_SCRIPT_WEB_APP_URL</code> 
                  for the integration to work permanently.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Features List */}
        <div className={`p-4 rounded border ${
          isDark 
            ? 'bg-slate-700 border-slate-600' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <h4 className={`font-medium mb-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            Features
          </h4>
          <ul className={`space-y-1 text-sm ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <li>• Export dashboard data directly to Google Sheets</li>
            <li>• Automatic file naming with timestamps</li>
            <li>• Organized folder structure in Google Drive</li>
            <li>• Export metadata and filter information</li>
            <li>• No OAuth setup required - uses Google Apps Script</li>
            <li>• Works with all dashboard data formats</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DriveExportSettings;