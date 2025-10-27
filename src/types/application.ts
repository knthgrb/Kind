export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  applicant_name?: string;
  applicant_phone?: string;
  applicant_profile?: any;
  job_title?: string;
  job_location?: string;
  cover_message?: string;
}
