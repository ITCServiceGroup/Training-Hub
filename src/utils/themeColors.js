// Utility for handling theme-aware colors

// Base colors defined for the application (light mode defaults)
const baseColorMap = [
  'BFEDD2', 'Light Green',
  'FBEEB8', 'Light Yellow',
  'F8CAC6', 'Light Red',
  'ECCAFA', 'Light Purple',
  'C2E0F4', 'Light Blue', // Swaps with Navy Blue

  '2DC26B', 'Green',
  'F1C40F', 'Yellow',
  'E03E2D', 'Red',
  'B96AD9', 'Purple',
  '3598DB', 'Blue',

  '169179', 'Dark Turquoise',
  'E67E23', 'Orange',
  'BA372A', 'Dark Red',
  '843FA1', 'Dark Purple',
  '236FA1', 'Dark Blue',

  'ECF0F1', 'Light Gray', // Swaps with Dark Gray
  'CED4D9', 'Medium Gray', // Swaps with Gray
  '95A5A6', 'Gray', // Swaps with Medium Gray
  '7E8C8D', 'Dark Gray', // Swaps with Light Gray
  '34495E', 'Navy Blue', // Swaps with Light Blue

  '000000', 'Black', // Swaps with White
  'FFFFFF', 'White'  // Swaps with Black
];

// Define the hex codes involved in swapping based on the provided table
// Maps the BASE (Light Mode) Hex to its corresponding DARK Mode Hex
const swaps = {
  // Light Mode Hex: Dark Mode Hex
  '34495E': 'C2E0F4', // Navy Blue -> Light Blue
  '000000': 'FFFFFF', // Black -> White
  'FFFFFF': '000000', // White -> Black
  '7E8C8D': 'ECF0F1', // Dark Gray / Light Gray (Light) -> Light Gray (Dark)
  '95A5A6': 'CED4D9', // Gray / Medium Gray (Light) -> Medium Gray (Dark)
  // Colors that don't swap are implicitly handled by getThemeAppliedHex
};

/**
 * Gets the theme-appropriate hex code for a given base hex code.
 * If the color doesn't swap, returns the original hex.
 * @param {string} baseHex - The hex code (without #) from the baseColorMap.
 * Gets the theme-appropriate hex code to *apply* to content based on the selected base hex.
 * If the color doesn't swap, returns the original hex.
 * @param {string} baseHex - The hex code (without #) selected from the picker (always the light mode default).
 * @param {boolean} isDarkMode - True if dark mode is active during application.
 * @returns {string} The theme-appropriate hex code to apply as an inline style.
 */
export const getThemeAppliedHex = (baseHex, isDarkMode) => {
  const upperBaseHex = baseHex.toUpperCase();
  // If dark mode is active AND the selected baseHex is one that swaps, return the dark mode hex.
  if (isDarkMode && swaps[upperBaseHex]) {
    return swaps[upperBaseHex];
  }
  // Otherwise (light mode, or dark mode but the color doesn't swap), return the original base hex.
  return upperBaseHex;
};

// Create a reverse map for finding the base (light) hex from a DARK mode hex
// Maps the DARK Mode Hex back to its corresponding BASE (Light Mode) Hex
const reverseSwaps = {
  // Dark Mode Hex: Light Mode Hex
  'C2E0F4': '34495E', // Light Blue -> Navy Blue
  'FFFFFF': '000000', // White -> Black
  '000000': 'FFFFFF', // Black -> White (Note: Black is dark mode for White)
  'ECF0F1': '7E8C8D', // Light Gray (Dark Mode) -> Dark Gray/Light Gray (Light Mode Base)
  'CED4D9': '95A5A6', // Medium Gray (Dark Mode) -> Gray/Medium Gray (Light Mode Base)
};

/**
 * Gets the base (light mode default) hex code for a given hex code,
 * which might be the light or dark version.
 * @param {string} currentHex - The hex code (with or without #) found in the content.
 * @returns {string} The base (light mode default) hex code (without #).
 */
export const getBaseHex = (currentHex) => {
  const upperCurrentHex = currentHex.toUpperCase().replace('#', '');
  // If the current hex is a known 'dark' value from the reverse map, return its 'light' base.
  // Otherwise, assume the current hex is already the base/light hex (or doesn't swap).
  return reverseSwaps[upperCurrentHex] || upperCurrentHex;
};

// Helper function to get CSS variables for overrides (remains the same)
export const getThemeColorCssVariables = () => {
  const variables = {};
  const added = new Set(); // Prevent duplicate variable definitions

  for (const lightHex in swaps) {
      const darkHex = swaps[lightHex];
      if (!added.has(lightHex)) {
          variables[`--color-light-${lightHex}`] = `#${lightHex}`;
          added.add(lightHex);
      }
      if (!added.has(darkHex)) {
          variables[`--color-dark-${darkHex}`] = `#${darkHex}`;
          added.add(darkHex);
      }
      // Add reverse mapping for clarity if needed, ensure uniqueness
      if (!added.has(darkHex)) {
          variables[`--color-light-${darkHex}`] = `#${darkHex}`; // Base case for dark hex in light mode
          added.add(darkHex);
      }
       if (!added.has(lightHex)) {
          variables[`--color-dark-${lightHex}`] = `#${lightHex}`; // Base case for light hex in dark mode
          added.add(lightHex);
      }
  }

  // Define the specific swap pairs for CSS overrides
  variables['--swap-navy-blue-light'] = '#34495E';
  variables['--swap-navy-blue-dark'] = '#C2E0F4';
  variables['--swap-black-light'] = '#000000';
  variables['--swap-black-dark'] = '#FFFFFF';
  variables['--swap-white-light'] = '#FFFFFF';
  variables['--swap-white-dark'] = '#000000';
  variables['--swap-light-gray-light'] = '#ECF0F1'; // Original Light Gray
  variables['--swap-light-gray-dark'] = '#7E8C8D'; // Becomes Dark Gray
  variables['--swap-dark-gray-light'] = '#7E8C8D'; // Original Dark Gray
  variables['--swap-dark-gray-dark'] = '#ECF0F1'; // Becomes Light Gray
  variables['--swap-medium-gray-light'] = '#CED4D9'; // Original Medium Gray
  variables['--swap-medium-gray-dark'] = '#95A5A6'; // Becomes Gray
  variables['--swap-gray-light'] = '#95A5A6'; // Original Gray
  variables['--swap-gray-dark'] = '#CED4D9'; // Becomes Medium Gray

  return variables;
};
