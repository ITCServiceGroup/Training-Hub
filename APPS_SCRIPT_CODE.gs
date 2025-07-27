/**
 * Training Hub Google Apps Script Web App
 * 
 * This script receives dashboard export data from the Training Hub application
 * and creates Google Sheets with the data, organizing them in Drive folders.
 * 
 * Setup Instructions:
 * 1. Go to script.google.com
 * 2. Create new project named "Training Hub Export Handler"
 * 3. Replace default code with this content
 * 4. Deploy as Web App with execute as "Me" and access "Anyone"
 * 5. Copy the web app URL and add to your Training Hub environment
 * 
 * Required APIs: No additional APIs needed - uses built-in Services
 */

// Configuration - Update these values for your setup
const CONFIG = {
  // Drive folder ID where exports will be stored (get from folder URL)
  DRIVE_FOLDER_ID: '1bltBhf2eWmX0qA6I8IEw-bVOAs9aeoH8', // Replace with actual folder ID
  
  // Sheet naming format
  SHEET_NAME_PREFIX: 'Training Hub Export',
  
  // Maximum rows per sheet (Google Sheets limit is 10M cells)
  MAX_ROWS_PER_SHEET: 50000,
  
  // Enable debug logging
  DEBUG: true
};

/**
 * Handle POST requests from Training Hub application
 */
function doPost(e) {
  try {
    // Parse incoming JSON data
    let requestData;
    
    if (CONFIG.DEBUG) {
      console.log('POST Request received:', {
        timestamp: new Date().toISOString(),
        hasPostData: !!e.postData,
        hasContents: e.postData ? !!e.postData.contents : false,
        contentsLength: e.postData && e.postData.contents ? e.postData.contents.length : 0
      });
    }
    
    if (!e.postData || !e.postData.contents) {
      throw new Error('No data received in request');
    }
    
    try {
      requestData = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error('Invalid JSON data: ' + parseError.message);
    }
    
    if (CONFIG.DEBUG) {
      console.log('Received export request:', {
        timestamp: new Date().toISOString(),
        dataSize: requestData.data ? requestData.data.length : 0,
        dashboardName: requestData.dashboardName
      });
    }
    
    // Validate required fields
    if (!requestData.data || !Array.isArray(requestData.data)) {
      throw new Error('Invalid data format: data must be an array');
    }
    
    // Process the export
    const result = createGoogleSheet(requestData);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: 'Export completed successfully',
        fileId: result.fileId,
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Export failed:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests (for testing and exports)
 */
function doGet(e) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  try {
    // Check if this is an export request (has data parameter)
    if (e.parameter && e.parameter.data) {
      // Handle export request via GET
      if (CONFIG.DEBUG) {
        console.log('GET request with data parameter');
      }
      
      let requestData;
      try {
        // Decode base64 and parse JSON
        const decodedData = Utilities.base64Decode(decodeURIComponent(e.parameter.data));
        const jsonString = Utilities.newBlob(decodedData).getDataAsString();
        requestData = JSON.parse(jsonString);
      } catch (decodeError) {
        throw new Error('Failed to decode request data: ' + decodeError.message);
      }
      
      if (CONFIG.DEBUG) {
        console.log('Decoded export request:', {
          timestamp: new Date().toISOString(),
          dataSize: requestData.data ? requestData.data.length : 0,
          dashboardName: requestData.dashboardName
        });
      }
      
      // Validate required fields
      if (!requestData.data || !Array.isArray(requestData.data)) {
        throw new Error('Invalid data format: data must be an array');
      }
      
      // Process the export
      const result = createGoogleSheet(requestData);
      
      // Return success response
      return ContentService
        .createTextOutput(JSON.stringify({
          success: true,
          message: 'Export completed successfully',
          fileId: result.fileId,
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          timestamp: new Date().toISOString()
        }))
        .setMimeType(ContentService.MimeType.JSON)
        .setHeaders(corsHeaders);
    }
    
    // Default GET response (testing)
    return ContentService
      .createTextOutput(JSON.stringify({
        message: 'Training Hub Export Handler is running',
        timestamp: new Date().toISOString(),
        status: 'ready'
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(corsHeaders);
      
  } catch (error) {
    console.error('GET request failed:', error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders(corsHeaders);
  }
}

/**
 * Handle OPTIONS requests (CORS preflight)
 */
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setHeaders({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    });
}

/**
 * Create Google Sheet with dashboard data
 */
function createGoogleSheet(requestData) {
  const {
    data,
    dashboardName = 'Dashboard',
    timestamp = new Date().toISOString(),
    filters = {},
    metadata = {}
  } = requestData;
  
  // Generate filename with timestamp
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  const fileName = `${CONFIG.SHEET_NAME_PREFIX} - ${dashboardName} - ${dateStr} ${timeStr}`;
  
  // Create new spreadsheet
  const spreadsheet = SpreadsheetApp.create(fileName);
  const sheet = spreadsheet.getActiveSheet();
  
  // Rename the default sheet
  sheet.setName('Dashboard Data');
  
  // Process and add data
  if (data.length > 0) {
    // Handle different data formats
    let processedData;
    
    if (isTableData(data)) {
      processedData = processTableData(data);
    } else if (isChartData(data)) {
      processedData = processChartData(data);
    } else {
      processedData = processGenericData(data);
    }
    
    // Add headers and data to sheet
    if (processedData.length > 0) {
      const range = sheet.getRange(1, 1, processedData.length, processedData[0].length);
      range.setValues(processedData);
      
      // Format headers
      formatHeaders(sheet, processedData[0].length);
    }
  }
  
  // Add metadata sheet
  addMetadataSheet(spreadsheet, {
    dashboardName,
    timestamp,
    filters,
    metadata,
    rowCount: data.length
  });
  
  // Move to designated folder
  moveToFolder(spreadsheet.getId());
  
  // Apply formatting
  formatSpreadsheet(spreadsheet);
  
  return {
    fileId: spreadsheet.getId(),
    fileUrl: spreadsheet.getUrl(),
    fileName: fileName
  };
}

/**
 * Determine if data is table format
 */
function isTableData(data) {
  return data.length > 0 && 
         data[0].hasOwnProperty('headers') && 
         data[0].hasOwnProperty('rows');
}

/**
 * Determine if data is chart format
 */
function isChartData(data) {
  return data.length > 0 && 
         (data[0].hasOwnProperty('x') || 
          data[0].hasOwnProperty('label') || 
          data[0].hasOwnProperty('id'));
}

/**
 * Process table-style data
 */
function processTableData(data) {
  const result = [];
  
  // Add headers
  if (data[0].headers) {
    result.push(data[0].headers);
  }
  
  // Add rows
  data.forEach(table => {
    if (table.rows && Array.isArray(table.rows)) {
      table.rows.forEach(row => {
        result.push(Array.isArray(row) ? row : Object.values(row));
      });
    }
  });
  
  return result;
}

/**
 * Process chart-style data
 */
function processChartData(data) {
  const result = [];
  
  // Determine headers from first data point
  const firstItem = data[0];
  const headers = Object.keys(firstItem);
  result.push(headers);
  
  // Add data rows
  data.forEach(item => {
    const row = headers.map(header => {
      const value = item[header];
      // Handle nested objects/arrays
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    });
    result.push(row);
  });
  
  return result;
}

/**
 * Process generic data format
 */
function processGenericData(data) {
  const result = [];
  
  if (Array.isArray(data[0])) {
    // Data is already in array format
    return data;
  } else if (typeof data[0] === 'object') {
    // Convert objects to rows
    const headers = Object.keys(data[0]);
    result.push(headers);
    
    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header];
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value;
      });
      result.push(row);
    });
  } else {
    // Simple array of values
    result.push(['Value']);
    data.forEach(item => {
      result.push([item]);
    });
  }
  
  return result;
}

/**
 * Add metadata sheet with export information
 */
function addMetadataSheet(spreadsheet, metadata) {
  const metaSheet = spreadsheet.insertSheet('Export Info');
  
  const metaData = [
    ['Export Information', ''],
    ['Dashboard Name', metadata.dashboardName],
    ['Export Date', new Date(metadata.timestamp).toLocaleString()],
    ['Data Rows', metadata.rowCount],
    ['', ''],
    ['Applied Filters', ''],
  ];
  
  // Add filter information
  if (metadata.filters && Object.keys(metadata.filters).length > 0) {
    Object.entries(metadata.filters).forEach(([key, value]) => {
      metaData.push([key, typeof value === 'object' ? JSON.stringify(value) : value]);
    });
  } else {
    metaData.push(['No filters applied', '']);
  }
  
  // Add additional metadata
  if (metadata.metadata && Object.keys(metadata.metadata).length > 0) {
    metaData.push(['', '']);
    metaData.push(['Additional Information', '']);
    Object.entries(metadata.metadata).forEach(([key, value]) => {
      metaData.push([key, typeof value === 'object' ? JSON.stringify(value) : value]);
    });
  }
  
  const range = metaSheet.getRange(1, 1, metaData.length, 2);
  range.setValues(metaData);
  
  // Format metadata sheet
  metaSheet.getRange('A1:B1').setFontWeight('bold').setFontSize(12);
  metaSheet.getRange('A6').setFontWeight('bold');
  metaSheet.setColumnWidth(1, 200);
  metaSheet.setColumnWidth(2, 300);
}

/**
 * Format spreadsheet headers and styling
 */
function formatHeaders(sheet, columnCount) {
  const headerRange = sheet.getRange(1, 1, 1, columnCount);
  
  headerRange
    .setFontWeight('bold')
    .setBackground('#4285F4')
    .setFontColor('white')
    .setHorizontalAlignment('center');
  
  // Auto-resize columns
  for (let i = 1; i <= columnCount; i++) {
    sheet.autoResizeColumn(i);
  }
  
  // Freeze header row
  sheet.setFrozenRows(1);
}

/**
 * Apply general formatting to spreadsheet
 */
function formatSpreadsheet(spreadsheet) {
  const sheets = spreadsheet.getSheets();
  
  sheets.forEach(sheet => {
    // Add borders to data
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    
    if (lastRow > 0 && lastCol > 0) {
      const dataRange = sheet.getRange(1, 1, lastRow, lastCol);
      dataRange.setBorder(true, true, true, true, true, true);
    }
  });
}

/**
 * Move spreadsheet to designated folder
 */
function moveToFolder(fileId) {
  try {
    if (!CONFIG.DRIVE_FOLDER_ID || CONFIG.DRIVE_FOLDER_ID === 'YOUR_DRIVE_FOLDER_ID_HERE') {
      console.log('No folder ID configured, file will remain in root');
      return;
    }
    
    const file = DriveApp.getFileById(fileId);
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    
    // Remove from root and add to target folder
    const rootFolder = DriveApp.getRootFolder();
    rootFolder.removeFile(file);
    folder.addFile(file);
    
    if (CONFIG.DEBUG) {
      console.log(`File moved to folder: ${folder.getName()}`);
    }
    
  } catch (error) {
    console.error('Failed to move file to folder:', error);
    // Don't throw error - file creation was successful
  }
}

/**
 * Test function for development
 */
function testExport() {
  const testData = {
    dashboardName: 'Test Dashboard',
    timestamp: new Date().toISOString(),
    data: [
      { name: 'John Doe', score: 85, date: '2024-01-15' },
      { name: 'Jane Smith', score: 92, date: '2024-01-16' },
      { name: 'Bob Johnson', score: 78, date: '2024-01-17' }
    ],
    filters: {
      dateRange: '2024-01-01 to 2024-01-31',
      department: 'Engineering'
    },
    metadata: {
      totalRecords: 3,
      exportedBy: 'Test User'
    }
  };
  
  try {
    const result = createGoogleSheet(testData);
    console.log('Test export successful:', result);
    return result;
  } catch (error) {
    console.error('Test export failed:', error);
    throw error;
  }
}

/**
 * Setup function to create initial folder structure
 */
function setupDriveFolder() {
  const folderName = 'Training Hub Exports';
  
  try {
    // Check if folder already exists
    const folders = DriveApp.getFoldersByName(folderName);
    
    if (folders.hasNext()) {
      const folder = folders.next();
      console.log(`Folder already exists: ${folder.getName()}`);
      console.log(`Folder ID: ${folder.getId()}`);
      console.log(`Update CONFIG.DRIVE_FOLDER_ID with: ${folder.getId()}`);
      return folder.getId();
    } else {
      // Create new folder
      const folder = DriveApp.createFolder(folderName);
      console.log(`Created new folder: ${folder.getName()}`);
      console.log(`Folder ID: ${folder.getId()}`);
      console.log(`Update CONFIG.DRIVE_FOLDER_ID with: ${folder.getId()}`);
      return folder.getId();
    }
  } catch (error) {
    console.error('Failed to setup folder:', error);
    throw error;
  }
}