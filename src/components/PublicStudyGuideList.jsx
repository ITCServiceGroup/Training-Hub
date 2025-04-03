import React from 'react';
import { useNavigate } from 'react-router-dom';

// Helper function to extract a preview from HTML content (Copied from admin StudyGuideList)
const extractPreview = (htmlContent, maxLength = 150) => {
  if (!htmlContent) return '';
  try {
    // Use DOMParser for safer parsing in modern browsers
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove unwanted tags
    const unwantedTags = doc.querySelectorAll('style, script, meta, link, head');
    unwantedTags.forEach(tag => tag.remove());

    // Prioritize specific content elements
    const contentElements = doc.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    let preview = '';
    for (let i = 0; i < Math.min(contentElements.length, 3); i++) {
      const text = contentElements[i].textContent?.trim();
      if (text && text.length > 20) { // Prefer slightly longer text blocks
        preview = text;
        break;
      }
    }
    
    // Fallback to general text content if no suitable element found
    if (!preview) {
      preview = doc.body?.textContent?.replace(/\s+/g, ' ')?.trim() || '';
    }
    
    return preview.length > maxLength ? preview.substring(0, maxLength) + '...' : preview;
  } catch (error) {
    console.error("Error extracting preview:", error);
    // Basic fallback if DOM parsing fails
    const textContent = htmlContent
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return textContent.length > maxLength ? textContent.substring(0, maxLength) + '...' : textContent;
  }
};

// Helper function to format date (Copied from admin StudyGuideList)
const formatDate = (dateString) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'In the future'; // Handle potential clock skew
    if (diffDays === 0) {
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        if (diffHours < 1) return 'Just now';
        if (diffHours === 1) return '1 hour ago';
        return `${diffHours} hours ago`;
    }
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  } catch (error) {
      console.error("Error formatting date:", error);
      return 'Invalid date';
  }
};

// Simplified Item Component (based on SortableStudyGuideItem)
const PublicStudyGuideItem = ({ guide, onSelect }) => {

  // Styles adapted from SortableStudyGuideItem, removing DnD/hover specifics
  const cardStyles = {
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    overflow: 'hidden',
    transition: 'all 0.2s',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cursor: 'pointer', // Make the whole card clickable
    '&:hover': { // Basic hover effect
        borderColor: '#D1D5DB',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
    }
  };

  const contentStyles = { backgroundColor: 'white' };
  const headerStyles = { padding: '16px' };
  const titleContainerStyles = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' };
  const titleStyles = { fontSize: '18px', fontWeight: '600', color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
  // Removed dragHandleStyles
  const previewStyles = { fontSize: '14px', color: '#4B5563', lineHeight: 1.5, height: '3em', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' };
  const footerStyles = { backgroundColor: '#F9FAFB', padding: '8px 16px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
  const dateStyles = { fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center' };
  const iconStyles = { width: '14px', height: '14px', marginRight: '4px', color: '#9CA3AF' }; // Added color
  // Removed editHintStyles

  // State for hover effect (optional, can use CSS :hover)
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        ...cardStyles,
        ...(isHovered && { borderColor: '#D1D5DB', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }) // Apply hover styles via state
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelect(guide)} // Use the passed onSelect handler
    >
      <div style={contentStyles}>
        <div style={headerStyles}>
          <div style={titleContainerStyles}>
            <h3 style={titleStyles}>
              {guide.title || 'Untitled Guide'}
            </h3>
            {/* Removed Drag Handle */}
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
          {/* Removed Edit Hint */}
        </div>
      </div>
    </div>
  );
};

// Main List Component
const PublicStudyGuideList = ({ studyGuides = [], onSelect, isLoading, error }) => {

  const listStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  };

  const loadingStyles = {
      textAlign: 'center',
      padding: '2rem',
      color: '#6B7280'
  };

  const errorStyles = {
      backgroundColor: '#FEF2F2',
      color: '#DC2626',
      padding: '1rem',
      borderRadius: '0.5rem',
      border: '1px solid #FCA5A5'
  };
  
  const emptyStateStyles = { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '48px 16px', 
      textAlign: 'center', 
      backgroundColor: '#F9FAFB', 
      borderRadius: '8px', 
      border: '1px solid #E5E7EB',
      minHeight: '200px' // Ensure it takes some space
  };
  const emptyIconStyles = { width: '48px', height: '48px', color: '#D1D5DB', marginBottom: '16px' };
  const emptyTitleStyles = { color: '#6B7280', marginBottom: '8px', fontWeight: '500' };
  const emptyDescriptionStyles = { color: '#9CA3AF', fontSize: '14px' };

  if (isLoading) {
    return <div style={loadingStyles}>Loading study guides...</div>;
  }

  if (error) {
    return <div style={errorStyles}>Error loading study guides: {error}</div>;
  }

  if (!studyGuides || studyGuides.length === 0) {
    return (
      <div style={emptyStateStyles}>
        <svg xmlns="http://www.w3.org/2000/svg" style={emptyIconStyles} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p style={emptyTitleStyles}>No study guides available</p>
        <p style={emptyDescriptionStyles}>There are currently no study guides in this category.</p>
      </div>
    );
  }

  return (
    <div style={listStyles}>
      {studyGuides.map((guide) => (
        <PublicStudyGuideItem
          key={guide.id}
          guide={guide}
          onSelect={onSelect} // Pass the handler down
        />
      ))}
    </div>
  );
};

export default PublicStudyGuideList;
