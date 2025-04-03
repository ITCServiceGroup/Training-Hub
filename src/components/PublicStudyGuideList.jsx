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
  return (
    <div
      className="rounded-lg border border-gray-200 overflow-hidden transition-all duration-200 shadow-sm cursor-pointer hover:border-gray-300 hover:shadow-md"
      onClick={() => onSelect(guide)} // Use the passed onSelect handler
    >
      <div className="bg-white">
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap">
              {guide.title || 'Untitled Guide'}
            </h3>
          </div>
          <div className="text-sm text-gray-600 line-clamp-2 h-12 overflow-hidden">
            {extractPreview(guide.content)}
          </div>
        </div>
        <div className="bg-gray-50 p-2 px-4 border-t border-gray-100 flex justify-between items-center">
          <div className="text-xs text-gray-500 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Updated {formatDate(guide.updated_at)}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main List Component
const PublicStudyGuideList = ({ studyGuides = [], onSelect, isLoading, error }) => {

  if (isLoading) {
    return <div className="text-center p-8 text-gray-500">Loading study guides...</div>;
  }

  if (error) {
    return <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">Error loading study guides: {error}</div>;
  }

  if (!studyGuides || studyGuides.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center bg-gray-50 rounded-lg border border-gray-200 min-h-[200px]">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <p className="text-gray-500 mb-2 font-medium">No study guides available</p>
        <p className="text-gray-400 text-sm">There are currently no study guides in this category.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
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
