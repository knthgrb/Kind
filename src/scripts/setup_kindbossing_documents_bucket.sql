-- Create kindbossing-documents bucket and policies
-- This script sets up the storage bucket for kindbossing documents

-- Create the kindbossing-documents bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kindbossing-documents',
  'kindbossing-documents',
  true, -- Public bucket for easier access
  10485760, -- 10MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
-- Note: Supabase typically enables this by default

-- Policy for users to upload their own documents
CREATE POLICY IF NOT EXISTS "Users can upload their own kindbossing documents"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'kindbossing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view their own documents
CREATE POLICY IF NOT EXISTS "Users can view their own kindbossing documents"
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'kindbossing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to update their own documents
CREATE POLICY IF NOT EXISTS "Users can update their own kindbossing documents"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'kindbossing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own documents
CREATE POLICY IF NOT EXISTS "Users can delete their own kindbossing documents"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'kindbossing-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin policies for managing all documents
CREATE POLICY IF NOT EXISTS "Admins can view all kindbossing documents"
ON storage.objects FOR SELECT 
USING (
  bucket_id = 'kindbossing-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY IF NOT EXISTS "Admins can update all kindbossing documents"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'kindbossing-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY IF NOT EXISTS "Admins can delete all kindbossing documents"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'kindbossing-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

