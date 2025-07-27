/**
 * Google Apps Script Export Service
 * 
 * Handles exporting dashboard data to Google Sheets via Google Apps Script web app
 * Simple HTTP POST integration - no OAuth or complex authentication required
 */

class AppsScriptExportService {
  constructor() {
    // Get Apps Script web app URL from environment or config
    this.webAppUrl = import.meta.env.VITE_APPS_SCRIPT_WEB_APP_URL || '';
    this.isEnabled = !!this.webAppUrl;
    this.requestTimeout = 30000; // 30 seconds
  }

  /**
   * Check if Google Drive export is configured and available
   */
  isConfigured() {
    return this.isEnabled && this.webAppUrl.length > 0;
  }

  /**
   * Export dashboard data to Google Sheets
   */
  async exportToGoogleSheets(data, options = {}) {
    if (!this.isConfigured()) {
      throw new Error('Google Drive export is not configured. Please check your settings.');
    }

    const {
      dashboardName = 'Training Hub Dashboard',
      includeFilters = true,
      filters = {},
      metadata = {}
    } = options;

    // Prepare export payload
    const exportPayload = {
      data: this.prepareDataForExport(data),
      dashboardName,
      timestamp: new Date().toISOString(),
      filters: includeFilters ? filters : {},
      metadata: {
        ...metadata,
        exportedFrom: 'Training Hub Dashboard',
        userAgent: navigator.userAgent,
        exportVersion: '1.0'
      }
    };

    try {
      console.log('📊 Exporting to Google Sheets...', {
        dashboardName,
        dataRows: exportPayload.data.length,
        timestamp: exportPayload.timestamp
      });

      // Make request to Apps Script web app
      const response = await this.makeRequest(exportPayload);

      // Debug: log the full response
      console.log('Apps Script response:', response);

      if (!response) {
        throw new Error('No response received from Apps Script');
      }

      if (response.success) {
        console.log('✅ Export sent successfully:', response);
        return {
          success: true,
          fileId: null, // Not available with no-cors mode
          fileUrl: response.fileUrl || 'Check your Google Drive',
          fileName: null, // Not available with no-cors mode
          message: response.message || 'Data sent to Google Sheets successfully'
        };
      } else {
        throw new Error(response.error || 'Export failed - no error details provided');
      }

    } catch (error) {
      console.error('❌ Google Sheets export failed:', error);
      throw new Error(`Export failed: ${error.message}`);
    }
  }

  /**
   * Make HTTP request to Apps Script web app
   * Uses POST with no-cors mode to bypass CORS restrictions
   */
  async makeRequest(payload) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.requestTimeout);

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'POST',
        mode: 'no-cors', // This bypasses CORS but limits response access
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // With no-cors mode, we can't read the response or check status
      // We can only know if the fetch completed without throwing
      console.log('Request sent to Apps Script successfully');
      
      // Since we can't read the response with no-cors, we'll assume success
      // The user will see the result in their Google Drive
      return {
        success: true,
        message: 'Export sent to Google Apps Script',
        fileUrl: 'Check your Google Drive for the exported file'
      };

    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Export request timed out. Please try again.');
      }
      
      // Add more detailed error information
      console.error('Full error details:', {
        error: error.message,
        webAppUrl: this.webAppUrl
      });
      
      throw error;
    }
  }

  /**
   * Prepare different data formats for export
   */
  prepareDataForExport(rawData) {
    if (!rawData || (!Array.isArray(rawData) && typeof rawData !== 'object')) {
      return [];
    }

    // Handle different data structures
    if (Array.isArray(rawData)) {
      return this.processArrayData(rawData);
    } else if (rawData.data && Array.isArray(rawData.data)) {
      return this.processArrayData(rawData.data);
    } else if (typeof rawData === 'object') {
      return this.processObjectData(rawData);
    }

    return [];
  }

  /**
   * Process array-style data (most common format)
   */
  processArrayData(data) {
    if (data.length === 0) return [];

    const firstItem = data[0];

    // Handle table format with headers and rows
    if (firstItem && firstItem.headers && firstItem.rows) {
      return this.processTableFormat(data);
    }

    // Handle chart data format
    if (firstItem && typeof firstItem === 'object' && !Array.isArray(firstItem)) {
      return this.processChartFormat(data);
    }

    // Handle simple array of arrays
    if (Array.isArray(firstItem)) {
      return data;
    }

    // Handle array of primitives
    return data.map(item => [item]);
  }

  /**
   * Process table format data
   */
  processTableFormat(tables) {
    const result = [];
    
    tables.forEach((table, index) => {
      // Add table separator if multiple tables
      if (index > 0) {
        result.push([]); // Empty row separator
      }
      
      // Add headers
      if (table.headers) {
        result.push(table.headers);
      }
      
      // Add rows
      if (table.rows && Array.isArray(table.rows)) {
        table.rows.forEach(row => {
          if (Array.isArray(row)) {
            result.push(row);
          } else if (typeof row === 'object') {
            result.push(Object.values(row));
          } else {
            result.push([row]);
          }
        });
      }
    });

    return result;
  }

  /**
   * Process chart format data (objects with properties)
   */
  processChartFormat(data) {
    if (data.length === 0) return [];

    // Get all unique keys from all objects
    const allKeys = new Set();
    data.forEach(item => {
      if (typeof item === 'object' && item !== null) {
        Object.keys(item).forEach(key => allKeys.add(key));
      }
    });

    const headers = Array.from(allKeys);
    const result = [headers];

    // Convert each object to a row
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        
        // Handle different value types
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'object') {
          return JSON.stringify(value);
        } else if (typeof value === 'boolean') {
          return value ? 'Yes' : 'No';
        } else if (typeof value === 'number') {
          return value;
        } else {
          return String(value);
        }
      });
      
      result.push(row);
    });

    return result;
  }

  /**
   * Process single object data
   */
  processObjectData(obj) {
    const result = [['Property', 'Value']];
    
    Object.entries(obj).forEach(([key, value]) => {
      let processedValue;
      
      if (value === null || value === undefined) {
        processedValue = '';
      } else if (typeof value === 'object') {
        processedValue = JSON.stringify(value);
      } else {
        processedValue = String(value);
      }
      
      result.push([key, processedValue]);
    });

    return result;
  }

  /**
   * Test the connection to Apps Script web app
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'Apps Script web app URL not configured'
      };
    }

    try {
      const response = await fetch(this.webAppUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          message: result.message || 'Connection successful',
          status: result.status
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get current configuration status
   */
  getStatus() {
    return {
      isConfigured: this.isConfigured(),
      webAppUrl: this.webAppUrl ? this.webAppUrl.substring(0, 50) + '...' : 'Not configured',
      enabled: this.isEnabled
    };
  }
}

// Create and export singleton instance
const appsScriptExportService = new AppsScriptExportService();

export default appsScriptExportService;