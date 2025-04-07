import React, { useState, useEffect, useMemo } from 'react';
import { listMedia } from '../../../../services/api/media'; // Adjust path as needed

// Reusable Media Grid Component (adapted from MediaLibraryPage)
// Note: Removed edit/delete buttons for selection context
const MediaGridSelect = ({ mediaItems, onSelectItem }) => (
  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 p-3 overflow-y-auto"> {/* Removed h-full */}
    {mediaItems.length === 0 && <p className="col-span-full text-center text-gray-500">No media items found matching the criteria.</p>}
    {mediaItems.map((item) => (
      <div
        key={item.id}
        className="border rounded-lg overflow-hidden shadow-sm relative group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
        onClick={() => onSelectItem(item)}
        title={`Select ${item.file_name}`}
      >
        {item.mime_type.startsWith('image/') ? (
          <div className="w-full h-28 flex items-center justify-center bg-gray-100 overflow-hidden">
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
          <div className="w-full h-28 bg-gray-800 flex items-center justify-center relative">
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
          <div className="w-full h-28 bg-gray-200 flex items-center justify-center text-gray-500 text-xs p-1 break-all">
            <span>{item.mime_type}</span>
          </div>
        )}
        <div className="p-1.5 text-xs bg-gray-50">
          <p className="font-medium truncate" title={item.file_name}>{item.file_name}</p>
        </div>
      </div>
    ))}
  </div>
);


const MediaSelectionModal = ({ isOpen, onClose, onSelectMedia, filterFileType }) => {
  const [mediaItems, setMediaItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Select Media</h2>
          <button
            onClick={onClose}
            className="text-white bg-teal-600 hover:bg-teal-700 rounded text-2xl w-8 h-8 flex items-center justify-center" // Updated styles: green bg, white text, square, centered
            title="Close"
          >
            &times;
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b">
          <input
            type="text"
            placeholder={`Search media... (Type: ${filterFileType || 'any'})`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Media Grid Area */}
        <div className="flex-grow min-h-0"> {/* Important for overflow */}
          {isLoading && <p className="text-center p-4">Loading media...</p>}
          {error && <p className="text-center p-4 text-red-500">{error}</p>}
          {!isLoading && !error && (
            <MediaGridSelect
              mediaItems={filteredMedia}
              onSelectItem={handleSelectItem}
            />
          )}
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
