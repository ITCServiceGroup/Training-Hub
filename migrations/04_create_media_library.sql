-- Migration to create the media_library table and set up RLS policies

-- 1. Create the media_library table
CREATE TABLE public.media_library (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    file_name text NOT NULL,
    storage_path text NOT NULL UNIQUE, -- Path within the Supabase storage bucket
    public_url text NOT NULL,         -- Publicly accessible URL for the file
    mime_type text NOT NULL,          -- e.g., 'image/jpeg', 'video/mp4'
    size bigint NOT NULL,             -- File size in bytes
    alt_text text,                    -- Optional alt text for images
    caption text,                     -- Optional caption
    uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the user who uploaded it
    created_at timestamptz DEFAULT now() NOT NULL,
    updated_at timestamptz DEFAULT now() NOT NULL
);

-- Add comments to the table and columns for clarity
COMMENT ON TABLE public.media_library IS 'Stores metadata for uploaded media files.';
COMMENT ON COLUMN public.media_library.storage_path IS 'Path to the file within the Supabase storage bucket (e.g., public/images/myfile.jpg)';
COMMENT ON COLUMN public.media_library.public_url IS 'Full public URL provided by Supabase storage.';
COMMENT ON COLUMN public.media_library.alt_text IS 'Alternative text for accessibility, primarily for images.';
COMMENT ON COLUMN public.media_library.uploaded_by IS 'The user who uploaded the file.';

-- 2. Enable Row Level Security (RLS) for the table
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
-- Policy: Allow authenticated users to view all media items
CREATE POLICY "Allow authenticated users to SELECT"
ON public.media_library
FOR SELECT
TO authenticated
USING (true);

-- Policy: Allow authenticated users to insert new media items
CREATE POLICY "Allow authenticated users to INSERT"
ON public.media_library
FOR INSERT
TO authenticated
WITH CHECK (true); -- Can simplify check if needed, e.g., check auth.uid() = uploaded_by

-- Policy: Allow authenticated users to update media items
CREATE POLICY "Allow authenticated users to UPDATE"
ON public.media_library
FOR UPDATE
TO authenticated
USING (true) -- Users can update any record
WITH CHECK (true);

-- Policy: Allow authenticated users to delete media items
CREATE POLICY "Allow authenticated users to DELETE"
ON public.media_library
FOR DELETE
TO authenticated
USING (true); -- Users can delete any record

-- Optional: Create a trigger to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_library_updated_at
BEFORE UPDATE ON public.media_library
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Grant usage permissions for the table to authenticated role
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.media_library TO authenticated;
-- The following line is removed as it's only applicable for SERIAL IDs, not UUIDs:
-- GRANT USAGE, SELECT ON SEQUENCE media_library_id_seq TO authenticated;

-- Note: Storage bucket creation and its RLS policies must be handled separately,
-- typically through the Supabase dashboard or management API/CLI.
