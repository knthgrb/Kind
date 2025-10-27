"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export async function updateProfile(data: {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  barangay: string;
  municipality: string;
  province: string;
  zip_code: string;
  skills: string[];
  languages: string[];
  expected_salary_range: string;
  highest_educational_attainment: string;
  availability_schedule: any;
}) {
  try {
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

    logger.info("Updating profile for user:", user.id);

    // Prepare data for parallel updates
    const usersUpdateData = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      barangay: data.barangay,
      municipality: data.municipality,
      province: data.province,
      zip_code: data.zip_code ? Number(data.zip_code) : null,
      updated_at: new Date().toISOString(),
    };

    const kindtaoUpdateData = {
      user_id: user.id,
      skills: data.skills,
      languages: data.languages,
      expected_salary_range: data.expected_salary_range,
      highest_educational_attainment: data.highest_educational_attainment,
      availability_schedule: data.availability_schedule,
    };

    // Execute parallel database operations
    const [usersResult, kindtaoResult] = await Promise.all([
      // Update users table
      supabase.from("users").update(usersUpdateData).eq("id", user.id),

      // Upsert kindtaos table
      supabase
        .from("kindtaos")
        .upsert(kindtaoUpdateData, { onConflict: "user_id" }),
    ]);

    // Check for errors
    if (usersResult.error) {
      logger.error("Error updating users table:", usersResult.error);
      return { success: false, error: usersResult.error.message };
    }

    if (kindtaoResult.error) {
      logger.error("Error updating kindtaos table:", kindtaoResult.error);
      return { success: false, error: kindtaoResult.error.message };
    }

    logger.info("Profile updated successfully for user:", user.id);
    return { success: true };
  } catch (error) {
    logger.error("Unexpected error updating profile:", error);
    return { success: false, error: "Unexpected error occurred" };
  }
}
