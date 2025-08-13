-- Migration 15: Create Supabase Storage Buckets
-- This migration creates the storage buckets for file management

-- Create media-library storage bucket
INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id)
VALUES (
    'media-library',
    'media-library', 
    NULL,
    '2025-04-03 19:15:50.464755+00',
    '2025-04-03 19:15:50.464755+00',
    true,
    false,
    NULL,
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Create quiz-pdfs storage bucket
INSERT INTO storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id)
VALUES (
    'quiz-pdfs',
    'quiz-pdfs',
    NULL,
    '2025-02-16 22:58:56.606004+00',
    '2025-02-16 22:58:56.606004+00',
    true,
    false,
    NULL,
    NULL,
    NULL
)
ON CONFLICT (id) DO NOTHING;

-- Add storage policies for media-library bucket
-- Allow authenticated users full access to media-library
CREATE POLICY IF NOT EXISTS "Allow authenticated users to read media-library" ON storage.objects
    FOR SELECT TO authenticated USING (bucket_id = 'media-library');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert media-library" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'media-library');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update media-library" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'media-library');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete media-library" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'media-library');

-- Add storage policies for quiz-pdfs bucket
-- Allow public read access to quiz PDFs, authenticated write access
CREATE POLICY IF NOT EXISTS "Allow public to read quiz-pdfs" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'quiz-pdfs');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to insert quiz-pdfs" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'quiz-pdfs');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to update quiz-pdfs" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'quiz-pdfs');

CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete quiz-pdfs" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'quiz-pdfs');