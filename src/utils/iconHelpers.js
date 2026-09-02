import DynamicIcon from '../components/common/DynamicIcon';

/**
 * Get icon component and props for a section based on its custom icon or name-based detection
 * @param {Object} section - Section object with name, description, and optional icon
 * @param {string} currentSecondaryColor - Theme secondary color to use
 * @param {number} size - Icon size (default: 24)
 * @returns {Object} - { IconComponent: React component, iconProps: props object, color: string }
 */
export const getSectionIcon = (section, currentSecondaryColor, size = 24) => {
  // If the section has a custom icon set, use it
  if (section.icon) {
    return {
      IconComponent: DynamicIcon,
      iconProps: { iconName: section.icon, size, color: 'white' },
      color: currentSecondaryColor // Always use secondary color
    };
  }

  // Fallback to name-based detection for backward compatibility
  const name = section.name.toLowerCase();
  let iconName = 'Book';

  if (name.includes('network')) iconName = 'Network';
  else if (name.includes('install')) iconName = 'Download';
  else if (name.includes('service')) iconName = 'Wrench';
  else if (name.includes('troubleshoot')) iconName = 'Search';
  else if (name.includes('security')) iconName = 'Lock';
  else if (name.includes('hardware')) iconName = 'Laptop';
  else if (name.includes('software')) iconName = 'Chart';
  else if (name.includes('advanced')) iconName = 'Rocket';

  return {
    IconComponent: DynamicIcon,
    iconProps: { iconName, size, color: 'white' },
    color: currentSecondaryColor // Always use secondary color
  };
};

/**
 * Get icon component and props for a category based on its custom icon or name-based detection
 * @param {Object} category - Category object with name, description, and optional icon
 * @param {string} currentSecondaryColor - Theme secondary color to use
 * @param {number} size - Icon size (default: 24)
 * @returns {Object} - { IconComponent: React component, iconProps: props object, color: string }
 */
export const getCategoryIcon = (category, currentSecondaryColor, size = 24) => {
  // If the category has a custom icon set, use it
  if (category.icon) {
    return {
      IconComponent: DynamicIcon,
      iconProps: { iconName: category.icon, size, color: 'white' },
      color: currentSecondaryColor // Always use secondary color
    };
  }

  // Fallback to name-based detection for backward compatibility
  const name = category.name.toLowerCase();
  let iconName = 'Book';

  if (name.includes('network')) iconName = 'Network';
  else if (name.includes('install')) iconName = 'Download';
  else if (name.includes('service')) iconName = 'Wrench';
  else if (name.includes('troubleshoot')) iconName = 'Search';
  else if (name.includes('security')) iconName = 'Lock';
  else if (name.includes('hardware')) iconName = 'Laptop';
  else if (name.includes('software')) iconName = 'Chart';

  return {
    IconComponent: DynamicIcon,
    iconProps: { iconName, size, color: 'white' },
    color: currentSecondaryColor // Always use secondary color
  };
};

/**
 * Get icon component and props for search results (20px size variant)
 * @param {Object} item - Section or category object 
 * @param {string} currentSecondaryColor - Theme secondary color to use
 * @param {string} type - 'section' or 'category'
 * @returns {Object} - { IconComponent: React component, iconProps: props object, color: string }
 */
export const getSearchResultIcon = (item, currentSecondaryColor, type = 'section') => {
  // If the item has a custom icon set, use it
  if (item.icon) {
    return {
      IconComponent: DynamicIcon,
      iconProps: { iconName: item.icon, size: 20, color: 'white' },
      color: currentSecondaryColor // Always use secondary color
    };
  }

  // Fallback to name-based detection for backward compatibility
  const name = item.name.toLowerCase();
  let iconName = 'Book';

  if (name.includes('network')) iconName = 'Network';
  else if (name.includes('install')) iconName = 'Download';
  else if (name.includes('service')) iconName = 'Wrench';
  else if (name.includes('troubleshoot')) iconName = 'Search';
  else if (name.includes('security')) iconName = 'Lock';
  else if (name.includes('hardware')) iconName = 'Laptop';
  else if (name.includes('software')) iconName = 'Chart';
  else if (type === 'section' && name.includes('advanced')) iconName = 'Rocket';

  return {
    IconComponent: DynamicIcon,
    iconProps: { iconName, size: 20, color: 'white' },
    color: currentSecondaryColor // Always use secondary color
  };
};
