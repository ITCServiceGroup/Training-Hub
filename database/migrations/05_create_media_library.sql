-- Migration 05: Create Media Library System
-- This migration creates the media library for file management

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    storage_path TEXT UNIQUE NOT NULL COMMENT 'Path to the file within the Supabase storage bucket (e.g., public/images/myfile.jpg)',
    public_url TEXT NOT NULL COMMENT 'Full public URL provided by Supabase storage.',
    uploaded_by UUID NOT NULL COMMENT 'The user who uploaded the file.',
    alt_text TEXT COMMENT 'Alternative text for accessibility, primarily for images.',
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
) COMMENT 'Stores metadata for uploaded media files.';

-- Add comments to table
COMMENT ON TABLE media_library IS 'Media file metadata and storage information';
COMMENT ON COLUMN media_library.uploaded_by IS 'References auth.users.id but no FK constraint due to auth schema';
COMMENT ON COLUMN media_library.storage_path IS 'Must be unique to prevent storage conflicts';