import { createClient } from "@/utils/supabase/client";

export interface SwipeLimitStatus {
  remainingSwipes: number;
  dailyLimit: number;
  canSwipe: boolean;
}

export interface SwipeResult {
  canSwipe: boolean;
  remainingSwipes: number;
  dailyLimit: number;
}

export const SwipeService = {
  /**
   * Get user's current swipe credits status (client-side)
   */
  async getSwipeLimitStatus(userId: string): Promise<SwipeLimitStatus> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("users")
      .select("swipe_credits")
      .eq("id", userId)
      .single();

    if (error || !data) {
      console.error("Error fetching swipe credits:", error);
      return { remainingSwipes: 0, dailyLimit: 10, canSwipe: false };
    }

    const swipeCredits = data.swipe_credits || 0;
    const isUnlimited = swipeCredits >= 999999;
    const remainingSwipes = isUnlimited ? 999999 : Math.max(0, swipeCredits);

    return {
      remainingSwipes,
      dailyLimit: isUnlimited ? 999999 : 10, // Unlimited if they have unlimited swipes
      canSwipe: isUnlimited || remainingSwipes > 0,
    };
  },

  /**
   * Consume a swipe credit (client-side)
   */
  async consumeSwipeCredit(userId: string): Promise<SwipeResult> {
    const supabase = createClient();

    // First check current status
    const status = await this.getSwipeLimitStatus(userId);

    if (!status.canSwipe) {
      return {
        canSwipe: false,
        remainingSwipes: status.remainingSwipes,
        dailyLimit: status.dailyLimit,
      };
    }

    // Consume a credit (only if not unlimited)
    if (status.remainingSwipes < 999999) {
      const { error } = await supabase
        .from("users")
        .update({
          swipe_credits: status.remainingSwipes - 1,
        })
        .eq("id", userId);

      if (error) {
        console.error("Error consuming swipe credit:", error);
        return {
          canSwipe: false,
          remainingSwipes: status.remainingSwipes,
          dailyLimit: status.dailyLimit,
        };
      }
    }

    return {
      canSwipe: true,
      remainingSwipes:
        status.remainingSwipes >= 999999 ? 999999 : status.remainingSwipes - 1,
      dailyLimit: status.dailyLimit,
    };
  },

  /**
   * Record a swipe action (client-side)
   * Records the interaction in kindtao_job_interactions table
   * If record exists, updates the action; otherwise creates new record
   */
  async recordSwipeClient(
    userId: string,
    jobId: string,
    action: "apply" | "skip"
  ): Promise<boolean> {
    const supabase = createClient();

    try {
      // First check if a record already exists
      const { data: existingRecord, error: checkError } = await supabase
        .from("kindtao_job_interactions")
        .select("id")
        .eq("kindtao_user_id", userId)
        .eq("job_post_id", jobId)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        console.error("Error checking existing swipe record:", checkError);
        return false;
      }

      if (existingRecord) {
        // Update existing record
        const { error: updateError } = await supabase
          .from("kindtao_job_interactions")
          .update({
            action: action,
          })
          .eq("id", existingRecord.id);

        if (updateError) {
          console.error("Error updating swipe record:", updateError);
          return false;
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from("kindtao_job_interactions")
          .insert({
            kindtao_user_id: userId,
            job_post_id: jobId,
            action: action,
          });

        if (insertError) {
          console.error("Error creating swipe record:", insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error recording swipe:", error);
      return false;
    }
  },

  /**
   * Check if user has already swiped on a job
   */
  async hasSwipedOnJob(userId: string, jobId: string): Promise<boolean> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("kindtao_job_interactions")
        .select("id")
        .eq("kindtao_user_id", userId)
        .eq("job_post_id", jobId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error checking swipe status:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking swipe status:", error);
      return false;
    }
  },

  /**
   * Get jobs that user has already swiped on
   */
  async getSwipedJobIds(userId: string): Promise<string[]> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("kindtao_job_interactions")
        .select("job_post_id")
        .eq("kindtao_user_id", userId);

      if (error) {
        console.error("Error fetching swiped jobs:", error);
        return [];
      }

      return data?.map((item) => item.job_post_id) || [];
    } catch (error) {
      console.error("Error fetching swiped jobs:", error);
      return [];
    }
  },
};
