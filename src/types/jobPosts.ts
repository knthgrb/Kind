export type SalaryRate = "Per Hour" | "Per Day" | "Per Week" | "Per Month";
export type JobType =
  | "daily"
  | "monthly"
  | "hourly"
  | "contractual"
  | "full-time"
  | "part-time"
  | "yaya"
  | "driver"
  | "housekeeper"
  | "caregiver"
  | "cook"
  | "all_around";

export type JobPostInput = {
  kindbossing_user_id: string;
  job_title: string;
  job_description: string;
  location: string;
  province?: string;
  region?: string;
  salary: string;
  job_type: JobType | null;
  required_skills: string[];
  work_schedule: any;
  required_years_of_experience: number;
  preferred_languages: string[];
  is_boosted: boolean;
  boost_expires_at: string | null;
  status: "active" | "paused" | "closed";
  // New fields for enhanced matching
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  location_coordinates?: string | null;
  expires_at?: string;
};

export type JobPost = {
  id: string;
  kindbossing_user_id: string;
  job_title: string;
  job_description: string;
  job_type: JobType | null;
  location: string;
  province?: string;
  region?: string;
  salary: string;
  required_skills: string[];
  work_schedule: any;
  required_years_of_experience: number;
  preferred_languages: string[];
  is_boosted: boolean;
  boost_expires_at: string | null;
  status: "active" | "paused" | "closed";
  // Enhanced matching fields
  salary_min?: number;
  salary_max?: number;
  salary_type?: string;
  location_coordinates?: string | null;
  expires_at?: string;
  created_at: string;
  updated_at: string;
};
