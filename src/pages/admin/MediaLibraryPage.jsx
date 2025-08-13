import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // To get user ID for uploads
import { useTheme } from '../../contexts/ThemeContext'; // Import ThemeContext for dark mode
import { listMedia, uploadMedia, deleteMedia, updateMediaMetadata } from '../../services/api/media';
// Removed supabase import as we're using direct URL construction
import { format } from 'date-fns'; // For formatting dates
import { MdOutlineAudioFile, MdOutlineInsertDriveFile, MdEdit, MdDelete } from 'react-icons/md'; // Icons
import { FaTimes } from 'react-icons/fa'; // Import FaTimes for close icon
import { useDropzone } from 'react-dropzone'; // Import useDropzone
import LoadingSpinner from '../../components/common/LoadingSpinner';

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
  if (!bytes || bytes === 0) return '0 Bytes'; // Added check for null/undefined/zero bytes
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  // Handle potential non-numeric or negative bytes input gracefully
  if (isNaN(bytes) || bytes < 0) return 'Invalid size';
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

// --- Media Grid Component ---
// Added onPreviewClick prop
const MediaGrid = ({ mediaItems, onDelete, onEditMetadata, onPreviewClick }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  return (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
    {mediaItems.length === 0 && <p className="col-span-full text-center text-gray-500 mt-4">No media items found.</p>}
    {mediaItems.map((item) => {
      const isImage = item.mime_type?.startsWith('image/');
      const isVideo = item.mime_type?.startsWith('video/');
      const isAudio = item.mime_type?.startsWith('audio/');

      return (
        <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm relative group bg-white dark:bg-slate-700 dark:border-slate-600 flex flex-col transition-shadow hover:shadow-md">
          {/* Preview Area - Changed h-36 to aspect-square for better consistency */}
          <div className="w-full aspect-square bg-gray-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden relative border-b border-gray-200 dark:border-slate-600">
            {isImage ? (
              // Use onPreviewClick passed from parent
              <div
                className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-slate-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                onClick={() => {
                  onPreviewClick(item);
                }}
              >
                {/* Display actual image */}
                <img
                  src={item.public_url || ''} // Ensure URL exists
                  alt={item.alt_text || item.file_name || 'Media item'}
                  className="w-full h-full object-contain" // Use object-contain to show full image
                  loading="lazy" // Lazy load images
                  onError={(e) => { // Add a simple error handler back
                    e.target.onerror = null;
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGNsYXNzPSJoLTEyIHctMTIgdGV4dC1ncmF5LTQwMCIgZmlsbD0ibm9uZSIgdmlld0JveD0iMCAwIDI0IDI0IiBzdHJva2U9ImN1cnJlbnRDb2xvciI+CiAgPHBhdGggc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjEuNSIgZD0iTTQgMTZsNC41ODYtNC41ODZhMiAyIDAgMDEyLjgyOCAwTDE2IDE2bS0yLTJsMS41ODYtMS41ODZhMiAyIDAgMDEyLjgyOCAwTDIwIDE0bS02LTZoLjAxTTYgMjBoMTJhMiAyIDAgMDAyLTJWNkEyIDIgMCAwMC0yLTJINkEyIDIgMCAwMC0yIDJ2MTJhMiAyIDAgMDAyIDJ6IiAvPgo8L3N2Zz4='; // Placeholder SVG
                    e.target.style.objectFit = 'scale-down';
                  }}
                />
              </div>
            ) : isVideo ? (
              <div className="w-full h-full bg-gray-900 dark:bg-slate-900 flex items-center justify-center relative">
                 {/* Added controls for video preview */}
                 <video controls muted className="w-full h-full object-contain max-h-full">
                   <source src={item.public_url} type={item.mime_type} />
                 </video>
                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
                    {/* Removed overlay icon as controls are now visible */}
                 </div>
              </div>
            ) : isAudio ? (
               <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center p-4">
                 <MdOutlineAudioFile className="h-16 w-16 text-gray-500 dark:text-gray-300" />
               </div>
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-slate-700 flex items-center justify-center p-4">
                <MdOutlineInsertDriveFile className="h-16 w-16 text-gray-500 dark:text-gray-300" />
              </div>
            )}
          </div>

          {/* Info Area - Adjusted padding and text sizes */}
          <div className="p-2.5 text-xs flex-grow flex flex-col justify-between">
            <div className="mb-1.5">
              <p className="font-medium text-gray-800 dark:text-white text-xs truncate mb-0.5" title={item.file_name}>{item.file_name}</p>
              {item.alt_text && <p className="text-gray-500 dark:text-gray-300 truncate italic text-[10px]" title={`Alt: ${item.alt_text}`}>Alt: {item.alt_text}</p>}
              {item.caption && <p className="text-gray-500 dark:text-gray-300 truncate text-[10px]" title={`Caption: ${item.caption}`}>Caption: {item.caption}</p>}
            </div>
            <div className="text-gray-400 dark:text-gray-300 mt-1 text-[10px]">
              <span>{formatBytes(item.size)}</span> | <span>{item.created_at ? format(new Date(item.created_at), 'PP') : 'N/A'}</span>
            </div>
          </div>

          {/* Actions Overlay */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
             <button
               onClick={() => onEditMetadata(item)}
               className="text-white p-1.5 rounded shadow focus:outline-none focus:ring-2 focus:ring-opacity-75"
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
               title="Edit Metadata"
             >
               <MdEdit size={14} />
             </button>
             <button
               onClick={() => onDelete(item.id)}
               className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded shadow focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75"
               title="Delete"
             >
               <MdDelete size={14} />
             </button>
           </div>
        </div>
      );
    })}
  </div>
  );
};

// --- Upload Component ---
const UploadComponent = ({ onUpload }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // Track progress per file { [fileId]: { name, progress, error } }

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setIsUploading(true);
    const currentUploads = {}; // Track progress for this batch

    // Initialize progress state for current batch
    acceptedFiles.forEach(file => {
        const fileId = `${file.name}-${file.lastModified}-${file.size}`;
        currentUploads[fileId] = { name: file.name, progress: 0, error: null };
    });
    setUploadProgress(currentUploads);

    const uploadPromises = acceptedFiles.map(async (file) => {
      const fileId = `${file.name}-${file.lastModified}-${file.size}`;
      try {
        // Simulate slight delay before actual upload starts if needed
        // await new Promise(resolve => setTimeout(resolve, 50));
        // setUploadProgress(prev => ({ ...prev, [fileId]: { ...prev[fileId], progress: 10 } }));

        await onUpload(file); // Actual upload call

        // Mark as complete
        setUploadProgress(prev => ({ ...prev, [fileId]: { ...prev[fileId], progress: 100 } }));

      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setUploadProgress(prev => ({ ...prev, [fileId]: { ...prev[fileId], error: error.message || 'Upload failed', progress: 0 } }));
      }
    });

    await Promise.all(uploadPromises);
    setIsUploading(false);

    // Clear progress after a delay (e.g., 5 seconds)
    setTimeout(() => {
        setUploadProgress(prev => {
            // Filter out completed/failed items from this batch
            const remainingProgress = { ...prev };
            Object.keys(currentUploads).forEach(fileId => {
                delete remainingProgress[fileId];
            });
            return remainingProgress;
        });
    }, 5000); // 5 seconds delay

    // Cleanup timer on component unmount or if new uploads start
    // Note: This cleanup might be better handled if progress state was managed differently,
    // but for this simple approach, it helps prevent memory leaks if the component unmounts quickly.
    // A more robust solution might involve tracking timers per file ID.
    // For now, we rely on the component staying mounted during the timeout.

  }, [onUpload]); // Keep dependency array minimal

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { // Example: Accept common image and video types
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'video/*': ['.mp4', '.webm', '.mov', '.avi', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.ogg']
    },
    disabled: isUploading
  });

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-800 dark:border-slate-600 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-white">Upload New Media</h3>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-white dark:bg-slate-700' : 'border-gray-300 dark:border-gray-500 hover:border-gray-400 dark:hover:border-gray-400 bg-white dark:bg-slate-700'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        style={isDragActive ? {
          borderColor: currentPrimaryColor,
          backgroundColor: hexToRgba(currentPrimaryColor, isDark ? 0.1 : 0.05)
        } : {}}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-primary" style={{ color: currentPrimaryColor }}>Drop the files here ...</p>
        ) : (
          <p className="text-gray-500 dark:text-gray-300">Drag 'n' drop files here, or click to select files</p>
        )}
        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">(Images, Videos, Audio)</p>
      </div>

      {/* Upload Progress Area */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2">
          {/* <h4 className="text-sm font-medium text-gray-600">Uploads:</h4> */}
          {Object.entries(uploadProgress).map(([id, status]) => (
            <div key={id} className="text-xs p-1.5 bg-white dark:bg-slate-700 border dark:border-slate-600 rounded">
              <p className="truncate font-medium text-gray-800 dark:text-white">{status.name}</p>
              {status.error ? (
                <p className="text-red-600 dark:text-red-400 font-medium">Error: {status.error}</p>
              ) : status.progress === 100 ? (
                 <p className="text-green-600 dark:text-green-400 font-medium">Upload Complete</p>
              ) : (
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${status.progress || 0}%`,
                      backgroundColor: currentPrimaryColor
                    }}
                  ></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// --- Edit Metadata Modal ---
const EditMetadataModal = ({ item, isOpen, onClose, onSave }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  const [fileName, setFileName] = useState('');
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  // Reset form when item changes or modal opens/closes
  useEffect(() => {
    if (isOpen && item) {
      setFileName(item.file_name || '');
      setAltText(item.alt_text || '');
      setCaption(item.caption || '');
      setIsSaving(false); // Reset saving state when modal opens
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleSave = async () => {
    if (!fileName.trim()) {
      alert('Filename cannot be empty');
      return;
    }
    setIsSaving(true);
    try {
      await onSave(item.id, { file_name: fileName, alt_text: altText, caption });
      onClose(); // Close modal on successful save
    } catch (error) {
       console.error("Failed to save metadata:", error);
       alert(`Error saving metadata: ${error.message}`);
       // Keep modal open on error
    } finally {
        setIsSaving(false);
    }
  };

  return (
    // Add onClick={onClose} to the backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Add onClick={(e) => e.stopPropagation()} to prevent clicks inside from closing */}
      <div
        className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all scale-100 opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
           <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Metadata</h2>
           {/* Updated Close Button */}
           <button
             onClick={onClose}
             disabled={isSaving}
             className="text-white rounded-md p-1 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50"
             style={{
               backgroundColor: currentPrimaryColor,
               '--tw-ring-color': hexToRgba(currentPrimaryColor, 0.4)
             }}
             onMouseEnter={(e) => {
               if (!isSaving) e.target.style.backgroundColor = hexToRgba(currentPrimaryColor, 0.8);
             }}
             onMouseLeave={(e) => {
               if (!isSaving) e.target.style.backgroundColor = currentPrimaryColor;
             }}
             aria-label="Close edit metadata"
           >
             <FaTimes size={16} /> {/* Use FaTimes icon */}
           </button>
        </div>

        <div className="mb-6 text-center">
            {/* Show actual preview in Edit Modal, ensure URL exists */}
            {item.mime_type?.startsWith('image/') ? (
              <> {/* Use Fragment to group img and placeholder */}
                <img
                  src={item.public_url || ''} // Ensure URL exists
                  alt="Preview"
                  className="w-auto h-24 max-w-full mx-auto object-contain mb-2 border rounded shadow-sm bg-gray-100 dark:bg-slate-700 dark:border-slate-600"
                  loading="lazy"
                  onError={(e) => { // Add simple error handler
                      e.target.onerror = null;
                      e.target.style.display = 'none'; // Hide broken image
                      // Optionally show a placeholder div
                      const placeholder = e.target.nextElementSibling;
                      if (placeholder && placeholder.classList.contains('placeholder-icon')) {
                        placeholder.style.display = 'flex';
                      }
                  }}
                />
                {/* Placeholder shown on error */}
                <div className="placeholder-icon w-full h-24 bg-gray-100 dark:bg-slate-700 hidden flex-col items-center justify-center text-gray-500 dark:text-gray-300 text-sm mb-2 border dark:border-slate-600 rounded shadow-sm">
                   <MdOutlineInsertDriveFile className="h-8 w-8 mb-1 text-gray-400 dark:text-gray-300" />
                   <span>Preview unavailable</span>
                </div>
              </>
            ) : item.mime_type?.startsWith('video/') ? (
              <video
                src={item.public_url}
                controls
                muted
                className="w-auto h-24 max-w-full mx-auto mb-2 border rounded shadow-sm bg-gray-900 dark:border-slate-600"
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full h-24 bg-gray-100 dark:bg-slate-700 flex flex-col items-center justify-center text-gray-500 dark:text-gray-300 text-sm mb-2 border dark:border-slate-600 rounded shadow-sm">
                <MdOutlineInsertDriveFile className="h-8 w-8 mb-1 text-gray-400 dark:text-gray-300" />
                <span>Preview not available</span>
              </div>
            )}
            <p className="text-sm font-medium truncate text-gray-700 dark:text-white" title={item.file_name}>{item.file_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{item.mime_type} | {formatBytes(item.size)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="fileName" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              File Name <span className="text-xs text-red-500 dark:text-red-400">*</span>
            </label>
            <input
              type="text"
              id="fileName"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-slate-800"
              required
            />
          </div>
          <div>
            <label htmlFor="altText" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Alt Text <span className="text-xs text-gray-500 dark:text-gray-400">(for accessibility, mainly images)</span>
            </label>
            <input
              type="text"
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-slate-800"
              placeholder="Describe the image or media"
            />
          </div>
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
              Caption <span className="text-xs text-gray-500 dark:text-gray-400">(optional)</span>
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100 dark:disabled:bg-slate-800"
              placeholder="Optional caption for the media"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-white rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: currentPrimaryColor,
              '--tw-ring-color': hexToRgba(currentPrimaryColor, 0.4)
            }}
            onMouseEnter={(e) => {
              if (!isSaving) e.target.style.backgroundColor = hexToRgba(currentPrimaryColor, 0.8);
            }}
            onMouseLeave={(e) => {
              if (!isSaving) e.target.style.backgroundColor = currentPrimaryColor;
            }}
          >
            {isSaving ? (
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                </div>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};


// --- Main Page Component ---
function MediaLibraryPage() {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // Item being edited in metadata modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [isPreviewingItem, setIsPreviewingItem] = useState(null); // Item being previewed
  const [isMediaPreviewModalOpen, setIsMediaPreviewModalOpen] = useState(false); // State for media preview modal
  const { user } = useAuth(); // Get user context

  // Handler to open the *media preview* modal
  const handleMediaPreviewClick = (item) => {
    setIsPreviewingItem(item);
    setIsMediaPreviewModalOpen(true);
  };

  // Handler to close the *media preview* modal
  const handleCloseMediaPreviewModal = () => {
    setIsMediaPreviewModalOpen(false);
    setIsPreviewingItem(null);
  };

  // Handler to open the *edit metadata* modal
  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  // Handler to close the *edit metadata* modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditingItem(null);
  };

  // Wrap fetchMedia in useCallback to stabilize its identity
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get media items from the database (listMedia now generates fresh URLs)
      const items = await listMedia();

      // Log all items for debugging
      console.log('Media items fetched:', items);

      // No longer need to process URLs here, listMedia handles it
      setMediaItems(items || []); // Ensure mediaItems is always an array

    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError('Failed to load media library. Please try again.');
      setMediaItems([]); // Set to empty array on error
    } finally {
      setIsLoading(false);
    }
  }, []);



  useEffect(() => {
    setIsLoading(true); // Set loading true when component mounts
    fetchMedia();
  }, [fetchMedia]); // Depend on the stable fetchMedia function

  // Wrap handleUpload in useCallback
  const handleUpload = useCallback(async (file) => {
    if (!user) {
      alert('You must be logged in to upload media.');
      throw new Error('User not authenticated');
    }
    try {
      // We'll add alt/caption later via the edit modal for simplicity here
      await uploadMedia(file, user.id, {});
      await fetchMedia(); // Refresh list after upload
    } catch (uploadError) {
       console.error("Upload failed in handler:", uploadError);
       // Re-throw the error so the UploadComponent can catch it
       throw uploadError;
    }
  }, [user, fetchMedia]); // Depend on user and fetchMedia

  // Wrap handleDelete in useCallback
  const handleDelete = useCallback(async (mediaId) => {
    if (window.confirm('Are you sure you want to delete this media item? This includes the file in storage and cannot be undone.')) {
      // Optimistic UI update (optional)
      // setMediaItems(prevItems => prevItems.filter(item => item.id !== mediaId));
      try {
        await deleteMedia(mediaId);
        // If not using optimistic update, refresh after success
        await fetchMedia();
      } catch (err) {
        console.error("Failed to delete media:", err);
        alert(`Failed to delete media: ${err.message}`);
        // Rollback optimistic update if it failed
        // fetchMedia(); // Or show error and keep item
      }
    }
  }, [fetchMedia]); // Depend on fetchMedia

  // Note: handleOpenEditModal and handleCloseEditModal defined above

  // Wrap handleSaveMetadata in useCallback
  const handleSaveMetadata = useCallback(async (mediaId, metadata) => {
    // Optimistic UI update (optional)
    // const originalItems = [...mediaItems];
    // setMediaItems(prevItems => prevItems.map(item =>
    //     item.id === mediaId ? { ...item, ...metadata, updated_at: new Date().toISOString() } : item
    // ));
    try {
      await updateMediaMetadata(mediaId, metadata);
      // If not using optimistic update, refresh after success
      await fetchMedia();
      handleCloseEditModal(); // Close edit modal on success
    } catch (err) {
      console.error("Failed to update metadata:", err);
      // Rollback optimistic update
      // setMediaItems(originalItems);
      alert(`Failed to update metadata: ${err.message}`);
      // Re-throw error to keep modal open
      throw err;
    }
  }, [fetchMedia]); // Depend on fetchMedia

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Page Title is handled by AdminLayout */}
      {/* <h1 className="text-2xl font-bold mb-4">Media Library</h1> */}

      <UploadComponent onUpload={handleUpload} />

      {/* TODO: Add Search/Filter controls */}
      {/* <div className="mb-4"> Search Input... </div> */}

      {isLoading && (
          <div className="py-10">
              <LoadingSpinner size="xl" text="Loading media..." />
          </div>
      )}
      {error && !isLoading && <p className="text-center py-10 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-md shadow-sm">{error}</p>}

      {!isLoading && !error && (
        <MediaGrid
          mediaItems={mediaItems}
          onDelete={handleDelete}
          onEditMetadata={handleOpenEditModal} // Opens edit modal
          onPreviewClick={handleMediaPreviewClick} // Opens media preview modal
        />
      )}

      {/* Edit Metadata Modal */}
      <EditMetadataModal
        item={editingItem}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveMetadata}
      />

      {/* Simple Media Preview Modal */}
      {isMediaPreviewModalOpen && isPreviewingItem && (
        <MediaPreviewModal
          item={isPreviewingItem}
          isOpen={isMediaPreviewModalOpen}
          onClose={handleCloseMediaPreviewModal}
        />
      )}

      {/* TODO: Add Pagination controls if mediaItems is long */}
    </div>
  );
}

// --- Simple Media Preview Modal Component ---
const MediaPreviewModal = ({ item, isOpen, onClose }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  if (!isOpen || !item) return null;

  const isImage = item.mime_type?.startsWith('image/');
  const isVideo = item.mime_type?.startsWith('video/');

  return (
    // Add onClick={onClose} to the backdrop
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-[60] p-4 transition-opacity duration-300"
      onClick={onClose}
    >
      {/* Add onClick={(e) => e.stopPropagation()} to prevent clicks inside from closing */}
      <div
        className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3 pb-2 border-b">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white truncate" title={item.file_name}>
             Preview: {item.file_name}
           </h2>
           {/* Updated Close Button */}
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
             aria-label="Close preview"
           >
             <FaTimes size={16} /> {/* Use FaTimes icon */}
           </button>
         </div>

        {/* Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-slate-700 rounded">
          {isImage ? (
            <img
              // Corrected: Only one src attribute
              src={item.public_url || ''} // Ensure URL exists
              alt={item.alt_text || item.file_name || 'Preview'}
              className="max-w-full max-h-[calc(90vh-100px)] object-contain" // Adjust max-height as needed
              loading="lazy"
              onError={(e) => { // Add simple error handler
                e.target.onerror = null;
                e.target.style.display = 'none'; // Hide broken image
                // Optionally display a placeholder/message in the parent div
                const parent = e.target.parentElement;
                if (parent) {
                    parent.innerHTML = '<p class="text-red-500 p-4">Image failed to load.</p>';
                }
              }}
            />
          ) : isVideo ? (
            <video
              src={item.public_url}
              controls
              autoPlay
              muted // Mute to allow autoplay in most browsers
              className="max-w-full max-h-[calc(90vh-100px)]"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-300 p-10">
              <MdOutlineInsertDriveFile className="h-16 w-16 mx-auto mb-2 text-gray-400 dark:text-gray-300" />
              Preview not available for this file type ({item.mime_type}).
            </div>
          )}
        </div>

        {/* Footer (optional) */}
        {/* <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};


export default MediaLibraryPage;
