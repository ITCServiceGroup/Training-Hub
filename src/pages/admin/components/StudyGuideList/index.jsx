import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

// Helper function to extract a preview from HTML content
const extractPreview = (htmlContent, maxLength = 150) => {
  if (!htmlContent) return '';
  
  try {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Remove style, script, and meta tags
    const styleTags = tempDiv.querySelectorAll('style, script, meta, link, head');
    styleTags.forEach(tag => tag.remove());
    
    // Get the first few paragraphs or headings
    const contentElements = tempDiv.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    let preview = '';
    
    // Try to get meaningful content from the first few elements
    for (let i = 0; i < Math.min(contentElements.length, 3); i++) {
      const text = contentElements[i].textContent.trim();
      if (text && text.length > 20) { // Only include if it has meaningful content
        preview = text;
        break;
      }
    }
    
    // If no good paragraph was found, fall back to the first non-empty text
    if (!preview) {
      preview = tempDiv.textContent.replace(/\s+/g, ' ').trim();
    }
    
    // Truncate to maxLength
    return preview.length > maxLength 
      ? preview.substring(0, maxLength) + '...' 
      : preview;
  } catch (error) {
    // Fallback to simpler method if DOM parsing fails
    const textContent = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove style tags and their content
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove script tags and their content
      .replace(/<[^>]*>/g, ' ') // Remove remaining HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Truncate to maxLength
    return textContent.length > maxLength 
      ? textContent.substring(0, maxLength) + '...' 
      : textContent;
  }
};

// Format date in a more readable way
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }
};

const StudyGuideList = ({ 
  studyGuides = [], 
  onSelect, 
  selectedId,
  onReorder 
}) => {
  const [hoveredId, setHoveredId] = useState(null);
  
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    
    const startIndex = result.source.index;
    const endIndex = result.destination.index;
    
    if (startIndex === endIndex) return;
    
    const reorderedGuides = Array.from(studyGuides);
    const [removed] = reorderedGuides.splice(startIndex, 1);
    reorderedGuides.splice(endIndex, 0, removed);
    
    onReorder(reorderedGuides.map((guide, index) => ({
      id: guide.id,
      display_order: index
    })));
  };

  // Styles for empty state
  const emptyStateStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 16px',
    textAlign: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px',
    border: '1px solid #E5E7EB'
  };

  const emptyIconStyles = {
    width: '48px',
    height: '48px',
    color: '#D1D5DB',
    marginBottom: '16px'
  };

  const emptyTitleStyles = {
    color: '#6B7280',
    marginBottom: '8px'
  };

  const emptyDescriptionStyles = {
    color: '#9CA3AF',
    fontSize: '14px'
  };

  // Styles for the grid
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px'
  };

  if (!studyGuides.length) {
    return (
      <div style={emptyStateStyles}>
        <svg xmlns="http://www.w3.org/2000/svg" style={emptyIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p style={emptyTitleStyles}>No study guides found in this category.</p>
        <p style={emptyDescriptionStyles}>Click the "Create New Study Guide" button to add content.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="study-guides">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={gridStyles}
          >
            {studyGuides.map((guide, index) => (
              <Draggable 
                key={guide.id} 
                draggableId={guide.id} 
                index={index}
              >
                {(provided, snapshot) => {
                  // Card styles
                  const cardStyles = {
                    borderRadius: '8px',
                    border: selectedId === guide.id ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                    overflow: 'hidden',
                    transition: 'all 0.2s',
                    boxShadow: snapshot.isDragging 
                      ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
                      : selectedId === guide.id 
                        ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    transform: snapshot.isDragging ? 'rotate(1deg)' : 'none'
                  };

                  const contentStyles = {
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  };

                  const headerStyles = {
                    padding: '16px'
                  };

                  const titleContainerStyles = {
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px'
                  };

                  const titleStyles = {
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1F2937',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  };

                  const dragHandleStyles = {
                    color: '#9CA3AF',
                    cursor: 'grab',
                    padding: '4px',
                    borderRadius: '4px',
                    backgroundColor: hoveredId === guide.id ? '#F3F4F6' : 'transparent'
                  };

                  const previewStyles = {
                    fontSize: '14px',
                    color: '#4B5563',
                    lineHeight: 1.5,
                    height: '3em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  };

                  const footerStyles = {
                    backgroundColor: '#F9FAFB',
                    padding: '8px 16px',
                    borderTop: '1px solid #F3F4F6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  };

                  const dateStyles = {
                    fontSize: '12px',
                    color: '#6B7280',
                    display: 'flex',
                    alignItems: 'center'
                  };

                  const iconStyles = {
                    width: '14px',
                    height: '14px',
                    marginRight: '4px'
                  };

                  const editHintStyles = {
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#3B82F6',
                    opacity: hoveredId === guide.id || selectedId === guide.id ? 1 : 0,
                    transition: 'opacity 0.2s'
                  };

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        ...cardStyles,
                        ...provided.draggableProps.style
                      }}
                      onMouseEnter={() => setHoveredId(guide.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => onSelect(guide)}
                    >
                      <div style={contentStyles}>
                        <div style={headerStyles}>
                          <div style={titleContainerStyles}>
                            <h3 style={titleStyles}>
                              {guide.title}
                            </h3>
                            <div 
                              {...provided.dragHandleProps}
                              style={dragHandleStyles}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                              </svg>
                            </div>
                          </div>
                          
                          <div style={previewStyles}>
                            {extractPreview(guide.content)}
                          </div>
                        </div>
                        
                        <div style={footerStyles}>
                          <div style={dateStyles}>
                            <svg xmlns="http://www.w3.org/2000/svg" style={iconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Updated {formatDate(guide.updated_at)}
                          </div>
                          
                          <div style={editHintStyles}>
                            Click to edit
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default StudyGuideList;
