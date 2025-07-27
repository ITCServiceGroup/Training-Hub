# Google Drive Integration Setup Guide

This guide will walk you through setting up Google Drive integration for your Training Hub dashboard exports using Google Apps Script.

## Overview

The integration uses Google Apps Script to receive dashboard data from your Training Hub application and automatically create Google Sheets with the data, organizing them in your Google Drive.

**Benefits of this approach:**
- ✅ No Google Cloud Console setup required
- ✅ No OAuth verification process needed
- ✅ No domain verification required
- ✅ Free to use (within Google's generous limits)
- ✅ Automatic authentication handled by Google
- ✅ Simple HTTP POST integration

## Step 1: Create Google Apps Script Project

1. **Go to Google Apps Script**
   - Open [script.google.com](https://script.google.com) in your browser
   - Sign in with your Google account

2. **Create New Project**
   - Click "New Project"
   - Name it "Training Hub Export Handler"
   - You should see a default `Code.gs` file with a `myFunction()` placeholder

3. **Replace Default Code**
   - Delete the default code in `Code.gs`
   - Copy the entire contents of `APPS_SCRIPT_CODE.gs` file from your project directory
   - Paste it into the Apps Script editor

## Step 2: Configure Drive Folder

1. **Create Export Folder**
   - Go to [Google Drive](https://drive.google.com)
   - Create a new folder named "Training Hub Exports" (or any name you prefer)
   - Open the folder and copy the folder ID from the URL
   - Example URL: `https://drive.google.com/drive/folders/1ABCDEfghijklMNOPQRSTuvwxyz123456`
   - The folder ID is: `1ABCDEfghijklMNOPQRSTuvwxyz123456`

2. **Update Apps Script Configuration**
   - In your Apps Script project, find the `CONFIG` object at the top of the code
   - Replace `YOUR_DRIVE_FOLDER_ID_HERE` with your actual folder ID:
   ```javascript
   const CONFIG = {
     DRIVE_FOLDER_ID: '1ABCDEfghijklMNOPQRSTuvwxyz123456', // Your actual folder ID
     // ... other settings
   };
   ```

## Step 3: Deploy Apps Script as Web App

1. **Deploy the Script**
   - In the Apps Script editor, click "Deploy" → "New deployment"
   - Next to "Select type," click the gear icon and select "Web app"
   
2. **Configure Deployment Settings**
   - **Description**: "Training Hub Export Handler v1"
   - **Execute as**: "Me" (your email address)
   - **Who has access**: "Anyone"
   
3. **Deploy and Authorize**
   - Click "Deploy"
   - Google will ask for authorization - click "Authorize access"
   - You may see a warning about the app not being verified - click "Advanced" → "Go to Training Hub Export Handler (unsafe)"
   - Review and grant the requested permissions (Drive and Sheets access)

4. **Copy Web App URL**
   - After deployment, you'll get a web app URL that looks like:
   - `https://script.google.com/macros/s/AKfycby...../exec`
   - **Copy this URL** - you'll need it for the Training Hub configuration

## Step 4: Configure Training Hub Application

1. **Add Environment Variable**
   - Create or update your `.env` file in the Training Hub project root
   - Add the following line with your web app URL:
   ```
   VITE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```

2. **Restart Development Server**
   - Stop your development server (Ctrl+C)
   - Start it again: `npm run dev` or `yarn dev`

## Step 5: Test the Integration

1. **Open Training Hub Settings**
   - Navigate to your Training Hub dashboard
   - Go to Settings and look for the "Google Drive Export" section

2. **Test Connection**
   - The web app URL should be automatically detected
   - Click the test button to verify the connection
   - You should see a "Connection successful" message

3. **Test Export**
   - Go to any dashboard with data
   - Click the "Export" dropdown
   - You should now see "Export to Google Sheets" option
   - Try exporting some dashboard data
   - Check your Google Drive folder for the new spreadsheet

## Step 6: Verify Everything Works

1. **Check Google Drive**
   - Go to your "Training Hub Exports" folder
   - You should see a new Google Sheets file with your dashboard data
   - The file should be named with timestamp: "Training Hub Export - Dashboard Name - Date Time"

2. **Check Sheet Contents**
   - Open the spreadsheet
   - You should see two sheets:
     - "Dashboard Data" - containing your exported data
     - "Export Info" - containing metadata about the export

## Troubleshooting

### Connection Test Fails
- **Check the web app URL** - make sure it ends with `/exec`
- **Verify deployment settings** - ensure "Who has access" is set to "Anyone"
- **Try redeploying** - create a new deployment if the first one doesn't work

### Export Button Not Showing
- **Check environment variable** - make sure `VITE_APPS_SCRIPT_WEB_APP_URL` is set correctly
- **Restart development server** - environment variables require a restart
- **Verify data availability** - the button only shows when dashboard has `rawData`

### Permission Errors
- **Re-authorize the script** - go to Apps Script → "Executions" and check for errors
- **Check Google Drive permissions** - make sure the script can access your Drive
- **Try the setup function** - run `setupDriveFolder()` in Apps Script to test permissions

### Data Not Appearing in Sheets
- **Check the Apps Script logs** - go to "Executions" tab to see detailed error messages
- **Verify folder ID** - make sure the folder ID in the script is correct
- **Test with simple data** - try exporting a small dataset first

## Apps Script Functions Available

Your deployed Apps Script includes several helpful functions:

1. **`testExport()`** - Test the export functionality with sample data
2. **`setupDriveFolder()`** - Create the export folder and get its ID
3. **`doGet()`** - Test endpoint (responds to GET requests)
4. **`doPost()`** - Main export endpoint (handles Training Hub exports)

You can run these functions directly in the Apps Script editor for testing.

## Security Notes

- The Apps Script runs under your Google account
- Only you can access the script editor and modify the code
- Exported data is stored in your personal Google Drive
- The web app URL is public but only accepts properly formatted data
- No sensitive credentials are stored in your Training Hub application

## Limits and Quotas

Google Apps Script has generous limits for this use case:
- **Execution time**: 6 minutes per function call
- **Daily triggers**: 20 per script per day
- **Email quota**: 100 emails per day
- **Drive operations**: Very high limits for personal use

For a single company dashboard, these limits are more than sufficient.

## Next Steps

Once everything is working:

1. **Bookmark your Google Drive exports folder** for easy access
2. **Set up automatic cleanup** if desired (optional)
3. **Share the folder** with team members who need access to exports
4. **Create additional folders** for different types of exports if needed

## Support

If you encounter issues:

1. Check the Apps Script execution logs for detailed error messages
2. Verify all configuration steps were completed correctly
3. Test with a simple export first before trying complex dashboards
4. Make sure your Google account has sufficient Drive storage space

The integration is designed to be simple and reliable. Most issues are related to configuration rather than the code itself.