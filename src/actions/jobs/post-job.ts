"use server";

import { createClient } from "@/utils/supabase/server";
import { JobPostInput } from "@/types/jobPosts";

export async function postJob(job: JobPostInput) {
  const supabase = await createClient();

  const payload = {
    kindbossing_user_id: job.kindbossing_user_id,
    job_title: job.job_title,
    job_description: job.job_description,
    location: job.location,
    province: job.province,
    region: job.region,
    salary: job.salary,
    job_type: job.job_type,
    required_skills: job.required_skills,
    work_schedule: job.work_schedule,
    required_years_of_experience: job.required_years_of_experience,
    preferred_languages: job.preferred_languages,
    is_boosted: job.is_boosted,
    boost_expires_at: job.boost_expires_at,
    status: job.status,
    // New fields for enhanced matching
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    salary_type: job.salary_type,
    location_coordinates: job.location_coordinates,
    expires_at: job.expires_at,
  };

  const { data, error } = await supabase
    .from("job_posts")
    .insert([payload])
    .select("*")
    .single();

  if (error) {
    console.error("Error posting job:", error.message);
    throw error;
  }

  return data;
}
