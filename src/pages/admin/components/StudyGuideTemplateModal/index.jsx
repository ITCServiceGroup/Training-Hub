import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { templatesService } from '../../../../services/api/templates';
import { FaFileAlt, FaPlus, FaSearch, FaTags, FaCog, FaStar, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import LazyTemplatePreview from '../../../../components/LazyTemplatePreview';
import { performanceLogger } from '../../../../utils/performanceLogger';
import './StudyGuideTemplateModal.css';

const StudyGuideTemplateModal = ({ isOpen, onClose, onStartFromScratch, onSelectTemplate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Edit template state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    category: 'Basic',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Delete confirmation state
  const [deleteConfirmTemplate, setDeleteConfirmTemplate] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      performanceLogger.startTimer('template-modal-load');
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
      
      // Log performance after templates are loaded and modal is ready
      setTimeout(() => {
        const duration = performanceLogger.endTimer('template-modal-load');
        performanceLogger.logModalOpen(data.length, duration);
      }, 100);
    } catch (error) {
      console.error('Failed to fetch templates:', error);
      performanceLogger.endTimer('template-modal-load');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique categories for filter
  const categories = ['All', ...new Set(templates.map(t => t.category))];

  // Edit template handlers
  const handleEditTemplate = (template, e) => {
    e.stopPropagation(); // Prevent template selection
    setEditingTemplate(template);
    setEditFormData({
      name: template.name,
      description: template.description || '',
      category: template.category || 'Basic',
      tags: template.tags || []
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editFormData.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      await templatesService.update(editingTemplate.id, {
        name: editFormData.name,
        description: editFormData.description,
        category: editFormData.category,
        tags: editFormData.tags
      });

      // Refresh templates list
      const updatedTemplates = await templatesService.getAll();
      setTemplates(updatedTemplates);

      setIsEditModalOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error updating template:', error);
      alert('Failed to update template');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editFormData.tags.includes(newTag.trim())) {
      setEditFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setEditFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Delete template handlers
  const handleDeleteTemplate = (template, e) => {
    e.stopPropagation(); // Prevent template selection
    setDeleteConfirmTemplate(template);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmTemplate) return;

    setIsDeleting(true);
    try {
      await templatesService.delete(deleteConfirmTemplate.id);

      // Refresh templates list
      const updatedTemplates = await templatesService.getAll();
      setTemplates(updatedTemplates);

      setDeleteConfirmTemplate(null);
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 py-8 pt-20">
        <div className="fixed inset-0 bg-black opacity-30" onClick={onClose}></div>
        <div className={`relative rounded-lg max-w-7xl w-full mx-auto p-4 md:p-6 max-h-[90vh] overflow-y-auto study-guide-template-modal ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Content</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-700' : 'hover:bg-gray-100'}`}
            >
              ×
            </button>
          </div>

          <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            Choose how you'd like to start creating your content:
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
                  Begin with a blank canvas and build your content from the ground up
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-h-[600px] overflow-y-auto p-4 template-grid-scroll">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-transform hover:scale-105 relative m-2 ${
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
                    <LazyTemplatePreview
                      content={template.content}
                      className="w-full h-full"
                      rootMargin="50px"
                      threshold={0.25}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-sm flex-1">{template.name}</h4>

                      {/* User Template Actions - Same line as title */}
                      {!template.isSystemTemplate && (
                        <div className="flex gap-1 ml-2 flex-shrink-0">
                          <button
                            onClick={(e) => handleEditTemplate(template, e)}
                            className={`p-1.5 rounded-full transition-colors ${
                              isDark
                                ? 'bg-slate-600 hover:bg-slate-500 text-slate-200'
                                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
                            } shadow-sm`}
                            title="Edit template"
                          >
                            <FaEdit size={10} />
                          </button>
                          <button
                            onClick={(e) => handleDeleteTemplate(template, e)}
                            className={`p-1.5 rounded-full transition-colors ${
                              isDark
                                ? 'bg-red-600 hover:bg-red-500 text-red-200'
                                : 'bg-red-500 hover:bg-red-600 text-white'
                            } shadow-sm`}
                            title="Delete template"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
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

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-lg shadow-xl ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Edit Template
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={`p-1 rounded-full hover:bg-gray-100 ${isDark ? 'hover:bg-slate-700 text-gray-400' : 'text-gray-500'}`}
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Template Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    placeholder="Enter template name"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <textarea
                    value={editFormData.description}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                    rows="3"
                    placeholder="Enter template description"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={editFormData.category}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-md ${
                      isDark
                        ? 'bg-slate-700 border-slate-600 text-white'
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  >
                    <option value="Basic">Basic</option>
                    <option value="Interactive">Interactive</option>
                    <option value="Educational">Educational</option>
                    <option value="Layout">Layout</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Business">Business</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Tags
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className={`flex-1 px-3 py-2 border rounded-md ${
                        isDark
                          ? 'bg-slate-700 border-slate-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Add a tag"
                    />
                    <button
                      onClick={handleAddTag}
                      className={`px-3 py-2 rounded-md h-[42px] flex items-center justify-center ${
                        isDark
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {editFormData.tags.map(tag => (
                      <span
                        key={tag}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                          isDark ? 'bg-slate-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        <FaTags size={8} />
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <FaTimes size={8} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isSaving}
                  className={`px-4 py-2 rounded-md ${
                    isDark
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-blue-500 hover:bg-blue-600 text-white'
                  } disabled:opacity-50`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`max-w-md w-full mx-4 rounded-lg shadow-xl ${
            isDark ? 'bg-slate-800' : 'bg-white'
          }`}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Delete Template
                </h3>
                <button
                  onClick={() => setDeleteConfirmTemplate(null)}
                  className={`p-1 rounded-full hover:bg-gray-100 ${isDark ? 'hover:bg-slate-700 text-gray-400' : 'text-gray-500'}`}
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Are you sure you want to delete the template "{deleteConfirmTemplate.name}"? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirmTemplate(null)}
                  className={`px-4 py-2 rounded-md ${
                    isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white disabled:opacity-50"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyGuideTemplateModal;
