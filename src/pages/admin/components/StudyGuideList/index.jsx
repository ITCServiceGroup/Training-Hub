import React, { useState, useContext, useEffect } from 'react';
import { useTheme } from '../../../../contexts/ThemeContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CategoryContext } from '../../../../components/layout/AdminLayout';

// Helper function to extract a preview from HTML content
const extractPreview = (htmlContent, maxLength = 150) => {
  if (!htmlContent) return '';
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    const styleTags = tempDiv.querySelectorAll('style, script, meta, link, head');
    styleTags.forEach(tag => tag.remove());
    const contentElements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    let preview = '';
    for (let i = 0; i < Math.min(contentElements.length, 3); i++) {
      const text = contentElements[i].textContent.trim();
      if (text && text.length > 20) {
        preview = text;
        break;
      }
    }
    if (!preview) {
      preview = tempDiv.textContent.replace(/\s+/g, ' ').trim();
    }
    return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
  } catch (error) {
    const textContent = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  }
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

const SortableStudyGuideItem = ({ guide, onSelect, selectedId, hoveredId, setHoveredId }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: guide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  // Using Tailwind classes instead of inline styles

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg ${selectedId === guide.id ? 'border-2 border-teal-600' : 'border border-gray-200 dark:border-slate-600'} overflow-hidden transition-all duration-200 ${isDragging ? 'shadow-lg opacity-80' : selectedId === guide.id ? 'shadow-md' : 'shadow'}`}
      onMouseEnter={() => !isDragging && setHoveredId(guide.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => onSelect(guide)}
      {...attributes}
    >
      <div className="bg-white dark:bg-slate-700 cursor-pointer">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
              {guide.title}
            </h3>
            <div
              {...listeners}
              className={`text-gray-400 cursor-grab p-1 rounded ${hoveredId === guide.id ? 'bg-gray-100' : 'bg-transparent'}`}
              onClick={(e) => e.stopPropagation()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
            {extractPreview(guide.content)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 border-t border-gray-100 dark:border-slate-600 flex justify-between items-center">
          <div className="text-xs text-gray-500 dark:text-gray-300 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated {formatDate(guide.updated_at)}
          </div>
          <div className={`text-xs font-medium text-teal-600 dark:text-teal-400 transition-opacity duration-200 ${hoveredId === guide.id || selectedId === guide.id ? 'opacity-100' : 'opacity-0'}`}>
            Click to edit
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyGuideList = ({
  studyGuides: propStudyGuides = [], // Allow direct prop injection
  onSelect,
  selectedId,
  onReorder
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  const { theme } = useTheme();
  const { sectionsData, selectedCategory } = useContext(CategoryContext);

  // Combine prop data with context data
  const studyGuidesToDisplay = React.useMemo(() => {
    // If we have prop data, prioritize it for immediate updates
    if (propStudyGuides.length > 0) {
      return propStudyGuides;
    }

    // Fall back to context data
    if (!selectedCategory || !sectionsData) return [];
    const currentSection = sectionsData.find(s => s.v2_categories?.some(c => c.id === selectedCategory.id));
    if (!currentSection) return [];
    const currentCategory = currentSection.v2_categories.find(c => c.id === selectedCategory.id);
    return currentCategory?.study_guides || [];
  }, [sectionsData, selectedCategory, propStudyGuides]); // Include propStudyGuides in dependencies

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id && selectedCategory) {
      const oldIndex = studyGuidesToDisplay.findIndex((g) => g.id === active.id);
      const newIndex = studyGuidesToDisplay.findIndex((g) => g.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reorderedGuides = arrayMove(studyGuidesToDisplay, oldIndex, newIndex);

      // Prepare data for the backend API call
      const reorderedDataForApi = reorderedGuides.map((guide, index) => ({
        id: guide.id,
        display_order: index
      }));

      try {
        await onReorder(reorderedDataForApi);
      } catch (error) {
        console.error("Error updating study guide order on backend:", error);
      }
    }
  };

  // Using Tailwind classes instead of inline styles

  if (!studyGuidesToDisplay.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-500 dark:text-gray-300 mb-2">No study guides found in this category.</p>
        <p className="text-gray-400 dark:text-gray-300 text-sm">Click the "Create New Study Guide" button to add content.</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={studyGuidesToDisplay.map(g => g.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-4">
          {studyGuidesToDisplay.map((guide) => (
            <SortableStudyGuideItem
              key={guide.id}
              guide={guide}
              onSelect={onSelect}
              selectedId={selectedId}
              hoveredId={hoveredId}
              setHoveredId={setHoveredId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default StudyGuideList;
