"use server";

import { createClient } from "@/utils/supabase/server";

export interface KindTaoUserOption {
  id: string;
  name: string;
  email: string;
}

export async function getKindTaoUsersForJob(
  jobTitle: string
): Promise<{
  success: boolean;
  users: KindTaoUserOption[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        users: [],
        error: "Not authenticated",
      };
    }

    // Step 1: Get all job posts with this job title for this user
    const { data: jobPosts, error: jobError } = await supabase
      .from("job_posts")
      .select("id, kindbossing_user_id")
      .eq("kindbossing_user_id", user.id)
      .eq("job_title", jobTitle)
      .eq("status", "active");

    if (jobError) {
      console.error("Error fetching job posts:", jobError);
      return {
        success: false,
        users: [],
        error: "Failed to fetch job posts",
      };
    }

    if (!jobPosts || jobPosts.length === 0) {
      console.log("No job posts found for title:", jobTitle);
      return {
        success: true,
        users: [],
      };
    }

    const jobPostIds = jobPosts.map((jp) => jp.id);
    console.log("Job post IDs for title:", jobTitle, ":", jobPostIds);

    // Step 2: Query matches table for these job_post_ids
    const { data: matches, error: matchesError } = await supabase
      .from("matches")
      .select("kindtao_user_id")
      .eq("kindbossing_user_id", user.id)
      .in("job_post_id", jobPostIds);

    if (matchesError) {
      console.error("Error fetching matches:", matchesError);
      return {
        success: false,
        users: [],
        error: "Failed to fetch matches",
      };
    }

    console.log("Found matches:", matches?.length || 0, "for job post IDs:", jobPostIds);

    if (!matches || matches.length === 0) {
      return {
        success: true,
        users: [],
      };
    }

    // Step 3: Get unique kindtao_user_ids from matches
    const kindtaoUserIds = [
      ...new Set(matches.map((m) => m.kindtao_user_id).filter(Boolean)),
    ];
    console.log("Unique kindtao user IDs:", kindtaoUserIds.length);

    if (kindtaoUserIds.length === 0) {
      return {
        success: true,
        users: [],
      };
    }

    // Step 4: Check which users are already employees (exclude them)
    const { data: existingEmployees, error: employeesError } = await supabase
      .from("employees")
      .select("kindtao_user_id")
      .eq("kindbossing_user_id", user.id)
      .in("kindtao_user_id", kindtaoUserIds)
      .in("job_post_id", jobPostIds)
      .eq("status", "active");

    if (employeesError) {
      console.error("Error checking existing employees:", employeesError);
    }

    const existingEmployeeIds = new Set<string>();
    existingEmployees?.forEach((emp: any) => {
      existingEmployeeIds.add(emp.kindtao_user_id);
    });

    // Filter out existing employees
    const availableUserIds = kindtaoUserIds.filter(
      (id) => !existingEmployeeIds.has(id)
    );

    console.log("Available user IDs after filtering employees:", availableUserIds.length);

    if (availableUserIds.length === 0) {
      return {
        success: true,
        users: [],
      };
    }

    // Step 5: Query users table to get kindtao user details
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, first_name, last_name, email")
      .in("id", availableUserIds)
      .eq("role", "kindtao");

    if (usersError) {
      console.error("Error fetching users:", usersError);
      return {
        success: false,
        users: [],
        error: "Failed to fetch users",
      };
    }

    console.log("Found users:", users?.length || 0);

    // Transform to options
    const userOptions: KindTaoUserOption[] = (users || []).map((u) => ({
      id: u.id,
      name: `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email || "Unknown",
      email: u.email || "",
    }));

    return {
      success: true,
      users: userOptions,
    };
  } catch (error) {
    console.error("Error in getKindTaoUsersForJob:", error);
    return {
      success: false,
      users: [],
      error: "An unexpected error occurred",
    };
  }
}

