"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export interface DashboardStats {
  totalJobPosts: number;
  pendingApplications: number;
  activeMatches: number;
  activeConversations: number;
}

export async function getKindBossingDashboardStats(): Promise<{
  success: boolean;
  data: DashboardStats | null;
  error?: string;
}> {
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
        data: null,
        error: "Not authenticated",
      };
    }

    const userId = user.id;

    // Fetch all stats in parallel for better performance
    const [jobsResult, applicationsResult, matchesResult, conversationsResult] =
      await Promise.all([
        // Get total job posts by this user
        supabase
          .from("job_posts")
          .select("id", { count: "exact", head: true })
          .eq("kindbossing_user_id", userId)
          .eq("status", "active"),

        // Get pending applications count
        supabase
          .from("job_applications")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending")
          .then(async ({ data: apps, error: appsError }) => {
            // Get user's job posts to filter applications
            const { data: myJobs } = await supabase
              .from("job_posts")
              .select("id")
              .eq("kindbossing_user_id", userId);

            if (appsError || !myJobs) {
              return { count: 0 };
            }

            const jobIds = myJobs.map((job) => job.id);
            if (jobIds.length === 0) {
              return { count: 0 };
            }

            const { count } = await supabase
              .from("job_applications")
              .select("id", { count: "exact", head: true })
              .in("job_post_id", jobIds)
              .eq("status", "pending");

            return { count };
          }),

        // Get active matches count
        supabase
          .from("matches")
          .select("id", { count: "exact", head: true })
          .eq("kindbossing_user_id", userId)
          .eq("is_active", true),

        // Get active conversations count
        supabase
          .from("conversations")
          .select("id", { count: "exact", head: true })
          .eq("kindbossing_user_id", userId)
          .eq("status", "active"),
      ]);

    const stats: DashboardStats = {
      totalJobPosts: jobsResult.count || 0,
      pendingApplications: applicationsResult.count || 0,
      activeMatches: matchesResult.count || 0,
      activeConversations: conversationsResult.count || 0,
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    logger.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      data: null,
      error: "Failed to fetch dashboard stats",
    };
  }
}
