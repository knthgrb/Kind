"use server";

import {
  KindTaoOnboardingService,
  KindTaoOnboardingData,
} from "@/services/server/KindTaoOnboardingService";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";
import { revalidatePath } from "next/cache";

export async function finalizeKindTaoOnboarding(data: KindTaoOnboardingData) {
  try {
    logger.info("Starting finalizeKindTaoOnboarding with data:", {
      hasPersonalInfo: !!data.personalInfo,
      hasSkillsAvailability: !!data.skillsAvailability,
      workHistoryLength: data.workHistory?.length || 0,
    });

    const supabase = await createClient();

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      logger.error("Authentication error:", authError);
      return {
        success: false,
        error: "Not authenticated. Please sign in and try again.",
      };
    }

    logger.info("User authenticated successfully:", user.id);

    // Validate required data
    if (
      !data.personalInfo ||
      !data.skillsAvailability ||
      !data.jobPreferences
    ) {
      logger.error("Missing required data:", {
        personalInfo: !!data.personalInfo,
        skillsAvailability: !!data.skillsAvailability,
        jobPreferences: !!data.jobPreferences,
      });
      return {
        success: false,
        error:
          "Incomplete onboarding data. Please complete all required steps.",
      };
    }

    // Call the service to finalize onboarding
    logger.info("Calling KindTaoOnboardingService.finalizeOnboarding");
    const result = await KindTaoOnboardingService.finalizeOnboarding(
      user.id,
      data
    );

    logger.info("Service result:", result);

    return result;
  } catch (error) {
    logger.error("Unexpected error in finalizeKindTaoOnboarding:", error);
    logger.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
