# Saved Layouts System Guide

## Overview

The Saved Layouts system allows users to save, manage, and quickly switch between custom dashboard configurations. This includes tile arrangements, global filters, and layout preferences.

## Features

### ✅ **Core Functionality**
- **Save Current Layout**: Save the current tile arrangement and filters as a named layout
- **Apply Saved Layout**: Instantly switch to any saved layout configuration
- **Edit Layout Details**: Update layout names and descriptions
- **Set Default Layout**: Mark a layout as the default for automatic loading
- **Duplicate Layouts**: Create copies of existing layouts for customization
- **Delete Layouts**: Remove unwanted layouts

### ✅ **User Experience**
- **Visual Indicators**: See which layout is currently active and if there are unsaved changes
- **Quick Access**: Access saved layouts via the "Layouts" button in the dashboard header
- **Validation**: Prevent saving invalid layouts with helpful error messages
- **Persistence**: Layouts are saved to database (with localStorage fallback)
- **Limit Management**: Maximum of 10 saved layouts per user

## How to Use

### 1. **Accessing Saved Layouts**
- Click the **"Layouts"** button in the dashboard header
- The button shows:
  - Number of saved layouts
  - Orange dot if there are unsaved changes
  - Green dot if a saved layout is currently active

### 2. **Saving a New Layout**
1. Arrange your dashboard tiles as desired
2. Set your preferred global filters
3. Click the **"Layouts"** button
4. Click **"Save Current"** (if you have space for more layouts)
5. Enter a **name** (required, max 50 characters)
6. Optionally add a **description** (max 200 characters)
7. Click **"Save Layout"**

### 3. **Applying a Saved Layout**
1. Click the **"Layouts"** button
2. Find the layout you want to apply
3. Click the **eye icon** (👁️) next to the layout
4. The dashboard will instantly update with the saved configuration

### 4. **Managing Layouts**

#### **Set as Default**
- Click the **star icon** (⭐) to set a layout as your default
- Default layouts load automatically when you visit the dashboard
- Only one layout can be default at a time

#### **Edit Layout Details**
- Click the **edit icon** (✏️) to modify name and description
- Click **"Save"** to confirm changes or **"Cancel"** to discard

#### **Duplicate Layout**
- Click the **copy icon** (📋) to create a duplicate
- The copy will be named "[Original Name] (Copy)"
- Useful for creating variations of existing layouts

#### **Delete Layout**
- Click the **trash icon** (🗑️) to delete a layout
- This action cannot be undone
- If you delete your default layout, no layout will be set as default

## Technical Details

### **Data Storage**
- **Primary**: PostgreSQL database table `dashboard_layouts`
- **Fallback**: Browser localStorage for offline/unauthenticated users
- **Security**: Row Level Security (RLS) ensures users only see their own layouts

### **Layout Structure**
```json
{
  "id": "layout_1234567890_abc123",
  "name": "My Custom Layout",
  "description": "Focused on performance metrics",
  "tiles": [
    {
      "id": "score-trend",
      "position": {"x": 0, "y": 0, "w": 2, "h": 1},
      "priority": 1
    }
  ],
  "filters": {
    "dateRange": {
      "preset": "last_month",
      "startDate": null,
      "endDate": null
    },
    "quickPreset": "last_month"
  },
  "layout_type": "custom",
  "is_default": false
}
```

### **Integration Points**
- **Dashboard Presets**: Works alongside existing preset system
- **Drag & Drop**: Manual tile reordering clears active saved layout
- **Global Filters**: Filter changes are tracked for unsaved changes detection
- **Cross-Chart Filtering**: Saved layouts preserve drill-down and filter states

## Best Practices

### **Naming Conventions**
- Use descriptive names: "Executive Overview", "Weekly Review", "Performance Deep Dive"
- Include context: "Q4 Analysis", "Team Meeting View", "Monthly Report"
- Keep names concise but meaningful

### **Layout Organization**
- **Create role-specific layouts**: Different views for executives, managers, analysts
- **Save milestone configurations**: Layouts for specific reporting periods or events
- **Use descriptions**: Add context about when and why to use each layout

### **Workflow Tips**
1. **Start with presets**: Use built-in presets as starting points
2. **Customize gradually**: Make small adjustments and save iterations
3. **Test thoroughly**: Verify layouts work with different data sets
4. **Regular cleanup**: Remove outdated or unused layouts

## Troubleshooting

### **Common Issues**

#### **"Cannot save empty layout"**
- Ensure at least one tile is visible in your dashboard
- Check that your tile arrangement isn't completely empty

#### **"Layout name is required"**
- Enter a name in the save dialog
- Names cannot be empty or just whitespace

#### **"Failed to save layout"**
- Check your internet connection
- Try again in a few moments
- Layout will fallback to localStorage if database is unavailable

#### **"Maximum layouts reached"**
- You can save up to 10 layouts per user
- Delete unused layouts to make space for new ones

### **Data Recovery**
- Layouts are automatically backed up to localStorage
- If database sync fails, layouts remain accessible locally
- Contact support if you lose important layouts

## API Reference

### **Key Functions**
- `saveCurrentLayout(name, description, tileOrder, filters)` - Save current state
- `getLayoutById(layoutId)` - Retrieve specific layout
- `setLayoutAsDefault(layoutId)` - Set default layout
- `deleteLayoutById(layoutId)` - Remove layout
- `hasUnsavedChanges(currentState, activeLayoutId)` - Check for changes

### **Hooks**
- `useSavedLayouts()` - Main hook for layout management
- `getLayoutStats()` - Get usage statistics
- `validateLayout(layout)` - Validate layout structure

## Future Enhancements

### **Planned Features**
- **Layout Sharing**: Share layouts between users
- **Template Gallery**: Pre-built layout templates
- **Import/Export**: Backup and restore layouts
- **Layout History**: Track changes over time
- **Advanced Permissions**: Role-based layout access

### **Integration Opportunities**
- **Scheduled Reports**: Auto-apply layouts for scheduled exports
- **Team Dashboards**: Shared layouts for team collaboration
- **Mobile Optimization**: Responsive layout configurations
