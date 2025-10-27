import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export type JobPreferences = {
  desiredJobs: string[];
  desiredLocations: string[];
  desiredJobTypes: string[];
  salaryRange: {
    min: number;
    max: number;
    salaryType: "daily" | "monthly" | "hourly" | "one-time";
  };
  preferredLanguages: string[];
  preferredWorkRadiusKm: number;
};

export class JobPreferencesService {
  /**
   * Get job preferences for a user
   */
  static async getJobPreferences(
    userId: string
  ): Promise<{ data: JobPreferences | null; error?: string }> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("kindtao_job_preferences")
        .select("*")
        .eq("kindtao_user_id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // No rows found - return null data
          return { data: null };
        }
        logger.error("Error fetching job preferences:", error);
        return { data: null, error: error.message };
      }

      if (!data) {
        return { data: null };
      }

      // Transform database data to our interface
      const preferences: JobPreferences = {
        desiredJobs: data.desired_jobs || [],
        desiredLocations: data.desired_locations || [],
        desiredJobTypes: data.desired_job_types || [],
        salaryRange: {
          min: data.salary_range_min || 0,
          max: data.salary_range_max || 0,
          salaryType: data.salary_type || "daily",
        },
        preferredLanguages: data.desired_languages || [],
        preferredWorkRadiusKm: data.desired_job_location_radius || 10,
      };

      return { data: preferences };
    } catch (error) {
      logger.error("Unexpected error fetching job preferences:", error);
      return { data: null, error: "Unexpected error occurred" };
    }
  }

  /**
   * Update job preferences for a user
   */
  static async updateJobPreferences(
    userId: string,
    preferences: JobPreferences
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      const { error } = await supabase.from("kindtao_job_preferences").upsert({
        kindtao_user_id: userId,
        desired_jobs: preferences.desiredJobs,
        desired_locations: preferences.desiredLocations,
        desired_job_types: preferences.desiredJobTypes,
        salary_range_min: preferences.salaryRange.min || null,
        salary_range_max: preferences.salaryRange.max || null,
        salary_type: preferences.salaryRange.salaryType || null,
        desired_languages: preferences.preferredLanguages,
        desired_job_location_radius: preferences.preferredWorkRadiusKm || null,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        logger.error("Error updating job preferences:", error);
        return { success: false, error: error.message };
      }

      logger.info("Job preferences updated successfully for user:", userId);
      return { success: true };
    } catch (error) {
      logger.error("Unexpected error updating job preferences:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }
}
