import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import { createClient } from "@/utils/supabase/client";

export function usePendingApplications() {
  const { user } = useAuthStore();
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPendingApplications = async () => {
      if (!user?.id) {
        setPendingCount(0);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const supabase = createClient();

        // Get all job IDs for this user
        const { data: userJobs } = await supabase
          .from("job_posts")
          .select("id")
          .eq("kindbossing_user_id", user.id);

        if (!userJobs || userJobs.length === 0) {
          setPendingCount(0);
          return;
        }

        const jobIds = userJobs.map((job) => job.id);

        // Get count of pending applications for these jobs
        const { count, error } = await supabase
          .from("job_applications")
          .select("*", { count: "exact", head: true })
          .in("job_post_id", jobIds)
          .eq("status", "pending");

        if (error) {
          console.error("Error fetching pending applications count:", error);
          setPendingCount(0);
        } else {
          setPendingCount(count || 0);
        }
      } catch (error) {
        console.error("Error fetching pending applications count:", error);
        setPendingCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingApplications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchPendingApplications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  return { pendingCount, isLoading };
}
