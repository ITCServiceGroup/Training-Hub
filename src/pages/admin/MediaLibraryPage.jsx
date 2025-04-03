import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext'; // To get user ID for uploads
import { listMedia, uploadMedia, deleteMedia, updateMediaMetadata } from '../../services/api/media';
// Removed supabase import as we're using direct URL construction
import { format } from 'date-fns'; // For formatting dates
import { MdOutlineAudioFile, MdOutlineInsertDriveFile, MdEdit, MdDelete } from 'react-icons/md'; // Icons
import { useDropzone } from 'react-dropzone'; // Import useDropzone

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
const MediaGrid = ({ mediaItems, onDelete, onEditMetadata }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 p-4">
    {mediaItems.length === 0 && <p className="col-span-full text-center text-gray-500 mt-4">No media items found.</p>}
    {mediaItems.map((item) => {
      const isImage = item.mime_type?.startsWith('image/');
      const isVideo = item.mime_type?.startsWith('video/');
      const isAudio = item.mime_type?.startsWith('audio/');

      return (
        <div key={item.id} className="border rounded-lg overflow-hidden shadow-sm relative group bg-white flex flex-col transition-shadow hover:shadow-md">
          {/* Preview Area - Changed h-36 to aspect-square for better consistency */}
          <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden relative border-b border-gray-200">
            {isImage ? (
              // Changed object-cover to object-contain for proper image display
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                {/* Display file type icon with click to preview */}
                <div
                  className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors p-2 rounded-md w-full h-full"
                  onClick={() => {
                    // Construct URL for preview
                    const url = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media-library/${item.storage_path}`;
                    setPreviewUrl(url);
                    setEditingItem(item); // Use existing modal state
                    setIsModalOpen(true);
                  }}
                >
                  <div className="text-gray-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-gray-500 text-xs text-center px-2 truncate max-w-full">
                    {item.file_name || 'Image'}
                  </div>
                </div>
              </div>
            ) : isVideo ? (
              <div className="w-full h-full bg-gray-900 flex items-center justify-center relative">
                 {/* Added controls for video preview */}
                 <video controls muted className="w-full h-full object-contain max-h-full">
                   <source src={item.public_url} type={item.mime_type} />
                 </video>
                 <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 pointer-events-none">
                    {/* Removed overlay icon as controls are now visible */}
                 </div>
              </div>
            ) : isAudio ? (
               <div className="w-full h-full bg-gray-200 flex items-center justify-center p-4">
                 <MdOutlineAudioFile className="h-16 w-16 text-gray-500" />
               </div>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center p-4">
                <MdOutlineInsertDriveFile className="h-16 w-16 text-gray-500" />
              </div>
            )}
          </div>

          {/* Info Area - Adjusted padding and text sizes */}
          <div className="p-2.5 text-xs flex-grow flex flex-col justify-between">
            <div className="mb-1.5">
              <p className="font-medium text-gray-800 text-xs truncate mb-0.5" title={item.file_name}>{item.file_name}</p>
              {item.alt_text && <p className="text-gray-500 truncate italic text-[10px]" title={`Alt: ${item.alt_text}`}>Alt: {item.alt_text}</p>}
              {item.caption && <p className="text-gray-500 truncate text-[10px]" title={`Caption: ${item.caption}`}>Caption: {item.caption}</p>}
            </div>
            <div className="text-gray-400 mt-1 text-[10px]">
              <span>{formatBytes(item.size)}</span> | <span>{item.created_at ? format(new Date(item.created_at), 'PP') : 'N/A'}</span>
            </div>
          </div>

          {/* Actions Overlay */}
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
             <button
               onClick={() => onEditMetadata(item)}
               className="bg-blue-500 hover:bg-blue-600 text-white p-1.5 rounded shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
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

// --- Upload Component ---
const UploadComponent = ({ onUpload }) => {
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
    <div className="p-4 border rounded-lg bg-gray-50 mb-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-3 text-gray-700">Upload New Media</h3>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400 bg-white'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p className="text-blue-600">Drop the files here ...</p>
        ) : (
          <p className="text-gray-500">Drag 'n' drop files here, or click to select files</p>
        )}
        <p className="text-xs text-gray-400 mt-1">(Images, Videos, Audio)</p>
      </div>

      {/* Upload Progress Area */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2 max-h-32 overflow-y-auto pr-2">
          {/* <h4 className="text-sm font-medium text-gray-600">Uploads:</h4> */}
          {Object.entries(uploadProgress).map(([id, status]) => (
            <div key={id} className="text-xs p-1.5 bg-white border rounded">
              <p className="truncate font-medium text-gray-800">{status.name}</p>
              {status.error ? (
                <p className="text-red-600 font-medium">Error: {status.error}</p>
              ) : status.progress === 100 ? (
                 <p className="text-green-600 font-medium">Upload Complete</p>
              ) : (
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 overflow-hidden">
                  <div
                    className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${status.progress || 0}%` }} // Default to 0 if progress is undefined
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
  const [altText, setAltText] = useState('');
  const [caption, setCaption] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Reset form when item changes or modal opens/closes
  useEffect(() => {
    if (isOpen && item) {
      setAltText(item.alt_text || '');
      setCaption(item.caption || '');
      setIsSaving(false); // Reset saving state when modal opens
      setShowPreview(true); // Show preview when modal opens
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  // Construct the image URL
  const imageUrl = item.storage_path ?
    `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/media-library/${item.storage_path}` :
    null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(item.id, { alt_text: altText, caption });
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg transform transition-all scale-100 opacity-100">
        <div className="flex justify-between items-center mb-4 pb-2 border-b">
           <h2 className="text-xl font-semibold text-gray-800">Edit Metadata</h2>
           <button onClick={onClose} disabled={isSaving} className="text-gray-400 hover:text-gray-600 text-2xl leading-none focus:outline-none">&times;</button>
        </div>

        <div className="mb-4 text-center">
            {item.mime_type?.startsWith('image/') ? (
              <div className="relative">
                {showPreview && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-48 mx-auto mb-2 border rounded shadow-sm"
                    onError={(e) => {
                      console.log(`Failed to load preview image: ${imageUrl}`);
                      e.target.style.display = 'none';
                      setShowPreview(false);
                    }}
                  />
                )}
                {!showPreview && (
                  <div className="w-full h-24 bg-gray-100 flex flex-col items-center justify-center text-gray-500 text-sm mb-2 border rounded shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Image preview not available</span>
                  </div>
                )}
              </div>
            ) : item.mime_type?.startsWith('video/') ? (
              <div className="w-full h-24 bg-gray-100 flex flex-col items-center justify-center text-gray-500 text-sm mb-2 border rounded shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Video preview not available</span>
              </div>
            ) : (
              <div className="w-full h-24 bg-gray-100 flex flex-col items-center justify-center text-gray-500 text-sm mb-2 border rounded shadow-sm">
                <MdOutlineInsertDriveFile className="h-8 w-8 mb-1 text-gray-400" />
                <span>No preview available</span>
              </div>
            )}
            <p className="text-sm font-medium truncate text-gray-700" title={item.file_name}>{item.file_name}</p>
            <p className="text-xs text-gray-500">{item.mime_type} | {formatBytes(item.size)}</p>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="altText" className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text <span className="text-xs text-gray-500">(for accessibility, mainly images)</span>
            </label>
            <input
              type="text"
              id="altText"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              placeholder="Describe the image or media"
            />
          </div>
          <div>
            <label htmlFor="caption" className="block text-sm font-medium text-gray-700 mb-1">
              Caption <span className="text-xs text-gray-500">(optional)</span>
            </label>
            <textarea
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows="3"
              disabled={isSaving}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-gray-100"
              placeholder="Optional caption for the media"
            ></textarea>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null); // Item being edited in modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth(); // Get user context

  // Wrap fetchMedia in useCallback to stabilize its identity
  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get media items from the database
      const items = await listMedia();

      // Log all items for debugging
      console.log('Media items fetched:', items);

      // Check if any items have storage_path
      const hasStoragePaths = items.some(item => item.storage_path);
      console.log('Has storage paths:', hasStoragePaths);

      if (items.length > 0) {
        // Log the first item as an example
        console.log('Example item:', items[0]);
        console.log('Storage path:', items[0]?.storage_path);
        console.log('Public URL:', items[0]?.public_url);
      }

      // Use items directly without processing
      const processedItems = items;

      setMediaItems(processedItems);
    } catch (err) {
      console.error("Failed to fetch media:", err);
      setError('Failed to load media library. Please try again.');
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

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

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
      // Close modal handled by EditMetadataModal on success now
      // handleCloseModal();
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
          <div className="text-center py-10">
              {/* Simple Spinner */}
              <div className="animate-spin inline-block w-10 h-10 border-4 rounded-full border-blue-500 border-t-transparent" role="status">
                  <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-3 text-gray-500">Loading media...</p>
          </div>
      )}
      {error && !isLoading && <p className="text-center py-10 text-red-600 bg-red-50 p-4 rounded-md shadow-sm">{error}</p>}

      {!isLoading && !error && (
        <MediaGrid
          mediaItems={mediaItems}
          onDelete={handleDelete}
          onEditMetadata={handleOpenEditModal}
        />
      )}

      <EditMetadataModal
        item={editingItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveMetadata}
      />

      {/* TODO: Add Pagination controls if mediaItems is long */}
    </div>
  );
}

export default MediaLibraryPage;
