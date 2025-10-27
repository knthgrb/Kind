"use server";

import { createClient } from "@/utils/supabase/server";
import { logger } from "@/utils/logger";

export async function getSubscription(): Promise<{
  data: any | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { data: null, error: "Unauthorized" };
    }

    // Fetch subscription from subscriptions table
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No subscription found - return null
        return { data: null };
      }
      logger.error("Error fetching subscription:", error);
      return { data: null, error: "Failed to fetch subscription" };
    }

    return { data: subscription };
  } catch (error) {
    logger.error("Unexpected error fetching subscription:", error);
    return { data: null, error: "Internal server error" };
  }
}
