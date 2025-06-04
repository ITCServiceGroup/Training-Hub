import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { templatesService } from '../../../../services/api/templates';
import { FaFileAlt, FaPlus, FaSearch, FaTags, FaCog, FaStar } from 'react-icons/fa';
import TemplatePreview from '../../../../components/TemplatePreview';

const StudyGuideTemplateModal = ({ isOpen, onClose, onStartFromScratch, onSelectTemplate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (isOpen) {
      fetchTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter templates based on search and category
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedCategory, templates]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const data = await templatesService.getAll();
      setTemplates(data);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...new Set(templates.map(t => t.category))];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className={`relative rounded-lg max-w-7xl w-full mx-auto p-4 md:p-6 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Study Guide</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              ×
            </button>
          </div>

          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose how you'd like to start creating your study guide:
          </p>

          {/* Start from Scratch Option */}
          <div
            className={`mb-6 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
              isDark
                ? 'border-slate-600 hover:border-primary hover:bg-slate-700/50'
                : 'border-gray-300 hover:border-primary hover:bg-gray-50'
            }`}
            onClick={onStartFromScratch}
          >
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${isDark ? 'bg-slate-700' : 'bg-gray-100'}`}>
                <FaPlus className="text-xl text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Start from Scratch</h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Begin with a blank canvas and build your study guide from the ground up
                </p>
              </div>
            </div>
          </div>

          {/* Templates Section */}
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-4">Or choose from a template:</h3>

            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="relative flex-grow">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search templates..."
                  className={`pl-10 pr-4 py-2 w-full rounded-md border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100 border-gray-300 text-slate-800'
                  }`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`px-4 py-2 rounded-md border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-gray-100 border-gray-300 text-slate-800'
                }`}
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Templates grid */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredTemplates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[600px] overflow-y-auto">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-transform hover:scale-105 relative ${
                    template.isSystemTemplate
                      ? isDark ? 'bg-blue-900/50 hover:bg-blue-800/60 border border-blue-500/30' : 'bg-blue-50 hover:bg-blue-100 border border-blue-200'
                      : isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onClick={() => onSelectTemplate(template)}
                >
                  {/* System Template Badge */}
                  {template.isSystemTemplate && (
                    <div className="absolute top-2 right-2 z-10">
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        isDark ? 'bg-blue-600 text-blue-100' : 'bg-blue-500 text-white'
                      }`}>
                        <FaStar size={10} />
                        System
                      </div>
                    </div>
                  )}

                  <div className="h-80 overflow-hidden">
                    <TemplatePreview
                      content={template.content}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm flex-1">{template.name}</h4>
                      {template.isSystemTemplate && (
                        <FaCog className={`ml-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={12} />
                      )}
                    </div>
                    <p className={`text-xs mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {template.tags.slice(0, 2).map(tag => (
                        <span
                          key={tag}
                          className={`text-xs px-2 py-1 rounded-full flex items-center ${
                            template.isSystemTemplate
                              ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                              : isDark ? 'bg-slate-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          <FaTags className="mr-1" size={8} />
                          {tag}
                        </span>
                      ))}
                      {template.tags.length > 2 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          template.isSystemTemplate
                            ? isDark ? 'bg-blue-800 text-blue-200' : 'bg-blue-100 text-blue-800'
                            : isDark ? 'bg-slate-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}>
                          +{template.tags.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaFileAlt className={`mx-auto text-4xl mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {templates.length === 0 ? 'No templates available yet.' : 'No templates match your search.'}
              </p>
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-md ${
                isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGuideTemplateModal;
