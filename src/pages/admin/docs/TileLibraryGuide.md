# Tile Library System Guide

## Overview

The Tile Library system provides a comprehensive interface for users to customize their dashboard by adding, removing, and organizing chart tiles. This system integrates seamlessly with the Saved Layouts functionality to create fully customizable dashboard experiences.

## Features

### ✅ **Core Functionality**
- **Browse Available Tiles**: Explore all available chart types organized by category
- **Add/Remove Tiles**: Dynamically add or remove charts from your dashboard
- **Search & Filter**: Find specific tiles using search or category filters
- **Drag & Drop Reordering**: Rearrange tiles using intuitive drag-and-drop
- **Integration with Saved Layouts**: Save custom tile arrangements as layouts

### ✅ **Tile Organization**
- **Categories**: Tiles organized into logical groups (Performance, Time, People, Insights)
- **Popularity Ranking**: See most popular tiles based on usage
- **Core vs Optional**: Distinguish between essential and specialized charts
- **Size Information**: View tile dimensions and constraints

## How to Use

### 1. **Accessing the Tile Library**
- Click the **"Tiles"** button in the dashboard header
- The button shows the current number of active tiles
- Opens the comprehensive Tile Library interface

### 2. **Browsing Tiles**

#### **Category View** (Default)
- Tiles grouped by category: Performance Analytics, Time Analysis, People & Teams, Advanced Insights
- Each category shows its purpose and available tiles
- Visual icons and descriptions for each tile

#### **Popular View**
- Tiles ranked by popularity and usage
- Helps discover commonly used charts
- Shows popularity percentage for each tile

#### **Search View**
- Type in the search box to find specific tiles
- Searches tile names, descriptions, and tags
- Real-time filtering as you type

### 3. **Managing Tiles**

#### **Adding Tiles**
- Click the **"+"** button on any tile card
- Tile immediately appears on your dashboard
- Added tiles show with a green border and checkmark

#### **Removing Tiles**
- Click the **"×"** button on tiles already in your dashboard
- Tile is immediately removed from the dashboard
- Can be re-added at any time

#### **Filtering Options**
- **"Available Only"** toggle: Show only tiles not currently on dashboard
- **Category filters**: Focus on specific types of charts
- **Search**: Find tiles by name, description, or functionality

### 4. **Tile Information**

#### **Tile Cards Show:**
- **Name & Description**: Clear identification and purpose
- **Category Icon**: Visual category identification
- **Size Information**: Tile dimensions (1×1, 2×1, etc.)
- **Core Badge**: Indicates essential vs optional tiles
- **Popularity Score**: Usage ranking percentage
- **Tags**: Searchable keywords for functionality

## Tile Categories

### 📊 **Performance Analytics** (Green)
Charts focused on test scores and performance metrics:
- **Score Distribution**: Score ranges and distributions
- **Score Trend**: Performance over time with learning curves
- **Pass/Fail Rate**: Success rate visualization
- **Top/Bottom Performers**: User ranking and leaderboards

### ⏰ **Time Analysis** (Blue)
Charts analyzing time-based patterns:
- **Time Distribution**: Test completion time patterns
- **Time vs Score**: Efficiency analysis and correlations

### 👥 **People & Teams** (Purple)
Charts focused on users and team performance:
- **Supervisor Performance**: Team leader effectiveness
- **Supervisor Effectiveness**: Training impact analysis
- **Market Results**: Regional/location-based performance

### 🎯 **Advanced Insights** (Orange)
Specialized analytics and deep-dive charts:
- **Quiz Type Performance**: Performance by quiz category
- **Question Analytics**: Individual question difficulty analysis
- **Retake Analysis**: Learning improvement patterns

## Integration with Saved Layouts

### **Seamless Integration**
- **Save Custom Arrangements**: Save your tile selection and arrangement as a layout
- **Load Saved Layouts**: Instantly apply saved tile configurations
- **Layout Switching**: Switch between different tile arrangements for different purposes
- **Automatic Sync**: Tile changes automatically update layout status

### **Workflow Example**
1. **Start with Default**: Begin with the default tile arrangement
2. **Customize**: Add/remove tiles based on your needs
3. **Arrange**: Drag tiles to your preferred positions
4. **Save**: Save the configuration as a named layout
5. **Switch**: Easily switch between different tile arrangements

## Technical Details

### **Tile Configuration**
```javascript
{
  id: 'score-distribution',
  name: 'Score Distribution',
  description: 'Distribution of quiz scores across different ranges',
  category: 'performance',
  icon: FaChartBar,
  component: 'ScoreDistributionChart',
  size: { w: 1, h: 1 },
  minSize: { w: 1, h: 1 },
  maxSize: { w: 2, h: 2 },
  tags: ['scores', 'distribution', 'performance'],
  isCore: true,
  popularity: 95
}
```

### **Available Tiles**
- **14 Total Tiles**: Comprehensive chart library
- **4 Categories**: Logical organization
- **6 Core Tiles**: Essential charts for most users
- **8 Optional Tiles**: Specialized analysis tools

### **Size System**
- **Small (1×1)**: Compact charts for overview data
- **Medium (2×1)**: Standard charts with more detail
- **Large (2×2)**: Comprehensive charts with full features
- **Wide (3×1)**: Timeline and trend charts
- **Tall (1×2)**: Vertical data displays

## Best Practices

### **Dashboard Design**
- **Start with Core Tiles**: Begin with essential charts
- **Add Gradually**: Add specialized tiles as needed
- **Consider Audience**: Different tiles for different user roles
- **Balance Information**: Mix overview and detailed charts

### **Tile Selection**
- **Performance Focus**: Include score and time analysis
- **People Insights**: Add supervisor and team charts
- **Specialized Needs**: Include advanced analytics as required
- **Regular Review**: Periodically assess tile usefulness

### **Layout Organization**
- **Logical Flow**: Arrange tiles in a logical reading order
- **Size Hierarchy**: Use larger tiles for primary metrics
- **Related Grouping**: Place related charts near each other
- **Visual Balance**: Distribute different sized tiles evenly

## Troubleshooting

### **Common Issues**

#### **"Tile not appearing after adding"**
- Check if the tile is already on the dashboard
- Verify the tile is supported in your data context
- Try refreshing the page if the issue persists

#### **"Cannot remove core tiles"**
- All tiles can be removed, including core tiles
- Core designation indicates importance, not restriction
- Use "Available Only" filter to see removable tiles

#### **"Search not finding tiles"**
- Try different keywords or partial matches
- Search includes names, descriptions, and tags
- Clear search to return to category view

### **Performance Tips**
- **Limit Active Tiles**: Too many tiles can slow dashboard loading
- **Use Appropriate Sizes**: Match tile size to data complexity
- **Regular Cleanup**: Remove unused tiles periodically

## Future Enhancements

### **Planned Features**
- **Custom Tile Sizes**: User-defined tile dimensions
- **Tile Templates**: Pre-configured tile arrangements
- **Tile Sharing**: Share custom tile configurations
- **Advanced Filtering**: More sophisticated tile discovery
- **Tile Analytics**: Usage tracking and recommendations

### **Integration Opportunities**
- **Mobile Optimization**: Responsive tile arrangements
- **Export Options**: Export tile configurations
- **API Access**: Programmatic tile management
- **Third-party Tiles**: Plugin system for custom charts

The Tile Library system provides the foundation for truly customizable dashboards, enabling users to create personalized analytics experiences tailored to their specific needs and workflows.
