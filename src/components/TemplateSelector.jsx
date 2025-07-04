import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { templatesService } from '../services/api/templates';
import { FaSearch, FaTags } from 'react-icons/fa';

const TemplateSelector = ({ onSelect, onCancel }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await templatesService.getAll();
        setTemplates(data);
        setFilteredTemplates(data);
      } catch (error) {
        console.error('Failed to fetch templates:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  // Filter templates based on search and category
  useEffect(() => {
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
  
  // Get unique categories for filter
  const categories = ['All', ...new Set(templates.map(t => t.category))];
  
  return (
    <div className={`p-6 ${isDark ? 'bg-slate-800 text-white' : 'bg-white text-slate-800'}`}>
      <h2 className="text-2xl font-bold mb-6">Select a Template</h2>
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            className={`pl-10 pr-4 py-2 w-full rounded-md ${
              isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-slate-800'
            }`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={`px-4 py-2 rounded-md ${
            isDark ? 'bg-slate-700 text-white' : 'bg-gray-100 text-slate-800'
          }`}
        >
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>
      
      {/* Templates grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className={`rounded-lg overflow-hidden shadow-md cursor-pointer transform transition-transform hover:scale-105 m-2 ${
                isDark ? 'bg-slate-700' : 'bg-gray-50'
              }`}
              onClick={() => onSelect(template)}
            >
              <div className="h-40 overflow-hidden">
                <img 
                  src={template.thumbnail || '/images/default-template.jpg'} 
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg mb-1">{template.name}</h3>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {template.description}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.map(tag => (
                    <span 
                      key={tag} 
                      className={`text-xs px-2 py-1 rounded-full flex items-center ${
                        isDark ? 'bg-slate-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      <FaTags className="mr-1" size={10} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end mt-6 gap-4">
        <button
          onClick={onCancel}
          className={`px-4 py-2 rounded-md ${
            isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default TemplateSelector;