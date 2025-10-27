import { createClient } from "@/utils/supabase/server";
import { UserProfile } from "@/types/userProfile";

export class ProfileService {
  /**
   * Fetch user profile
   */
  static async fetchUserProfile(): Promise<UserProfile | null> {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Auth error:", userError);
      return null;
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error || !profile) {
      console.error("Error fetching profile:", error);
      return null;
    }

    return profile as UserProfile;
  }

  /**
   * Get complete KindTao profile with all related data
   */
  static async getCompleteKindTaoProfile(): Promise<UserProfile | null> {
    console.log("🔍 ProfileService.getCompleteKindTaoProfile() - Starting...");
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    console.log(
      "👤 Auth check - User:",
      user ? "Found" : "Not found",
      "Error:",
      userError
    );

    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return null;
    }

    console.log("✅ User authenticated, ID:", user.id);

    try {
      // Fetch user data from users table
      console.log("📋 Fetching user data from users table...");
      const { data: userData, error: userDataError } = await supabase
        .from("users")
        .select(
          `
          id,
          email,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          profile_image_url,
          barangay,
          municipality,
          province,
          zip_code,
          swipe_credits,
          boost_credits,
          status
        `
        )
        .eq("id", user.id)
        .single();

      if (userDataError) {
        console.error("❌ Error fetching user data:", userDataError);
        return null;
      }

      console.log("✅ User data fetched:", userData);

      // Fetch KindTao profile data
      console.log("🛠️ Fetching KindTao profile...");
      const { data: kindtaoProfile, error: kindtaoError } = await supabase
        .from("kindtaos")
        .select(
          `
          skills,
          languages,
          expected_salary_range,
          availability_schedule,
          highest_educational_attainment,
          rating,
          reviews,
          is_verified
        `
        )
        .eq("user_id", user.id)
        .single();

      console.log("🛠️ KindTao profile result:", {
        kindtaoProfile,
        kindtaoError,
      });

      // Fetch work experiences
      console.log("💼 Fetching work experiences...");
      const { data: workExperiences, error: workExpError } = await supabase
        .from("kindtao_work_experiences")
        .select(
          `
          *,
          attachments:kindtao_work_experience_attachments(*)
        `
        )
        .eq("kindtao_user_id", user.id)
        .order("start_date", { ascending: false });

      console.log("💼 Work experiences result:", {
        workExperiences,
        workExpError,
      });

      // Fetch verification requests
      console.log("📋 Fetching verification requests...");
      const { data: verificationRequests, error: verificationError } =
        await supabase
          .from("kindtao_verification_requests")
          .select("*")
          .eq("kindtao_user_id", user.id)
          .order("created_at", { ascending: false });

      console.log("📋 Verification requests result:", {
        verificationRequests,
        verificationError,
      });

      // Combine all data
      const completeProfile = {
        ...userData,
        kindtao_profile: kindtaoProfile || null,
        work_experiences: workExperiences || [],
        verification_requests: verificationRequests || [],
      };

      console.log("🎉 Complete profile assembled:", completeProfile);
      return completeProfile as unknown as UserProfile;
    } catch (error) {
      console.error("❌ Error fetching complete profile:", error);
      return null;
    }
  }

  /**
   * Fetch helper details for a specific user
   */
  static async fetchHelperDetails(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("users")
      .select(
        `
      helper_profiles!user_id (
        skills,
        experience_years,
        preferred_job_types
      ),
      helper_experiences (
        id, employer_name, job_title, responsibilities,
        start_date, end_date, is_current_job, achievements
      ),
      user_verifications!user_id (
        id, verification_status, barangay_clearance_url,
        clinic_certificate_url, valid_id_url, verified_at
      )
    `
      )
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching helper details:", error);
      return null;
    }

    return data;
  }

  /**
   * Get KindTao profile (combines base profile with helper details)
   */
  static async getTaoProfile() {
    const base = await this.fetchUserProfile();
    if (!base) return null;

    const helperDetails = await this.fetchHelperDetails(base.id);

    return { profile: base, helperDetails };
  }
}
