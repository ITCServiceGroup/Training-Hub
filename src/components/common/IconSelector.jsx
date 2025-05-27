import React, { useState, useRef, useEffect } from 'react';
import { availableIcons } from '../../utils/iconMappings';
import { useTheme } from '../../contexts/ThemeContext';

const IconSelector = ({ selectedIcon, onSelectIcon, isDark }) => {
  const { theme, themeColors } = useTheme();
  const themeIsDark = theme === 'dark';

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[themeIsDark ? 'dark' : 'light'];

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });

  const triggerRef = useRef(null);

  // Find the selected icon object
  const selectedIconObj = availableIcons.find(icon => icon.name === selectedIcon) || availableIcons[0];

  // Filter icons based on search term
  const filteredIcons = searchTerm
    ? availableIcons.filter(icon =>
        icon.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : availableIcons;

  // Update dropdown position when it opens
  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      // Use the exact width of the trigger element to match it perfectly
      const dropdownWidth = rect.width;
      const dropdownHeight = 400; // Increased height to show 3 rows of icons

      // Calculate left position, ensuring it doesn't go off-screen
      let left = rect.left + window.scrollX;
      if (left + dropdownWidth > window.innerWidth) {
        left = window.innerWidth - dropdownWidth - 10; // 10px padding from edge
      }

      // Calculate top position, ensuring it doesn't go off-screen
      let top = rect.bottom + window.scrollY;
      if (rect.bottom + dropdownHeight > window.innerHeight) {
        // Position above the trigger if there's not enough space below
        top = rect.top + window.scrollY - dropdownHeight;
        // If there's not enough space above either, just position at the top of the viewport
        if (top < window.scrollY) {
          top = window.scrollY + 10; // 10px padding from top
        }
      }

      setDropdownPosition({
        top: top,
        left: left,
        width: dropdownWidth
      });

      // Add click outside handler
      const handleClickOutside = (e) => {
        if (triggerRef.current && !triggerRef.current.contains(e.target)) {
          // Check if the click is on the dropdown itself
          const dropdownElements = document.querySelectorAll('.icon-dropdown');
          let clickedOnDropdown = false;

          dropdownElements.forEach(element => {
            if (element.contains(e.target)) {
              clickedOnDropdown = true;
            }
          });

          if (!clickedOnDropdown) {
            setIsOpen(false);
          }
        }
      };

      document.addEventListener('mousedown', handleClickOutside);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  return (
    <div className="relative">
      <label className={`block text-sm font-medium ${isDark ? 'text-white' : 'text-gray-700'} mb-2`}>
        Icon
      </label>

      {/* Selected icon display */}
      <div
        ref={triggerRef}
        className={`flex items-center gap-2 p-2 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: currentSecondaryColor }}
        >
          {React.createElement(selectedIconObj.component, { size: 16, color: "white" })}
        </div>
        <span className="flex-1">{selectedIconObj.name}</span>
        <span className="text-xs">{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Icon selector dropdown - positioned in the document body to avoid container clipping */}
      {isOpen && (
        <div
          className={`fixed z-[9999] border ${isDark ? 'border-slate-500 bg-slate-700 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md shadow-lg max-h-96 overflow-auto icon-dropdown`}
          style={{
            width: `${dropdownPosition.width}px`,
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`
          }}>
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 sticky top-0 bg-inherit">
            <input
              type="text"
              className={`w-full p-2 border ${isDark ? 'border-slate-500 bg-slate-600 text-white' : 'border-gray-300 bg-white text-gray-700'} rounded-md text-sm`}
              placeholder="Search icons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Icons grid - showing more icons with compact layout */}
          <div className="grid grid-cols-4 gap-2 p-2">
            {filteredIcons.map((icon) => (
              <div
                key={icon.name}
                className={`p-1 flex flex-col items-center justify-center rounded-md cursor-pointer hover:bg-gray-100 hover:dark:bg-slate-600 ${selectedIcon === icon.name ? (isDark ? 'bg-slate-600' : 'bg-gray-100') : ''}`}
                onClick={() => {
                  onSelectIcon(icon.name);
                  setIsOpen(false);
                }}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                  style={{ backgroundColor: currentSecondaryColor }}
                >
                  {React.createElement(icon.component, { size: 24, color: "white" })}
                </div>
                <span className="text-xs text-center truncate w-full">{icon.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default IconSelector;
