import React, { useState, useContext, useEffect, useRef } from 'react';
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
import { FaCopy, FaArrowRight, FaEllipsisV } from 'react-icons/fa';
import LoadingSpinner from '../../../../components/common/LoadingSpinner';

// Helper function to extract a preview from HTML or JSON content
const extractPreview = (content, maxLength = 150) => {
  if (!content) return '';

  // Check if content is JSON (Craft.js format)
  const isJsonContent = (() => {
    try {
      // Check if it's a string that looks like JSON
      if (typeof content === 'string') {
        const trimmed = content.trim();

        // Check for JSON object format
        if ((trimmed.startsWith('{') && trimmed.endsWith('}')) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))) {

          // Look for Craft.js indicators
          if (trimmed.includes('resolvedName') ||
              trimmed.includes('"ROOT"') ||
              trimmed.includes('"root"') ||
              trimmed.includes('\\"ROOT\\"') ||
              trimmed.includes('\\"root\\"') ||
              trimmed.includes('\\"resolvedName\\"')) {
            return true;
          }

          // Look for text properties which indicate content
          if (trimmed.includes('"text"') || trimmed.includes('\\"text\\"')) {
            return true;
          }

          // Try parsing it
          try {
            let parsed = JSON.parse(trimmed);

            // Handle double-stringified JSON
            if (typeof parsed === 'string') {
              try {
                parsed = JSON.parse(parsed);
              } catch (innerError) {
                // If we can't parse it as JSON, but it has text indicators, still treat as JSON
                if (parsed.includes('"text"') || parsed.includes('\\"text\\"')) {
                  return true;
                }
              }
            }

            // Check for Craft.js structure
            if (parsed.ROOT || parsed.root ||
                (typeof parsed === 'object' &&
                 Object.values(parsed).some(v => v && v.props && v.props.text))) {
              return true;
            }
          } catch (e) {
            // Not valid JSON or not Craft.js format
            // But if it has text indicators, still treat as JSON for extraction
            if (trimmed.includes('"text"') || trimmed.includes('\\"text\\"')) {
              return true;
            }
          }
        }
      }
      return false;
    } catch (e) {
      return false;
    }
  })();

  // If it's JSON content, extract text from it
  if (isJsonContent) {
    try {
      // Try to parse the JSON content
      let parsed;
      if (typeof content === 'string') {
        try {
          parsed = JSON.parse(content);
          // Handle double-stringified JSON
          if (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
          }
        } catch (e) {
          // If parsing fails, try to extract text directly
          return "Interactive content created with Content Editor";
        }
      } else {
        parsed = content;
      }

      // Extract text from Text components in the correct visual order
      let textContent = [];

      // Helper function to check if text is a default placeholder
      const isDefaultText = (text) => {
        const defaultTexts = [
          "Click to edit this text",
          "Double-click to edit",
          "Edit this text",
          "Enter text here"
        ];
        return defaultTexts.includes(text);
      };

      // Function to extract text following the visual hierarchy
      const extractTextInVisualOrder = (rootNode, allNodes) => {
        if (!rootNode || !allNodes) return;

        // Skip processing if this is a hidden node
        if (rootNode.hidden === true) return;

        // If this is a Text component, add its text to our collection
        if (rootNode.type && rootNode.type.resolvedName === 'Text' &&
            rootNode.props && rootNode.props.text &&
            typeof rootNode.props.text === 'string') {

          // Skip default placeholder text
          if (!isDefaultText(rootNode.props.text)) {
            textContent.push(rootNode.props.text);
          }
        }

        // Process child nodes in the order they appear in the nodes array
        if (rootNode.nodes && Array.isArray(rootNode.nodes)) {
          rootNode.nodes.forEach(nodeId => {
            if (allNodes[nodeId]) {
              extractTextInVisualOrder(allNodes[nodeId], allNodes);
            }
          });
        }

        // Process linked nodes
        if (rootNode.linkedNodes) {
          Object.values(rootNode.linkedNodes).forEach(nodeId => {
            if (allNodes[nodeId]) {
              extractTextInVisualOrder(allNodes[nodeId], allNodes);
            }
          });
        }
      };

      // Recursive function for backward compatibility and to catch any nodes
      // that might not be in the visual hierarchy
      const extractTextFromNodes = (nodes) => {
        if (!nodes) return;

        Object.values(nodes).forEach(node => {
          // Skip processing if this is a hidden node
          if (node.hidden === true) return;

          // Check for Text components
          if (node.type && node.type.resolvedName === 'Text' &&
              node.props && node.props.text &&
              typeof node.props.text === 'string') {

            // Skip default placeholder text
            if (!isDefaultText(node.props.text)) {
              // Only add if not already in the array
              if (!textContent.includes(node.props.text)) {
                textContent.push(node.props.text);
              }
            }
          }

          // Check for nodes property (for nested components)
          if (node.nodes) {
            extractTextFromNodes(node.nodes);
          }

          // Check for linkedNodes property
          if (node.linkedNodes) {
            extractTextFromNodes(node.linkedNodes);
          }
        });
      };

      // First try to extract text in visual order
      if (parsed.ROOT) {
        // Extract text following the visual hierarchy
        extractTextInVisualOrder(parsed.ROOT, parsed);
      }

      // If we didn't get any text, fall back to the old method
      if (textContent.length === 0) {
        // Check different possible structures
        if (parsed.nodes) {
          extractTextFromNodes(parsed.nodes);
        } else if (parsed.ROOT && parsed.ROOT.nodes) {
          extractTextFromNodes(parsed.ROOT.nodes);
        } else if (parsed.ROOT) {
          // Try to extract from ROOT directly
          extractTextFromNodes({ ROOT: parsed.ROOT });
        } else {
          // Try to extract from the entire object
          extractTextFromNodes(parsed);
        }
      }

      // If we found text content, use it
      if (textContent.length > 0) {
        const preview = textContent.join(' ').replace(/\s+/g, ' ').trim();
        return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
      }

      // Try to extract any text from the JSON string as a last resort
      if (typeof content === 'string') {
        // Look for text patterns in the JSON string
        const textMatches = content.match(/"text":"([^"]+)"/g);
        if (textMatches && textMatches.length > 0) {
          const extractedTexts = textMatches.map(match => {
            return match.replace(/"text":"/, '').replace(/"$/, '');
          });

          if (extractedTexts.length > 0) {
            const preview = extractedTexts.join(' ').replace(/\\"/g, '"').replace(/\s+/g, ' ').trim();
            return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
          }
        }

        // Try to handle double-escaped JSON strings
        if (content.includes('\\"text\\"')) {
          const doubleEscapedMatches = content.match(/\\"text\\":\\"([^\\]+)\\"/g);
          if (doubleEscapedMatches && doubleEscapedMatches.length > 0) {
            const extractedTexts = doubleEscapedMatches.map(match => {
              return match.replace(/\\"text\\":\\"/, '').replace(/\\"$/, '');
            });

            if (extractedTexts.length > 0) {
              const preview = extractedTexts.join(' ').replace(/\\\\/g, '\\').replace(/\s+/g, ' ').trim();
              return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
            }
          }
        }
      }

      // Default message if no text found
      return "Interactive content created with Content Editor";
    } catch (error) {
      console.error("Error extracting preview from JSON:", error);
      return "Interactive content created with Content Editor";
    }
  }

  // For HTML content, use the original approach
  try {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
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
    const textContent = content
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

const SortableStudyGuideItem = ({
  guide,
  onSelect,
  selectedId,
  hoveredId,
  setHoveredId,
  onCopy,
  onMove,
  onUpdateDescription
}) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';

  // Get current secondary color for the theme
  const currentSecondaryColor = themeColors.secondary[isDark ? 'dark' : 'light'];
  const [showActions, setShowActions] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(guide.description || '');
  const actionsRef = useRef(null);
  const descriptionRef = useRef(null);
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

  // Update description when guide changes
  useEffect(() => {
    setDescription(guide.description || '');
  }, [guide]);

  // Close actions menu and description editor when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setShowActions(false);
      }

      if (isEditingDescription && descriptionRef.current && !descriptionRef.current.contains(event.target)) {
        setIsEditingDescription(false);
        if (description !== guide.description) {
          onUpdateDescription(guide.id, description);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditingDescription, description, guide, onUpdateDescription]);

  const handleCopy = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onCopy(guide);
  };

  const handleMove = (e) => {
    e.stopPropagation();
    setShowActions(false);
    onMove(guide);
  };

  const toggleActions = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handleDescriptionClick = (e) => {
    e.stopPropagation();
    setIsEditingDescription(true);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleDescriptionSave = (e) => {
    e.stopPropagation();
    setIsEditingDescription(false);
    if (description !== guide.description) {
      onUpdateDescription(guide.id, description);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg ${selectedId === guide.id ? 'border-2 border-primary shadow-lg' : `border-2 ${hoveredId === guide.id ? 'border-gray-400 dark:border-slate-500' : 'border-gray-300 dark:border-slate-500'}`} overflow-hidden transition-all duration-200 ${isDragging ? 'shadow-xl opacity-80' : selectedId === guide.id ? 'shadow-lg' : hoveredId === guide.id ? 'shadow-md' : 'shadow-sm'}`}
      onMouseEnter={() => !isDragging && setHoveredId(guide.id)}
      onMouseLeave={() => setHoveredId(null)}
      onClick={() => onSelect(guide)}
      {...attributes}
    >
      <div className={`${hoveredId === guide.id ? 'bg-gray-50 dark:bg-slate-600' : 'bg-white dark:bg-slate-700'} cursor-pointer transition-colors duration-200`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white overflow-hidden text-ellipsis whitespace-nowrap">
              {guide.title}
            </h3>
            <div className="flex items-center gap-2">
              {/* Actions menu button */}
              <div
                className={`relative text-gray-400 p-1 rounded ${hoveredId === guide.id ? 'visible' : 'invisible'} ${isDark ? 'hover:bg-slate-600' : 'hover:bg-gray-200'}`}
                onClick={toggleActions}
                ref={actionsRef}
              >
                <FaEllipsisV size={16} />

                {/* Dropdown menu */}
                {showActions && (
                  <div className={`absolute right-0 top-full mt-1 w-40 rounded-md shadow-lg z-10 ${isDark ? 'bg-slate-700 border border-slate-600' : 'bg-white border border-gray-200'}`}>
                    <div className="py-1">
                      <button
                        className={`flex items-center w-full px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-slate-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={handleCopy}
                      >
                        <FaCopy className="mr-2" size={14} />
                        Copy
                      </button>
                      <button
                        className={`flex items-center w-full px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-slate-600' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={handleMove}
                      >
                        <FaArrowRight className="mr-2" size={14} />
                        Move
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Drag handle */}
              <div
                {...listeners}
                className={`text-gray-400 cursor-grab p-1 rounded ${hoveredId === guide.id ? 'bg-gray-100 dark:bg-slate-600' : 'bg-transparent'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </div>
            </div>
          </div>
          {/* Description field - editable */}
          <div
            className="mb-2 relative"
            ref={descriptionRef}
            onClick={guide.description ? handleDescriptionClick : undefined}
          >
            <div className="flex items-center mb-1">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Custom Description
              </span>
              {!isEditingDescription && (
                <button
                  className="ml-2 px-2 py-1 text-xs font-medium rounded transition-colors"
                  style={{
                    backgroundColor: currentSecondaryColor,
                    color: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.8';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}
                  onClick={handleDescriptionClick}
                >
                  {guide.description ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {isEditingDescription ? (
              <div className="flex flex-col">
                <textarea
                  value={description}
                  onChange={handleDescriptionChange}
                  className={`w-full px-3 py-2 border ${isDark ? 'border-slate-600 bg-slate-700 text-white' : 'border-gray-300 text-gray-700 bg-white'} rounded-md text-sm box-border outline-none focus:border-primary focus:ring-1 focus:ring-primary`}
                  placeholder="Enter a custom description (will override auto-generated description)"
                  rows={2}
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex justify-end mt-1">
                  <button
                    className="px-2 py-1 text-xs text-white rounded transition-colors"
                    style={{
                      backgroundColor: currentSecondaryColor
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.opacity = '0.8';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.opacity = '1';
                    }}
                    onClick={handleDescriptionSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : guide.description ? (
              <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 min-h-[3em] border border-transparent px-3 py-2 rounded-md hover:border-gray-200 dark:hover:border-slate-600 cursor-text">
                {guide.description}
              </div>
            ) : null}
          </div>

          {/* Content preview */}
          <div className={`text-sm text-gray-600 dark:text-gray-300 line-clamp-2 ${!guide.description && !isEditingDescription ? 'mt-0' : 'mt-2'}`}>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
              Content Preview:
            </span>
            {extractPreview(guide.content)}
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 px-4 py-2 border-t border-gray-100 dark:border-slate-600 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-xs text-gray-500 dark:text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Updated {formatDate(guide.updated_at)}
            </div>

            {/* Publish status indicator */}
            <div className={`text-xs font-medium flex items-center ${guide.is_published
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-500 dark:text-gray-400'}`}
            >
              <span className={`inline-block w-2 h-2 rounded-full mr-1 ${guide.is_published
                ? 'bg-green-500 dark:bg-green-400'
                : 'bg-gray-400 dark:bg-gray-500'}`}
              ></span>
              {guide.is_published ? 'Published' : 'Draft'}
            </div>
          </div>

          <div className={`text-xs font-medium text-primary transition-opacity duration-200 ${hoveredId === guide.id || selectedId === guide.id ? 'opacity-100' : 'opacity-0'}`}>
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
  onReorder,
  onCopy,
  onMove,
  onUpdateDescription,
  isLoading,
  error
}) => {
  const [hoveredId, setHoveredId] = useState(null);
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

  // Handle loading state
  if (isLoading) {
    return (
      <div className="p-8">
        <LoadingSpinner size="lg" text="Loading study guides..." />
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    );
  }

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
              onCopy={onCopy}
              onMove={onMove}
              onUpdateDescription={onUpdateDescription}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default StudyGuideList;
