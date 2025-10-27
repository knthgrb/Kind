-- Create work experiences table
CREATE TABLE public.kindtao_work_experiences (
  created_at timestamp with time zone not null default now(),
  kindtao_user_id uuid null default gen_random_uuid (),
  employer character varying null,
  job_title character varying null,
  is_current_job boolean null,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone null,
  location character varying null,
  skills_used character varying[] null,
  notes text null,
  id uuid not null default gen_random_uuid (),
  description text null,
  constraint kindtao_work_experiences_pkey primary key (id),
  constraint kindtao_work_experiences_kindtao_user_id_fkey foreign KEY (kindtao_user_id) references auth.users (id) on update CASCADE on delete CASCADE
) TABLESPACE pg_default;

-- Create work experience attachments table
CREATE TABLE public.kindtao_work_experience_attachments (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  kindtao_work_experience_id uuid not null default gen_random_uuid (),
  file_url character varying not null,
  title character varying not null,
  size bigint not null,
  content_type character varying not null,
  constraint kindtao_work_experience_attachments_pkey primary key (id),
  constraint kindtao_work_experience_attachm_kindtao_work_experience_id_fkey foreign KEY (kindtao_work_experience_id) references kindtao_work_experiences (id)
) TABLESPACE pg_default;

-- Create verification requests table
CREATE TABLE public.verification_requests (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  user_id uuid not null,
  status character varying not null default 'pending', -- pending, approved, rejected
  document_type character varying not null, -- id_card, barangay_clearance, clinic_certificate, etc.
  document_url character varying not null,
  document_title character varying not null,
  document_size bigint not null,
  document_content_type character varying not null,
  admin_notes text null,
  reviewed_by uuid null,
  reviewed_at timestamp with time zone null,
  rejection_reason text null,
  constraint verification_requests_pkey primary key (id),
  constraint verification_requests_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE,
  constraint verification_requests_reviewed_by_fkey foreign KEY (reviewed_by) references auth.users (id) on update CASCADE on delete SET NULL
) TABLESPACE pg_default;

-- Add indexes for better performance
CREATE INDEX idx_kindtao_work_experiences_user_id ON public.kindtao_work_experiences(kindtao_user_id);
CREATE INDEX idx_kindtao_work_experience_attachments_experience_id ON public.kindtao_work_experience_attachments(kindtao_work_experience_id);
CREATE INDEX idx_verification_requests_user_id ON public.verification_requests(user_id);
CREATE INDEX idx_verification_requests_status ON public.verification_requests(status);

-- Add RLS policies
ALTER TABLE public.kindtao_work_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kindtao_work_experience_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_requests ENABLE ROW LEVEL SECURITY;

-- RLS policies for work experiences
CREATE POLICY "Users can view their own work experiences" ON public.kindtao_work_experiences
  FOR SELECT USING (auth.uid() = kindtao_user_id);

CREATE POLICY "Users can insert their own work experiences" ON public.kindtao_work_experiences
  FOR INSERT WITH CHECK (auth.uid() = kindtao_user_id);

CREATE POLICY "Users can update their own work experiences" ON public.kindtao_work_experiences
  FOR UPDATE USING (auth.uid() = kindtao_user_id);

CREATE POLICY "Users can delete their own work experiences" ON public.kindtao_work_experiences
  FOR DELETE USING (auth.uid() = kindtao_user_id);

-- RLS policies for work experience attachments
CREATE POLICY "Users can view attachments for their work experiences" ON public.kindtao_work_experience_attachments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kindtao_work_experiences 
      WHERE id = kindtao_work_experience_id 
      AND kindtao_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert attachments for their work experiences" ON public.kindtao_work_experience_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kindtao_work_experiences 
      WHERE id = kindtao_work_experience_id 
      AND kindtao_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update attachments for their work experiences" ON public.kindtao_work_experience_attachments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.kindtao_work_experiences 
      WHERE id = kindtao_work_experience_id 
      AND kindtao_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments for their work experiences" ON public.kindtao_work_experience_attachments
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.kindtao_work_experiences 
      WHERE id = kindtao_work_experience_id 
      AND kindtao_user_id = auth.uid()
    )
  );

-- RLS policies for verification requests
CREATE POLICY "Users can view their own verification requests" ON public.verification_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification requests" ON public.verification_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own verification requests" ON public.verification_requests
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies for verification requests (assuming admin role exists)
CREATE POLICY "Admins can view all verification requests" ON public.verification_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can update all verification requests" ON public.verification_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );
