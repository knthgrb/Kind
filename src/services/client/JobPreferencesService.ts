import { logger } from "@/utils/logger";
import { getJobPreferences } from "@/actions/job-preferences/get-job-preferences";
import { updateJobPreferences } from "@/actions/job-preferences/update-job-preferences";

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
   * Get job preferences for the current user
   * This now calls the server action directly
   */
  static async getJobPreferences(): Promise<{
    data: JobPreferences | null;
    error?: string;
  }> {
    try {
      return await getJobPreferences();
    } catch (error) {
      logger.error("Error fetching job preferences:", error);
      return { data: null, error: "Network error occurred" };
    }
  }

  /**
   * Update job preferences for the current user
   * This now uses server action
   */
  static async updateJobPreferences(
    preferences: JobPreferences
  ): Promise<{ success: boolean; error?: string }> {
    try {
      return await updateJobPreferences(preferences);
    } catch (error) {
      logger.error("Error updating job preferences:", error);
      return { success: false, error: "Network error occurred" };
    }
  }
}
