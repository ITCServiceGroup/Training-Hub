-- Set up RLS policy for quiz-pdfs bucket
CREATE POLICY "Allow authenticated select from quiz-pdfs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'quiz-pdfs');
