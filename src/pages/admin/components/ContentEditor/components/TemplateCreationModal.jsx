import React, { useState } from 'react';
import { useTheme } from '../../../../../contexts/ThemeContext';
import { templatesService } from '../../../../../services/api/templates';

const TemplateCreationModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title,
  getCurrentContent,
  showToast 
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [templateData, setTemplateData] = useState({
    name: title || '',
    description: '',
    category: 'Basic',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !templateData.tags.includes(newTag.trim())) {
      setTemplateData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTemplateData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = async () => {
    if (!templateData.name.trim()) {
      showToast('Please enter a template name', 'warning');
      return;
    }

    setIsSaving(true);
    try {
      const currentContent = getCurrentContent();
      const template = {
        name: templateData.name,
        description: templateData.description,
        category: templateData.category,
        tags: templateData.tags,
        content: currentContent,
        thumbnail: null
      };

      await templatesService.create(template);
      showToast('Template saved successfully!', 'success');
      onClose();
      setTemplateData({ name: '', description: '', category: 'Basic', tags: [] });
      
      if (onSave) {
        onSave(template);
      }
    } catch (error) {
      console.error('Error saving template:', error);
      showToast('Failed to save template', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setTemplateData({ name: title || '', description: '', category: 'Basic', tags: [] });
    setNewTag('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black opacity-30" onClick={handleClose}></div>
        <div className={`relative rounded-lg max-w-md w-full mx-auto p-6 ${isDark ? 'bg-slate-800' : 'bg-white'}`}>
          <h3 className="text-lg font-medium mb-4">Save as Template</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Template Name *</label>
              <input
                type="text"
                value={templateData.name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-3 py-2 rounded-md border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={templateData.category}
                onChange={(e) => setTemplateData(prev => ({ ...prev, category: e.target.value }))}
                className={`w-full px-3 py-2 rounded-md border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
              >
                <option value="Basic">Basic</option>
                <option value="Advanced">Advanced</option>
                <option value="Interactive">Interactive</option>
                <option value="Layout">Layout</option>
                <option value="Educational">Educational</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className={`w-full px-3 py-2 rounded-md border ${
                  isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                }`}
                placeholder="Enter template description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {templateData.tags.map(tag => (
                  <span
                    key={tag}
                    className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                      isDark ? 'bg-slate-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add a tag"
                  className={`flex-1 px-3 py-2 rounded-md border ${
                    isDark ? 'bg-slate-700 border-slate-600 text-white' : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded-md ${
                isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
              }`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark ${
                isSaving ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreationModal;