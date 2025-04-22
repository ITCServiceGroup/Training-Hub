import React from 'react';
import { useTheme } from '../../../../../../../contexts/ThemeContext';
import { listMedia } from '../../../../../../../services/api/media';
import { FaTimes, FaImage } from 'react-icons/fa';
import { MdOutlineAudioFile, MdOutlineInsertDriveFile } from 'react-icons/md';
import { format } from 'date-fns';

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
const SimpleMediaGrid = ({ mediaItems, onSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 p-2">
      {mediaItems.length === 0 && (
        <p className="col-span-full text-center text-gray-500 mt-4">No media items found.</p>
      )}
      
      {mediaItems.map((item) => {
        const isImage = item.mime_type?.startsWith('image/');
        const isVideo = item.mime_type?.startsWith('video/');
        const isAudio = item.mime_type?.startsWith('audio/');

        return (
          <div 
            key={item.id} 
            className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-slate-700 dark:border-slate-600 flex flex-col transition-shadow hover:shadow-md cursor-pointer"
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

export const MediaLibrarySelector = ({ isOpen, onClose, onSelect }) => {
  const [mediaItems, setMediaItems] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const { theme } = useTheme();

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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Select Image
          </h2>
          <button
            onClick={onClose}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-md p-1 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-1"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isLoading && (
            <div className="text-center py-10">
              <div className="animate-spin inline-block w-10 h-10 border-4 rounded-full border-blue-500 dark:border-blue-400 border-t-transparent" />
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
            />
          )}
        </div>
      </div>
    </div>
  );
};
