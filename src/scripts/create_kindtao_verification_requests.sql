-- Create verification_statuses enum type
CREATE TYPE public.verification_statuses AS ENUM ('pending', 'approved', 'rejected');

-- Create kindtao_verification_requests table
CREATE TABLE public.kindtao_verification_requests (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  kindtao_user_id uuid null default gen_random_uuid (),
  status public.verification_statuses not null default 'pending'::verification_statuses,
  updated_at timestamp with time zone null default (now() AT TIME ZONE 'utc'::text),
  notes text null,
  constraint kindtao_verification_requests_pkey primary key (id),
  constraint kindtao_verification_requests_kindtao_user_id_fkey foreign KEY (kindtao_user_id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- Add indexes for better performance
CREATE INDEX idx_kindtao_verification_requests_user_id ON public.kindtao_verification_requests(kindtao_user_id);
CREATE INDEX idx_kindtao_verification_requests_status ON public.kindtao_verification_requests(status);

-- Enable RLS
ALTER TABLE public.kindtao_verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own verification requests" ON public.kindtao_verification_requests
  FOR SELECT USING (auth.uid() = kindtao_user_id);

CREATE POLICY "Users can insert their own verification requests" ON public.kindtao_verification_requests
  FOR INSERT WITH CHECK (auth.uid() = kindtao_user_id);

CREATE POLICY "Users can update their own verification requests" ON public.kindtao_verification_requests
  FOR UPDATE USING (auth.uid() = kindtao_user_id);

-- Admin policies (for admin users to manage all verification requests)
CREATE POLICY "Admins can view all verification requests" ON public.kindtao_verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update all verification requests" ON public.kindtao_verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );
