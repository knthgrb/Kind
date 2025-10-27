"use server";

import { JobPreferencesService } from "@/services/server/JobPreferencesService";
import { UserService } from "@/services/server/UserService";
import { JobPreferences } from "@/services/server/JobPreferencesService";

export async function getJobPreferences(): Promise<{
  data: JobPreferences | null;
  error?: string;
}> {
  try {
    // Get current user
    const { data: user, error: userError } = await UserService.getCurrentUser();
    if (userError || !user) {
      return { data: null, error: "User not found" };
    }

    // Get job preferences
    return await JobPreferencesService.getJobPreferences(user.id);
  } catch (error) {
    console.error("Error getting job preferences:", error);
    return { data: null, error: "An unexpected error occurred" };
  }
}
