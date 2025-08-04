import React, { useRef } from 'react';
import { listMedia, uploadMedia } from '../../../../../../../services/api/media';
import { FaTimes, FaUpload } from 'react-icons/fa';
import { MdOutlineAudioFile, MdOutlineInsertDriveFile } from 'react-icons/md';
import { format } from 'date-fns';
import { useAuth } from '../../../../../../../contexts/AuthContext';
import { useTheme } from '../../../../../../../contexts/ThemeContext';

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(15, 118, 110, ${alpha})`; // fallback to default teal

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Helper to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (isNaN(bytes) || bytes < 0) return 'Invalid size';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// Simple Media Grid Component
const SimpleMediaGrid = ({ mediaItems, onSelect, currentImageSrc }) => {
  const { theme, themeColors } = useTheme();
  const isDark = theme === 'dark';
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
      {mediaItems.length === 0 && (
        <p className="col-span-full text-center text-gray-500 mt-4">No media items found.</p>
      )}

      {mediaItems.map((item) => {
        const isImage = item.mime_type?.startsWith('image/');
        const isVideo = item.mime_type?.startsWith('video/');
        const isAudio = item.mime_type?.startsWith('audio/');
        const isCurrentImage = currentImageSrc && item.public_url === currentImageSrc;

        return (
          <div
            key={item.id}
            className={`border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-700 dark:border-slate-600 flex flex-col transition-all cursor-pointer ${
              isCurrentImage 
                ? 'ring-2 border-2 shadow-lg' 
                : 'hover:shadow-md'
            }`}
            style={{
              '--tw-ring-color': hexToRgba(currentPrimaryColor, 0.8),
              borderColor: isCurrentImage ? currentPrimaryColor : undefined
            }}
            onClick={() => onSelect(item)}
          >
            {/* Preview Area */}
            <div className="w-full aspect-square bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-b border-gray-200 dark:border-slate-600">
              {isImage ? (
                <img
                  src={item.public_url || ''}
                  alt={item.alt_text || item.file_name || 'Media item'}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJoLTEyIHctMTIgdGV4dC1ncmF5LTQwMCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9ImN1cnJlbnRDb2xvciI+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNkEyIDIgMCAwMC0yLTJINkEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiAvPgo8L3N2Zz4=';
                    e.target.style.objectFit = 'scale-down';
                  }}
                />
              ) : isVideo ? (
                <div className="w-full h-full bg-gray-900 dark:bg-slate-900 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              ) : isAudio ? (
                <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                  <MdOutlineAudioFile className="h-16 w-16 text-gray-500 dark:text-gray-300" />
                </div>
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                  <MdOutlineInsertDriveFile className="h-16 w-16 text-gray-500 dark:text-gray-300" />
                </div>
              )}
            </div>

            {/* Info Area */}
            <div className="p-2 text-xs flex-grow flex flex-col justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-white text-xs truncate" title={item.file_name}>
                  {item.file_name}
                </p>
                {item.alt_text && (
                  <p className="text-gray-500 dark:text-gray-300 truncate italic text-[10px]" title={`Alt: ${item.alt_text}`}>
                    Alt: {item.alt_text}
                  </p>
                )}
              </div>
              <div className="text-gray-400 dark:text-gray-300 mt-1 text-[10px]">
                <span>{formatBytes(item.size)}</span> | <span>{item.created_at ? format(new Date(item.created_at), 'PP') : 'N/A'}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const MediaLibrarySelector = ({ isOpen, onClose, onSelect, currentImageSrc }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  const [mediaItems, setMediaItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState(null);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listMedia();
      setMediaItems(items || []);
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError('Failed to load media library. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection from input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Automatically trigger upload once a file is selected
      handleUpload(file);
    }
    // Reset the input value so the same file can be selected again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle the upload process
  const handleUpload = async (fileToUpload) => {
    if (!fileToUpload) {
      setUploadError('Please select a file first.');
      return;
    }
    if (!user || !user.id) {
      setUploadError('You must be logged in to upload media.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      console.log(`Uploading file: ${fileToUpload.name} by user: ${user.id}`);
      const newMediaItem = await uploadMedia(fileToUpload, user.id);
      console.log('Upload successful:', newMediaItem);
      await fetchMedia(); // Refresh the media list
    } catch (err) {
      console.error("Failed to upload media:", err);
      setUploadError(`Upload failed: ${err.message || 'Please try again.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // When modal opens, hide any toolbars
  React.useEffect(() => {
    if (isOpen) {
      // Hide all toolbars when modal is open
      const toolbars = document.querySelectorAll('.px-2.py-2.text-white.bg-teal-600.fixed');
      toolbars.forEach(toolbar => {
        toolbar.style.display = 'none';
      });
    } else {
      // Show toolbars again when modal closes
      const toolbars = document.querySelectorAll('.px-2.py-2.text-white.bg-teal-600.fixed');
      toolbars.forEach(toolbar => {
        toolbar.style.display = '';
      });
    }

    // Cleanup function to ensure toolbars are shown when component unmounts
    return () => {
      const toolbars = document.querySelectorAll('.px-2.py-2.text-white.bg-teal-600.fixed');
      toolbars.forEach(toolbar => {
        toolbar.style.display = '';
      });
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center p-4"
      style={{ zIndex: 99999 }} /* Use an extremely high z-index */
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Media Library
          </h2>
          <button
            onClick={onClose}
            className="text-white rounded-md p-1 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1"
            style={{
              backgroundColor: currentPrimaryColor,
              '--tw-ring-color': hexToRgba(currentPrimaryColor, 0.4)
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = hexToRgba(currentPrimaryColor, 0.8);
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = currentPrimaryColor;
            }}
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Upload Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden" // Hide the default input
            accept="image/*,video/*,audio/*" // Accept images, videos, and audio
          />
          <button
            onClick={() => fileInputRef.current?.click()} // Trigger hidden input
            disabled={isUploading}
            className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors flex items-center justify-center gap-2 ${
              isUploading
                ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                : ''
            }`}
            style={!isUploading ? {
              backgroundColor: currentPrimaryColor
            } : {}}
            onMouseEnter={(e) => {
              if (!isUploading) e.target.style.backgroundColor = hexToRgba(currentPrimaryColor, 0.8);
            }}
            onMouseLeave={(e) => {
              if (!isUploading) e.target.style.backgroundColor = currentPrimaryColor;
            }}
          >
            <FaUpload size={14} />
            {isUploading ? 'Uploading...' : 'Upload New Media'}
          </button>
          {uploadError && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{uploadError}</p>}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="text-center py-10">
              <div
                className="animate-spin inline-block w-10 h-10 border-4 rounded-full border-t-transparent"
                style={{ borderColor: hexToRgba(currentPrimaryColor, 0.3), borderTopColor: 'transparent' }}
              />
              <p className="mt-3 text-gray-500 dark:text-gray-300">Loading media...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-10 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
              {error}
            </div>
          )}

          {!isLoading && !error && (
            <SimpleMediaGrid
              mediaItems={mediaItems}
              onSelect={onSelect}
              currentImageSrc={currentImageSrc}
            />
          )}
        </div>
      </div>
    </div>
  );
};
