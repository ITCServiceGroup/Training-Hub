import { supabase } from '../../config/supabase'; // Corrected: Use named import

const BUCKET_NAME = 'media-library'; // Use the correct bucket name

/**
 * Gets a public URL for a media item
 * @param {string} storagePath The storage path of the file
 * @returns {string} The public URL for the file
 */
export const getMediaUrl = (storagePath) => {
  if (!storagePath) return null;

  // Get the public URL using Supabase's getPublicUrl method
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  return data?.publicUrl || null;
};

/**
 * Fetches a list of media items from the database.
 * TODO: Add pagination, filtering, sorting options.
 * @returns {Promise<Array>} A promise that resolves to an array of media objects.
 */
export const listMedia = async () => {
  // Select all fields. Supabase should provide the correct public_url if the bucket is public.
  const { data: items, error } = await supabase
    .from('media_library')
    .select('*')
    .order('created_at', { ascending: false }); // Default sort: newest first

  if (error) {
    console.error('Error fetching media:', error);
    throw error;
  }

  if (!items) return [];

  // Optionally, verify and regenerate URLs if needed (more robust)
  const processedItems = items.map(item => {
    // If public_url is missing or seems invalid, try generating it.
    // This handles cases where items were uploaded before the bucket was made public.
    if (!item.public_url || !item.public_url.includes(item.storage_path)) {
       if (!item.storage_path) {
         console.warn(`Media item ${item.id} is missing storage_path and public_url.`);
         return { ...item, public_url: null };
       }
       console.log(`Regenerating public URL for item ${item.id}`);
       const { data: urlData } = supabase.storage
         .from(BUCKET_NAME)
         .getPublicUrl(item.storage_path);
       return { ...item, public_url: urlData?.publicUrl || null };
    }
    // Otherwise, assume the stored public_url is correct for the public bucket
    return item;
  });

  return processedItems;
};

/**
 * Uploads a file to Supabase Storage and inserts metadata into the database.
 * @param {File} file The file object to upload.
 * @param {string} userId The ID of the user uploading the file.
 * @param {object} metadata Optional metadata like alt_text, caption.
 * @returns {Promise<object>} A promise that resolves to the newly created media record.
 */
export const uploadMedia = async (file, userId, metadata = {}) => {
  if (!file) {
    throw new Error('No file provided for upload.');
  }
  if (!userId) {
    console.warn('User ID not provided for upload, uploaded_by will be null.');
    // Depending on requirements, you might want to throw an error here instead.
  }

  // Create a unique path for the file, e.g., using timestamp or UUID
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
  const filePath = `${userId || 'public'}/${uniqueFileName}`; // Store under user ID or a public folder

  // 1. Upload the file to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      contentType: file.type || 'application/octet-stream',
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    console.error('Error uploading file to storage:', uploadError);
    throw uploadError;
  }

  // Check if uploadData exists and has path property
  if (!uploadData || !uploadData.path) {
      console.error('Upload response missing path:', uploadData);
      throw new Error('File upload succeeded but failed to get storage path.');
  }

  // 2. Get the public URL for the uploaded file
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(uploadData.path); // Use the path returned from the upload

  if (!urlData || !urlData.publicUrl) {
    // Attempt to clean up the uploaded file if URL retrieval fails
    await supabase.storage.from(BUCKET_NAME).remove([uploadData.path]);
    console.error('Error getting public URL:', urlData);
    throw new Error('File uploaded but failed to get public URL.');
  }

  // 3. Insert metadata into the media_library table
  const mediaRecord = {
    file_name: file.name,
    storage_path: uploadData.path, // Use the path from the successful upload
    public_url: urlData.publicUrl,
    mime_type: file.type,
    size: file.size,
    uploaded_by: userId || null,
    alt_text: metadata.alt_text || null,
    caption: metadata.caption || null,
  };

  const { data: dbData, error: dbError } = await supabase
    .from('media_library')
    .insert(mediaRecord)
    .select()
    .single(); // Return the created record

  if (dbError) {
    // Attempt to clean up the uploaded file if DB insert fails
    await supabase.storage.from(BUCKET_NAME).remove([uploadData.path]);
    console.error('Error inserting media record:', dbError);
    throw dbError;
  }

  return dbData;
};

/**
 * Deletes a media item from storage and the database.
 * @param {string} mediaId The ID of the media record to delete.
 * @returns {Promise<object>} A promise that resolves to the deleted media record data.
 */
export const deleteMedia = async (mediaId) => {
  // 1. Get the storage path from the database record
  const { data: record, error: fetchError } = await supabase
    .from('media_library')
    .select('id, storage_path')
    .eq('id', mediaId)
    .single();

  if (fetchError || !record) {
    console.error('Error fetching media record for deletion:', fetchError);
    throw fetchError || new Error('Media record not found.');
  }

  // 2. Delete the file from storage
  const { error: storageError } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([record.storage_path]);

  if (storageError) {
    // Log the error but proceed to delete the DB record anyway,
    // as the file might already be gone or permissions might be the issue.
    console.warn('Error deleting file from storage (proceeding with DB deletion):', storageError);
  }

  // 3. Delete the record from the database
  const { data: deleteData, error: dbError } = await supabase
    .from('media_library')
    .delete()
    .eq('id', mediaId)
    .select() // Return the deleted record
    .single();

  if (dbError) {
    console.error('Error deleting media record from database:', dbError);
    throw dbError;
  }

  return deleteData;
};

/**
 * Updates metadata for a media item.
 * @param {string} mediaId The ID of the media record to update.
 * @param {object} metadata An object containing fields to update (e.g., { alt_text: 'New alt', caption: 'New caption' }).
 * @returns {Promise<object>} A promise that resolves to the updated media record.
 */
export const updateMediaMetadata = async (mediaId, metadata) => {
  // Filter out any undefined/null values or fields not allowed for update
  const updates = {};
  if (metadata.alt_text !== undefined) updates.alt_text = metadata.alt_text;
  if (metadata.caption !== undefined) updates.caption = metadata.caption;
  if (metadata.file_name !== undefined) updates.file_name = metadata.file_name;
  // Add other updatable fields here if needed

  if (Object.keys(updates).length === 0) {
    console.warn('No valid metadata provided for update.');
    // Return the existing record without making a DB call
     const { data: record, error: fetchError } = await supabase
      .from('media_library')
      .select('*')
      .eq('id', mediaId)
      .single();
     if (fetchError) throw fetchError;
     return record;
  }

  // Add updated_at manually if not using the trigger, or let the trigger handle it
  // updates.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('media_library')
    .update(updates)
    .eq('id', mediaId)
    .select()
    .single();

  if (error) {
    console.error('Error updating media metadata:', error);
    throw error;
  }
  return data;
};
