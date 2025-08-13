import React, { useState, useEffect, useContext } from 'react';
import { Dialog } from '@headlessui/react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { CategoryContext } from '../../../../components/layout/AdminLayout';
import { FaFolder, FaFolderOpen } from 'react-icons/fa';

/**
 * Modal for selecting a category when moving or copying a study guide
 */
const CategorySelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select Category',
  actionButtonText = 'Select',
  currentCategoryId = null
}) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Get current theme colors
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];
  const { sectionsData } = useContext(CategoryContext);
  const [expandedSections, setExpandedSections] = useState({});
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Reset selected category when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedCategoryId(null);
    }
  }, [isOpen]);

  // Initialize expanded sections when sections data changes
  useEffect(() => {
    if (sectionsData && sectionsData.length > 0) {
      const initialExpandedState = {};
      sectionsData.forEach(section => {
        initialExpandedState[section.id] = false;
      });
      setExpandedSections(initialExpandedState);
    }
  }, [sectionsData]);

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategoryId(categoryId);
  };

  const handleConfirm = () => {
    if (selectedCategoryId) {
      onSelect(selectedCategoryId);
      onClose();
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* Full-screen container for centering */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className={`w-full max-w-md rounded-lg ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} p-6 shadow-xl`}>
          <Dialog.Title className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </Dialog.Title>

          <div className={`mb-6 max-h-80 overflow-y-auto ${isDark ? 'border border-slate-700' : 'border border-gray-200'} rounded-md p-2`}>
            {sectionsData && sectionsData.length > 0 ? (
              <ul className="space-y-2">
                {sectionsData.map(section => (
                  <li key={section.id} className="mb-2">
                    <div 
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
                      onClick={() => toggleSection(section.id)}
                    >
                      {expandedSections[section.id] ? (
                        <FaFolderOpen style={{ color: currentPrimaryColor }} />
                      ) : (
                        <FaFolder style={{ color: currentPrimaryColor }} />
                      )}
                      <span className="font-medium">{section.name}</span>
                    </div>
                    
                    {expandedSections[section.id] && section.categories && (
                      <ul className="pl-6 mt-1 space-y-1">
                        {section.categories.map(category => (
                          <li 
                            key={category.id}
                            className={`p-2 rounded cursor-pointer ${
                              selectedCategoryId === category.id
                                ? isDark ? 'bg-primary/30 border border-primary' : 'bg-primary/10 border border-primary'
                                : ''
                            } ${
                              currentCategoryId === category.id
                                ? isDark ? 'bg-slate-700/50' : 'bg-gray-100'
                                : isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => handleCategorySelect(category.id)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{category.name}</span>
                              {currentCategoryId === category.id && (
                                <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-slate-600">Current</span>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No categories available</p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              className={`px-4 py-2 rounded-md ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-md text-white ${
                selectedCategoryId
                  ? 'hover:opacity-90'
                  : isDark ? 'bg-slate-600 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={selectedCategoryId ? { backgroundColor: currentPrimaryColor } : {}}
              onClick={handleConfirm}
              disabled={!selectedCategoryId}
            >
              {actionButtonText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default CategorySelectionModal;
