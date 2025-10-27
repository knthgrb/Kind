-- Update verification-documents bucket policies to allow other users to view documents
-- This is useful for employers to view verification documents of potential hires

-- First, drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can view their own verification documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification documents" ON storage.objects;

-- Policy for users to view their own verification documents
CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to view other users' verification documents (for employers)
CREATE POLICY "Users can view other users verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' 
  AND auth.uid() IS NOT NULL -- Any authenticated user can view
);

-- Admin policies for managing all verification documents
CREATE POLICY "Admins can view all verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Policy for users to upload their own verification documents (keep existing)
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to update their own verification documents (keep existing)
CREATE POLICY "Users can update their own verification documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy for users to delete their own verification documents (keep existing)
CREATE POLICY "Users can delete their own verification documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'verification-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Admin policies for managing all verification documents (keep existing)
CREATE POLICY "Admins can update all verification documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can delete all verification documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'verification-documents' 
  AND EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Make the bucket public for easier access (optional)
-- UPDATE storage.buckets 
-- SET public = true 
-- WHERE id = 'verification-documents';
