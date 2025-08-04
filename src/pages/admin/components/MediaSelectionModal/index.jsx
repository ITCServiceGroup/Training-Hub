import React, { useState, useEffect, useMemo, useRef } from 'react'; // Removed useContext
import { listMedia, uploadMedia } from '../../../../services/api/media'; // Added uploadMedia
import { useAuth } from '../../../../contexts/AuthContext'; // Changed import to useAuth hook
import { useTheme } from '../../../../contexts/ThemeContext'; // Import ThemeContext for dark mode

// Helper function to convert hex to rgba
const hexToRgba = (hex, alpha) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(15, 118, 110, ${alpha})`; // fallback to default teal

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// Reusable Media Grid Component (adapted from MediaLibraryPage)
// Note: Removed edit/delete buttons for selection context
const MediaGridSelect = ({ mediaItems, onSelectItem, currentImageSrc }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  return (
  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 overflow-y-auto"> {/* Removed h-full */}
    {mediaItems.length === 0 && <p className="col-span-full text-center text-gray-500 dark:text-gray-300">No media items found matching the criteria.</p>}
    {mediaItems.map((item) => {
      const isCurrentImage = currentImageSrc && item.public_url === currentImageSrc;
      return (
      <div
        key={item.id}
        className={`border rounded-lg overflow-hidden shadow-sm relative group cursor-pointer transition-all bg-white dark:bg-slate-700 dark:border-slate-600 ${
          isCurrentImage 
            ? 'ring-2 border-2' 
            : 'hover:ring-2'
        }`}
        style={{
          '--tw-ring-color': hexToRgba(currentPrimaryColor, 0.8),
          borderColor: isCurrentImage ? currentPrimaryColor : undefined
        }}
        onMouseEnter={(e) => {
          if (!isCurrentImage) {
            e.target.style.setProperty('--tw-ring-color', hexToRgba(currentPrimaryColor, 0.5));
          }
        }}
        onClick={() => onSelectItem(item)}
        title={`Select ${item.file_name}`}
      >
        {item.mime_type.startsWith('image/') ? (
          <div className="w-full h-28 flex items-center justify-center bg-gray-100 dark:bg-slate-800 overflow-hidden">
            <img
              src={item.public_url}
              alt={item.alt_text || item.file_name}
              className="max-w-full max-h-28 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentNode.innerHTML = `<div class="flex items-center justify-center w-full h-full"><svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>`;
              }}
              style={{ maxHeight: '7rem', maxWidth: '100%' }}
            />
          </div>
        ) : item.mime_type.startsWith('video/') ? (
          <div className="w-full h-28 bg-gray-800 dark:bg-slate-900 flex items-center justify-center relative">
             <video muted className="w-full h-full object-cover max-h-28">
               <source src={item.public_url} type={item.mime_type} />
             </video>
             <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </div>
          </div>
        ) : (
          <div className="w-full h-28 bg-gray-200 dark:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-300 text-xs p-1 break-all">
            <span>{item.mime_type}</span>
          </div>
        )}
        <div className="p-1.5 text-xs bg-gray-50 dark:bg-slate-600">
          <p className="font-medium truncate text-gray-800 dark:text-white" title={item.file_name}>{item.file_name}</p>
        </div>
      </div>
      );
    })}
  </div>
  );
};


const MediaSelectionModal = ({ isOpen, onClose, onSelectMedia, filterFileType, currentImageSrc }) => {
  const { theme, themeColors } = useTheme(); // Get current theme
  const isDark = theme === 'dark';

  // Get current primary color for the theme
  const currentPrimaryColor = themeColors.primary[isDark ? 'dark' : 'light'];

  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading media list
  const [error, setError] = useState(null); // Error fetching media list
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false); // Upload status
  const [uploadError, setUploadError] = useState(null); // Error during upload
  const [selectedFile, setSelectedFile] = useState(null); // File selected for upload

  const fileInputRef = useRef(null); // Ref for the hidden file input
  const { user } = useAuth(); // Use the custom hook to get user

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
      setSearchTerm(''); // Reset search on open
    }
  }, [isOpen]);

  const fetchMedia = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await listMedia(); // Fetch all items
      setMediaItems(items);
    } catch (err) {
      console.error("Failed to fetch media for modal:", err);
      setError('Failed to load media library.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection from input
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
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
      setSelectedFile(null); // Clear selected file state
      await fetchMedia(); // Refresh the media list
    } catch (err) {
      console.error("Failed to upload media:", err);
      setUploadError(`Upload failed: ${err.message || 'Please try again.'}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Filter media based on search term and TinyMCE file type
  const filteredMedia = useMemo(() => {
    let items = mediaItems;

    // Filter by file type requested by TinyMCE
    if (filterFileType === 'image') {
      items = items.filter(item => item.mime_type.startsWith('image/'));
    } else if (filterFileType === 'media') {
      // 'media' in TinyMCE usually means video/audio
      items = items.filter(item => item.mime_type.startsWith('video/') || item.mime_type.startsWith('audio/'));
    }
    // 'file' type usually means allow anything, so no extra filtering needed

    // Filter by search term (case-insensitive)
    if (searchTerm) {
      items = items.filter(item =>
        item.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.alt_text && item.alt_text.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.caption && item.caption.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return items;
  }, [mediaItems, searchTerm, filterFileType]);

  const handleSelectItem = (item) => {
    onSelectMedia(item); // Pass the selected item back
    // onClose(); // Keep modal open until explicitly closed or selection confirmed? Let parent decide.
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Select Media</h2>
          <button
            onClick={onClose}
            className="text-white bg-primary hover:bg-primary-dark rounded text-2xl w-8 h-8 flex items-center justify-center" // Updated styles: primary bg, white text, square, centered
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b dark:border-slate-700">
          <input
            type="text"
            placeholder={`Search media... (Type: ${filterFileType || 'any'})`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Upload Section */}
        <div className="p-3 border-b dark:border-slate-700">
           <input
             type="file"
             ref={fileInputRef}
             onChange={handleFileChange}
             className="hidden" // Hide the default input
             accept="image/*,video/*" // Accept images and videos
           />
           <button
             onClick={() => fileInputRef.current?.click()} // Trigger hidden input
             disabled={isUploading}
             className={`w-full px-4 py-2 rounded-md text-white font-medium transition-colors ${
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
             {isUploading ? 'Uploading...' : 'Upload New Media'}
           </button>
           {uploadError && <p className="text-red-500 dark:text-red-400 text-sm mt-2 text-center">{uploadError}</p>}
        </div>


        {/* Media Grid Area */}
        <div className="flex-grow min-h-0 overflow-y-auto"> {/* Added overflow-y-auto here */}
          {isLoading && <p className="text-center p-4 text-gray-500 dark:text-gray-300">Loading media...</p>}
          {error && <p className="text-center p-4 text-red-500 dark:text-red-400">{error}</p>}
          {!isLoading && !error && (
            <MediaGridSelect
              mediaItems={filteredMedia}
               onSelectItem={handleSelectItem}
               currentImageSrc={currentImageSrc}
             />
           )}
           {/* Add padding at the bottom of the grid area if needed */}
           <div className="h-4"></div>
        </div>

        {/* Footer (Optional) */}
        {/* <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default MediaSelectionModal;
