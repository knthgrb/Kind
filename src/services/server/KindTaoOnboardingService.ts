import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export type KindTaoPersonalInfo = {
  day: string;
  month: string;
  year: string;
  gender: string;
  location: string;
  barangay: string;
  municipality: string;
  province: string;
  zipCode?: string;
  lat?: string;
  long?: string;
  phone?: string;
  highestEducationalAttainment?: string;
};

export type KindTaoSkillsAvailability = {
  skills: string[];
  availabilitySchedule: Record<
    string,
    { available: boolean; timeSlot: string; morning: boolean; evening: boolean }
  >;
  languages?: string[];
};

export type KindTaoWorkEntry = {
  jobTitle: string;
  company: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  description?: string;
  isCurrentJob: boolean;
  location?: string;
  skillsUsed?: string[];
  notes?: string;
};

export type KindTaoJobPreferences = {
  desiredJobs: string[];
  desiredLocations: string[];
  desiredJobTypes: string[];
  salaryRange: {
    min: number;
    max: number;
    salaryType: string;
  };
  preferredLanguages: string[];
  preferredWorkRadiusKm: number;
};

export type KindTaoOnboardingData = {
  personalInfo: KindTaoPersonalInfo;
  skillsAvailability: KindTaoSkillsAvailability;
  jobPreferences: KindTaoJobPreferences;
  workHistory: KindTaoWorkEntry[];
};

export class KindTaoOnboardingService {
  /**
   * Finalize KindTao onboarding by saving all data to the database
   */
  static async finalizeOnboarding(
    userId: string,
    data: KindTaoOnboardingData
  ): Promise<{ success: boolean; error?: string }> {
    logger.info("KindTaoOnboardingService.finalizeOnboarding called with:", {
      userId,
      hasPersonalInfo: !!data.personalInfo,
      hasSkillsAvailability: !!data.skillsAvailability,
      workHistoryLength: data.workHistory?.length || 0,
    });

    const supabase = await createClient();

    try {
      const { personalInfo, skillsAvailability, jobPreferences, workHistory } =
        data;

      // Get coordinates from address for location_coordinates POINT
      let locationCoordinates: string | null = null;

      try {
        const completeAddressForSearch = `${personalInfo.barangay}, ${personalInfo.municipality}, ${personalInfo.province} ${personalInfo.zipCode}, Philippines`;
        const response = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(
            completeAddressForSearch
          )}&api_key=${process.env.NEXT_PUBLIC_GEO_CODE_API_KEY}`
        );

        if (response.ok) {
          const geocodeData = await response.json();
          if (Array.isArray(geocodeData) && geocodeData.length > 0) {
            const { lat: fetchedLat, lon: fetchedLon } = geocodeData[0];
            const lat = Number(fetchedLat);
            const lng = Number(fetchedLon);
            // Create POINT format: (longitude, latitude)
            locationCoordinates = `(${lng},${lat})`;
            logger.info("Successfully geocoded address:", {
              lat,
              lng,
              locationCoordinates,
            });
          }
        } else {
          logger.warn("Geocoding API request failed:", response.status);
        }
      } catch (geocodeError) {
        logger.error("Error during geocoding:", geocodeError);
        // Continue without coordinates - don't fail the entire onboarding
      }

      // Build date of birth as ISO (YYYY-MM-DD)
      const dobYear = personalInfo.year?.padStart(4, "0");
      const dobMonth = String(
        new Date(`${personalInfo.month} 1, 2000`).getMonth() + 1
      ).padStart(2, "0");
      const dobDay = String(personalInfo.day).padStart(2, "0");
      const dateOfBirth = `${dobYear}-${dobMonth}-${dobDay}`;

      // Update users table
      logger.info("Updating users table for user:", userId);
      const usersUpdate = await supabase
        .from("users")
        .update({
          gender: personalInfo.gender,
          date_of_birth: dateOfBirth,
          barangay: personalInfo.barangay,
          municipality: personalInfo.municipality,
          province: personalInfo.province,
          zip_code: personalInfo.zipCode ? Number(personalInfo.zipCode) : null,
          location_coordinates: locationCoordinates,
          phone: personalInfo.phone ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (usersUpdate.error) {
        logger.error("Error updating users table:", usersUpdate.error);
        return { success: false, error: usersUpdate.error.message };
      }
      logger.info("Users table updated successfully");

      // Upsert kindtaos profile
      logger.info("Upserting kindtaos profile for user:", userId);
      const kindtaoUpsert = await supabase.from("kindtaos").upsert(
        {
          user_id: userId,
          skills: skillsAvailability.skills,
          availability_schedule: skillsAvailability.availabilitySchedule,
          languages: skillsAvailability.languages ?? null,
          highest_educational_attainment:
            personalInfo.highestEducationalAttainment ?? null,
        },
        { onConflict: "user_id" }
      );

      if (kindtaoUpsert.error) {
        logger.error("Error upserting kindtaos profile:", kindtaoUpsert.error);
        return { success: false, error: kindtaoUpsert.error.message };
      }
      logger.info("Kindtaos profile upserted successfully");

      // Save job preferences
      if (jobPreferences) {
        logger.info("Saving job preferences for user:", userId);
        const jobPreferencesUpsert = await supabase
          .from("kindtao_job_preferences")
          .upsert({
            kindtao_user_id: userId,
            desired_jobs: jobPreferences.desiredJobs,
            desired_locations: jobPreferences.desiredLocations,
            desired_job_types: jobPreferences.desiredJobTypes,
            salary_range_min: jobPreferences.salaryRange.min || null,
            salary_range_max: jobPreferences.salaryRange.max || null,
            salary_type: jobPreferences.salaryRange.salaryType || null,
            desired_languages: jobPreferences.preferredLanguages || [],
            desired_job_location_radius:
              jobPreferences.preferredWorkRadiusKm || null,
            updated_at: new Date().toISOString(),
          });

        if (jobPreferencesUpsert.error) {
          logger.error(
            "Error upserting job preferences:",
            jobPreferencesUpsert.error
          );
          return { success: false, error: jobPreferencesUpsert.error.message };
        }
        logger.info("Job preferences saved successfully");
      } else {
        logger.info("No job preferences provided for user:", userId);
      }

      // Insert work experiences only if meaningful work experience data exists
      if (workHistory && workHistory.length > 0) {
        // Filter out empty or incomplete work entries
        const validWorkHistory = workHistory.filter(
          (e) => e.jobTitle && e.company && e.startYear && e.startMonth
        );

        if (validWorkHistory.length > 0) {
          logger.info(
            `Inserting ${validWorkHistory.length} work experiences for user:`,
            userId
          );

          const toInsert = validWorkHistory.map((e) => ({
            kindtao_user_id: userId,
            employer: e.company || null,
            job_title: e.jobTitle || null,
            is_current_job: e.isCurrentJob || false,
            start_date: `${e.startYear}-${String(
              new Date(`${e.startMonth} 1, 2000`).getMonth() + 1
            ).padStart(2, "0")}-01`,
            end_date:
              e.endYear && e.endMonth && !e.isCurrentJob
                ? `${e.endYear}-${String(
                    new Date(`${e.endMonth} 1, 2000`).getMonth() + 1
                  ).padStart(2, "0")}-01`
                : null,
            location: e.location || null,
            skills_used: e.skillsUsed || null,
            notes: e.notes || e.description || null,
          }));

          const insertRes = await supabase
            .from("kindtao_work_experiences")
            .insert(toInsert);

          if (insertRes.error) {
            logger.error("Error inserting work experiences:", insertRes.error);
            return { success: false, error: insertRes.error.message };
          }

          logger.info("Work experiences inserted successfully");
        } else {
          logger.info("No valid work experiences to insert for user:", userId);
        }
      } else {
        logger.info("No work history provided for user:", userId);
      }

      // Set has_finished_onboarding to true in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          has_completed_onboarding: true,
        },
      });

      if (updateError) {
        logger.error("Error updating user metadata:", updateError);
        return { success: false, error: updateError.message };
      }

      logger.info(
        "KindTao onboarding finalized successfully for user:",
        userId
      );

      return { success: true };
    } catch (error) {
      logger.error("Unexpected error finalizing KindTao onboarding:", error);
      return { success: false, error: "Unexpected error occurred" };
    }
  }
}
