export interface KindBossingDocument {
  id: string;
  created_at: string;
  kindbossing_user_id: string;
  file_url: string;
  title: string;
  size: number;
  content_type: string | null;
}

export interface UploadDocumentData {
  title: string;
  type: string;
  description?: string;
  file: File;
}
