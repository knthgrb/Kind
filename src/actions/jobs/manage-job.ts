"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export interface JobManagementResult {
  success: boolean;
  error?: string;
}

/**
 * Update job status (pause, close, activate)
 */
export async function updateJobStatus(
  jobId: string,
  status: "active" | "paused" | "closed" | "reopen"
): Promise<JobManagementResult> {
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
    const { data: job, error: jobError } = await supabase
      .from("job_posts")
      .select("kindbossing_user_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    if (job.kindbossing_user_id !== user.id) {
      return {
        success: false,
        error: "Unauthorized to modify this job",
      };
    }

    // Update job status
    const actualStatus = status === "reopen" ? "active" : status;
    const { error: updateError } = await supabase
      .from("job_posts")
      .update({
        status: actualStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    if (updateError) {
      logger.error("Error updating job status:", updateError);
      return {
        success: false,
        error: "Failed to update job status",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error("Error in updateJobStatus:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

/**
 * Delete job post permanently
 */
export async function deleteJobPost(
  jobId: string
): Promise<JobManagementResult> {
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
    const { data: job, error: jobError } = await supabase
      .from("job_posts")
      .select("kindbossing_user_id")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return {
        success: false,
        error: "Job not found",
      };
    }

    if (job.kindbossing_user_id !== user.id) {
      return {
        success: false,
        error: "Unauthorized to delete this job",
      };
    }

    // Delete job post (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from("job_posts")
      .delete()
      .eq("id", jobId);

    if (deleteError) {
      logger.error("Error deleting job:", deleteError);
      return {
        success: false,
        error: "Failed to delete job",
      };
    }

    return { success: true };
  } catch (error) {
    logger.error("Error in deleteJobPost:", error);
    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}
