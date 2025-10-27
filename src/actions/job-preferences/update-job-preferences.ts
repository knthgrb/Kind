"use server";

import { JobPreferencesService } from "@/services/server/JobPreferencesService";
import { UserService } from "@/services/server/UserService";
import { JobPreferences } from "@/services/server/JobPreferencesService";

export async function updateJobPreferences(
  preferences: JobPreferences
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current user
    const { data: user, error: userError } = await UserService.getCurrentUser();
    if (userError || !user) {
      return { success: false, error: "User not found" };
    }

    // Update job preferences
    return await JobPreferencesService.updateJobPreferences(
      user.id,
      preferences
    );
  } catch (error) {
    console.error("Error updating job preferences:", error);
    return { success: false, error: "An unexpected error occurred" };
  }
}
