"use server";

import { createClient } from "@/utils/supabase/server";
import { JobPostInput } from "@/types/jobPosts";
import { logger } from "@/utils/logger";

export async function updateJob(jobId: string, job: JobPostInput) {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: "Not authenticated",
      };
    }

    // Verify job belongs to user
    const { data: existingJob, error: jobError } = await supabase
      .from("job_posts")
      .select("kindbossing_user_id")
      .eq("id", jobId)
      .single();

    if (jobError || !existingJob) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    if (existingJob.kindbossing_user_id !== user.id) {
      return {
        success: false,
        error: "Unauthorized to modify this job",
      };
    }

    const payload = {
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
      // Enhanced matching fields
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      salary_type: job.salary_type,
      location_coordinates: job.location_coordinates,
      expires_at: job.expires_at,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("job_posts")
      .update(payload)
      .eq("id", jobId)
      .select("*")
      .single();

    if (error) {
      logger.error("Error updating job:", error);
      return {
        success: false,
        error: "Failed to update job",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    logger.error("Unexpected error in updateJob:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
