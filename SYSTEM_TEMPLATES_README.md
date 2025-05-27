# System Templates Feature

This document explains how to use and manage the System Templates feature in the Training Hub application.

## Overview

System Templates are pre-built, globally available templates that provide users with professional starting points for their study guides. Unlike user-created templates stored in the database, system templates are stored in the codebase and are available to all users.

## Features

### 1. **System Templates Library**
- Pre-built templates available to all users
- Stored in the codebase (not database)
- Clearly distinguished from user templates with visual indicators
- Organized by categories (Basic, Interactive, Educational, Layout, etc.)

### 2. **Developer Tools**
- "Save as System Template" feature for converting study guides to system templates
- Code generation for easy addition to the template library
- Developer-only access controls

### 3. **Visual Indicators**
- System templates have blue styling and "System" badges
- Star icons and gear icons to distinguish from user templates
- Special highlighting in the template selection modal

## How to Use

### For Users
1. **Accessing Templates**: Click "Create New Study Guide" to see all available templates
2. **Identifying System Templates**: Look for the blue "System" badge and star icon
3. **Using Templates**: Click on any template to start creating a study guide based on it

### For Developers
1. **Creating System Templates**:
   - Open any study guide in the ContentEditor
   - Click "Save as System Template" (orange button, developer-only)
   - Fill in template details and click "Create System Template"
   - Copy the generated code

2. **Adding to Codebase**:
   - Open `v2/src/data/systemTemplates.js`
   - Add the generated code to the `systemTemplates` array
   - Save the file

## Configuration

### Developer Access
Edit `v2/src/config/developer.js` to control system template features:

```javascript
export const developerConfig = {
  // Enable/disable system template creation
  enableSystemTemplateCreation: true,

  // Developer identifier (change to your email)
  developerIdentifier: 'developer@traininghub.com',

  // Enable debug logging
  debugSystemTemplates: false
};
```

### Removing Developer Features
To hide the "Save as System Template" button after building your template library:

1. **Option 1**: Set `enableSystemTemplateCreation: false` in `developer.js`
2. **Option 2**: Remove the developer check in ContentEditor:
   ```javascript
   // Remove or comment out this condition
   {isDev && (
     <button onClick={handleSaveAsSystemTemplate}>
       Save as System Template
     </button>
   )}
   ```

## File Structure

```
v2/
├── src/
│   ├── data/
│   │   ├── systemTemplates.js          # Main system templates index
│   │   └── templates/                  # Individual template files
│   │       ├── basic-text-layout.js    # Basic text template
│   │       ├── interactive-learning.js # Interactive template
│   │       ├── step-by-step-guide.js   # Tutorial template
│   │       ├── comparison-layout.js    # Comparison template
│   │       └── _template-example.js    # Template for creating new ones
│   ├── services/
│   │   ├── systemTemplates.js          # System templates service
│   │   └── api/templates.js            # Combined templates service
│   ├── config/
│   │   └── developer.js                # Developer configuration
│   └── components/
│       └── TemplatePreview/            # Template preview component
└── SYSTEM_TEMPLATES_README.md          # This documentation
```

## Current System Templates

1. **Basic Text Layout** - Simple text-based template
2. **Interactive Learning** - Template with colored sections and interactive elements
3. **Step-by-Step Guide** - Structured tutorial template with numbered steps
4. **Comparison Layout** - Side-by-side comparison template

## Adding New System Templates

### Method 1: Using the Developer Tool
1. Create a study guide with your desired content
2. Click "Save as System Template"
3. Copy the generated code
4. Create a new file in `v2/src/data/templates/` (e.g., `my-template.js`)
5. Use the generated code to create the template object
6. Import and add it to the array in `systemTemplates.js`

### Method 2: Manual Creation
1. Copy `v2/src/data/templates/_template-example.js` to a new file
2. Update the template object with your content
3. **IMPORTANT**: Ensure all `padding` and `margin` values are arrays like `["0", "0", "0", "0"]`
4. Import the new template in `v2/src/data/systemTemplates.js`
5. Add it to the `systemTemplates` array

### Method 3: From Existing Study Guide
1. Export an existing study guide's JSON content
2. Create a new template file using the structure from `_template-example.js`
3. Replace the content with your exported JSON
4. Fix any padding/margin format issues (strings → arrays)

## Template Categories

- **Basic**: Simple, straightforward templates
- **Interactive**: Templates with interactive elements
- **Educational**: Learning-focused templates
- **Layout**: Structure and design-focused templates
- **Advanced**: Complex, feature-rich templates
- **Business**: Professional and business-oriented templates

## Best Practices

1. **Template Naming**: Use descriptive names that clearly indicate the template's purpose
2. **Descriptions**: Write clear, helpful descriptions explaining when to use each template
3. **Tags**: Add relevant tags for better searchability
4. **Content Quality**: Ensure templates provide good starting points with placeholder content
5. **Testing**: Test templates thoroughly before adding to the system

## Troubleshooting

### Template Not Appearing
- Check that `isSystemTemplate: true` is set
- Verify the template is imported and added to the `systemTemplates` array
- Check browser console for any JavaScript errors
- Ensure the template file exports the template object correctly

### Developer Button Not Showing
- Verify `enableSystemTemplateCreation: true` in `developer.js`
- Check that the developer identifier matches your setup
- Ensure you're in the ContentEditor with a valid study guide

### Template Loading Errors (padding.every is not a function)
- **MOST COMMON ISSUE**: Check that all `padding` and `margin` values are arrays
- Change `"padding": "20px"` to `"padding": ["20", "20", "20", "20"]`
- Change `"margin": "16px"` to `"margin": ["16", "16", "16", "16"]`
- Use the `_template-example.js` as a reference for correct formatting

### Template Preview Issues
- Verify the `content` field contains valid Craft.js JSON
- Check that all referenced components exist
- Test the template by creating a study guide from it
- Ensure parent-child node relationships are correct in the JSON

## Future Enhancements

Potential improvements to consider:
- Template versioning system
- Template usage analytics
- Community template sharing
- Template categories management UI
- Bulk template import/export tools

## Support

For questions or issues with the System Templates feature, refer to the main application documentation or contact the development team.
