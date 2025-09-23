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
      .select(
        `
      id, email, first_name, last_name, phone, profile_image_url,
      address, city, province, postal_code
    `
      )
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

    console.log("👤 Auth check - User:", user ? "Found" : "Not found", "Error:", userError);

    if (userError || !user) {
      console.error("❌ Auth error:", userError);
      return null;
    }

    console.log("✅ User authenticated, ID:", user.id);

    try {
      // Use auth user data directly since users table doesn't exist
      console.log("📋 Using auth user data directly...");
      const userData = {
        id: user.id,
        email: user.email || "",
        first_name: user.user_metadata?.first_name || "",
        last_name: user.user_metadata?.last_name || "",
        phone: user.user_metadata?.phone || "",
        profile_image_url: user.user_metadata?.profile_image_url || null,
        address: user.user_metadata?.full_address || null,
        city: user.user_metadata?.city || null,
        province: user.user_metadata?.province || null,
        postal_code: user.user_metadata?.postal_code || null,
      };

      console.log("✅ Base user profile from auth:", userData);

      // Fetch helper profile
      console.log("🛠️ Fetching helper profile...");
      const { data: helperProfile, error: helperError } = await supabase
        .from("helper_profiles")
        .select(`
          skills,
          preferred_job_types,
          experience_years,
          languages_spoken,
          salary_expectation_min,
          salary_expectation_max,
          availability_schedule,
          is_available_live_in,
          preferred_work_radius,
          bio,
          work_experience,
          educational_background,
          certifications,
          location_preference
        `)
        .eq("user_id", user.id)
        .single();

      console.log("🛠️ Helper profile result:", { helperProfile, helperError });

      // Fetch helper experiences
      console.log("💼 Fetching helper experiences...");
      const { data: experiences, error: expError } = await supabase
        .from("helper_experiences")
        .select(`
          id,
          employer_name,
          job_title,
          responsibilities,
          start_date,
          end_date,
          is_current_job,
          achievements
        `)
        .eq("user_id", user.id);

      console.log("💼 Experiences result:", { experiences, expError });

      // Fetch user verifications
      console.log("✅ Fetching user verifications...");
      const { data: verifications, error: verError } = await supabase
        .from("user_verifications")
        .select(`
          id,
          verification_status,
          barangay_clearance_url,
          clinic_certificate_url,
          valid_id_url,
          verified_at
        `)
        .eq("user_id", user.id)
        .single();

      console.log("✅ Verifications result:", { verifications, verError });

      // Fetch user documents
      console.log("📄 Fetching user documents...");
      const { data: documents, error: docError } = await supabase
        .from("user_documents")
        .select(`
          id,
          document_type,
          file_path,
          file_name,
          uploaded_at
        `)
        .eq("user_id", user.id);

      console.log("📄 Documents result:", { documents, docError });

      // Combine all data
      const completeProfile = {
        ...userData,
        helper_profiles: helperProfile || null,
        helper_experiences: experiences || [],
        user_verifications: verifications || null,
        user_documents: documents || []
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
