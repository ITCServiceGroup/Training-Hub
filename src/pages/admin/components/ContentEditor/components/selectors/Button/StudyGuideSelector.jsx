import { useState, useEffect } from 'react';
import { FaTimes, FaSearch, FaChevronDown, FaBook } from 'react-icons/fa';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { sectionsService } from '../../../../../../../services/api/sections';
import { categoriesService } from '../../../../../../../services/api/categories';
import { studyGuidesService } from '../../../../../../../services/api/studyGuides';

const StudyGuideSelector = ({ isOpen, onClose, onSelect, currentSelection }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [studyGuides, setStudyGuides] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch sections on mount and initialize with current selection
  useEffect(() => {
    if (isOpen) {
      fetchSections();

      // Initialize with current selection if available
      if (currentSelection) {
        setSelectedSectionId(currentSelection.sectionId || '');
        setSelectedCategoryId(currentSelection.categoryId || '');
      } else {
        // Reset to empty state if no current selection
        setSelectedSectionId('');
        setSelectedCategoryId('');
        setCategories([]);
        setStudyGuides([]);
      }
    }
  }, [isOpen, currentSelection]);

  // Fetch categories when section changes
  useEffect(() => {
    if (selectedSectionId) {
      fetchCategories(selectedSectionId);
    } else {
      setCategories([]);
      setSelectedCategoryId('');
    }
  }, [selectedSectionId]);

  // Fetch study guides when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      fetchStudyGuides(selectedCategoryId);
    } else {
      setStudyGuides([]);
    }
  }, [selectedCategoryId]);

  const fetchSections = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await sectionsService.getAllSections();
      setSections(data || []);
    } catch (err) {
      setError('Failed to load sections');
      console.error('Error fetching sections:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async (sectionId) => {
    setIsLoading(true);
    setError('');
    try {
      const data = await categoriesService.getBySectionId(sectionId);
      setCategories(data || []);
    } catch (err) {
      setError('Failed to load categories');
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudyGuides = async (categoryId) => {
    setIsLoading(true);
    setError('');
    try {
      // Only fetch published study guides since those are the only ones viewable on the public page
      const data = await studyGuidesService.getByCategoryId(categoryId, true);
      setStudyGuides(data || []);
    } catch (err) {
      setError('Failed to load study guides');
      console.error('Error fetching study guides:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectGuide = (guide) => {
    // Find the section and category for this guide
    const section = sections.find(s => s.id === selectedSectionId);
    const category = categories.find(c => c.id === selectedCategoryId);
    
    onSelect({
      id: guide.id,
      title: guide.title,
      sectionId: selectedSectionId,
      categoryId: selectedCategoryId,
      sectionName: section?.name || '',
      categoryName: category?.name || ''
    });
    onClose();
  };

  const filteredStudyGuides = studyGuides.filter(guide =>
    guide.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col`}>
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Select Study Guide
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col p-6">
          {/* Section Selection */}
          <div className="mb-4">
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Section
            </label>
            <select
              value={selectedSectionId}
              onChange={(e) => {
                setSelectedSectionId(e.target.value);
                setSelectedCategoryId('');
              }}
              className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
            >
              <option value="">Select a section...</option>
              {sections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          {selectedSectionId && (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className={`w-full px-3 py-2 border rounded-md ${isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              >
                <option value="">Select a category...</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search */}
          {selectedCategoryId && (
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Search Study Guides
              </label>
              <div className="relative">
                <FaSearch className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={14} />
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md ${isDark ? 'bg-slate-700 border-slate-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>
            </div>
          )}

          {/* Study Guides List */}
          {selectedCategoryId && (
            <div className="flex-1 overflow-auto">
              {isLoading ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Loading...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  {error}
                </div>
              ) : filteredStudyGuides.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {searchTerm ? (
                    'No published study guides match your search.'
                  ) : (
                    <div>
                      <p className="mb-2">No published study guides found in this category.</p>
                      <p className="text-xs">
                        Only published study guides can be linked. Please publish study guides in the admin panel first.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredStudyGuides.map(guide => {
                    const isSelected = currentSelection && guide.id === currentSelection.studyGuideId;
                    return (
                      <button
                        key={guide.id}
                        onClick={() => handleSelectGuide(guide)}
                        className={`w-full text-left p-3 rounded-md border transition-colors ${
                          isSelected
                            ? (isDark
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-primary bg-primary/5 text-primary')
                            : (isDark
                                ? 'border-slate-600 hover:bg-slate-700 hover:border-slate-500'
                                : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300')
                        }`}
                      >

                      <div className="flex items-center">
                        <FaBook className={`mr-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} size={16} />
                        <div>
                          <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            {guide.title}
                          </div>
                          {guide.description && (
                            <div className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {guide.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end p-6 border-t ${isDark ? 'border-slate-600' : 'border-gray-200'}`}>
          <button
            onClick={onClose}
            className={`px-4 py-2 text-sm font-medium rounded-md ${isDark ? 'bg-slate-700 text-gray-300 hover:bg-slate-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudyGuideSelector;
