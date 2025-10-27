import { createClient } from "@/utils/supabase/client";
import { MatchService } from "./MatchService";
import { NotificationService } from "./NotificationService";

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: "pending" | "approved" | "rejected";
  applied_at: string;
  reviewed_at?: string;
  message?: string;
}

export interface ApplicationResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}

export const ApplicationService = {
  /**
   * Apply for a job (client-side)
   */
  async applyForJob(
    jobId: string,
    applicantId: string,
    message?: string
  ): Promise<ApplicationResult> {
    const supabase = createClient();

    try {
      // Check if already applied
      const hasApplied = await this.hasAppliedForJob(jobId, applicantId);
      if (hasApplied) {
        return {
          success: false,
          error: "You have already applied for this job",
        };
      }

      // Create application in database
      const { data, error } = await supabase
        .from("job_applications")
        .insert({
          job_post_id: jobId,
          kindtao_user_id: applicantId,
          status: "pending",
          applied_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating application:", error);
        return {
          success: false,
          error: "Failed to submit application",
        };
      }

      // Send notification to employer
      console.log(`Notification: User ${applicantId} applied to job ${jobId}`);

      return {
        success: true,
        applicationId: data.id,
      };
    } catch (error) {
      console.error("Error applying for job:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Get user's applications (client-side)
   */
  async getUserApplications(userId: string): Promise<JobApplication[]> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("kindtao_user_id", userId)
        .order("applied_at", { ascending: false });

      return (
        data?.map((app) => ({
          id: app.id,
          job_id: app.job_post_id,
          applicant_id: app.kindtao_user_id,
          status: app.status,
          applied_at: app.applied_at,
          reviewed_at: app.updated_at,
          message: app.message,
        })) || []
      );
    } catch (error) {
      console.error("Error fetching applications:", error);
      return [];
    }
  },

  /**
   * Check if user has applied for a specific job
   */
  async hasAppliedForJob(jobId: string, userId: string): Promise<boolean> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_post_id", jobId)
        .eq("kindtao_user_id", userId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking application status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking application status:", error);
      return false;
    }
  },

  /**
   * Get application status for a job
   */
  async getApplicationStatus(
    jobId: string,
    userId: string
  ): Promise<JobApplication | null> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("*")
        .eq("job_post_id", jobId)
        .eq("kindtao_user_id", userId)
        .single();

      if (error && error.code === "PGRST116") {
        return null; // No application found
      }

      if (error) {
        console.error("Error fetching application status:", error);
        return null;
      }

      return {
        id: data.id,
        job_id: data.job_post_id,
        applicant_id: data.kindtao_user_id,
        status: data.status,
        applied_at: data.applied_at,
        reviewed_at: data.updated_at,
        message: data.message,
      };
    } catch (error) {
      console.error("Error fetching application status:", error);
      return null;
    }
  },

  /**
   * Approve an application and create a match (client-side)
   * This would typically be called by the job poster (kindbossing user)
   */
  async approveApplication(
    applicationId: string,
    jobId: string,
    applicantId: string,
    kindbossingId: string
  ): Promise<ApplicationResult> {
    const supabase = createClient();

    try {
      // Update application status to approved
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          status: "approved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) {
        console.error("Error updating application:", updateError);
        return {
          success: false,
          error: "Failed to update application status",
        };
      }

      // Create a match
      console.log("Creating match with parameters:", {
        jobId,
        kindbossingId,
        applicantId,
      });

      const matchResult = await MatchService.createMatch(
        jobId,
        kindbossingId,
        applicantId
      );

      if (!matchResult.success) {
        console.error("Error creating match:", matchResult.error);
        return {
          success: false,
          error: matchResult.error || "Failed to create match",
        };
      }

      return {
        success: true,
        applicationId,
      };
    } catch (error) {
      console.error("Error approving application:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Reject an application (client-side)
   */
  async rejectApplication(
    applicationId: string,
    kindbossingId: string
  ): Promise<ApplicationResult> {
    const supabase = createClient();

    try {
      // Update application status to rejected
      const { error: updateError } = await supabase
        .from("job_applications")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId);

      if (updateError) {
        console.error("Error updating application:", updateError);
        return {
          success: false,
          error: "Failed to update application status",
        };
      }

      return {
        success: true,
        applicationId,
      };
    } catch (error) {
      console.error("Error rejecting application:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },
};
