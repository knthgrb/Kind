import { createClient } from "@/utils/supabase/client";
import { NotificationService } from "./NotificationService";

export interface Match {
  id: string;
  kindbossing_user_id: string;
  kindtao_user_id: string;
  job_post_id: string;
  matched_at: string;
  is_active: boolean;
  created_at: string;
}

export interface MatchResult {
  success: boolean;
  matchId?: string;
  error?: string;
}

export const MatchService = {
  /**
   * Create a match when job application is approved (client-side)
   */
  async createMatch(
    jobId: string,
    kindbossingId: string,
    kindtaoId: string
  ): Promise<MatchResult> {
    const supabase = createClient();

    try {
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id")
        .eq("kindbossing_user_id", kindbossingId)
        .eq("kindtao_user_id", kindtaoId)
        .eq("job_post_id", jobId)
        .single();

      if (existingMatch) {
        return {
          success: false,
          error: "Match already exists",
        };
      }

      // Create new match in database
      console.log("Inserting match with data:", {
        kindbossing_user_id: kindbossingId,
        kindtao_user_id: kindtaoId,
        job_post_id: jobId,
        is_active: true,
      });

      const { data, error } = await supabase
        .from("matches")
        .insert({
          kindbossing_user_id: kindbossingId,
          kindtao_user_id: kindtaoId,
          job_post_id: jobId,
          is_active: true,
        })
        .select("id")
        .single();

      if (error) {
        console.error("Error creating match:", error);
        console.error("Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        console.error("Match data being inserted:", {
          kindbossing_user_id: kindbossingId,
          kindtao_user_id: kindtaoId,
          job_post_id: jobId,
        });
        return {
          success: false,
          error: `Failed to create match: ${error.message}`,
        };
      }

      console.log(
        `Match created: ${data.id} between ${kindbossingId} and ${kindtaoId}`
      );

      return {
        success: true,
        matchId: data.id,
      };
    } catch (error) {
      console.error("Error creating match:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Get user's matches (client-side) with job post details
   */
  async getUserMatches(userId: string): Promise<any[]> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("matches")
        .select(
          `
          *,
          job_posts!job_post_id(job_title)
        `
        )
        .or(`kindbossing_user_id.eq.${userId},kindtao_user_id.eq.${userId}`)
        .eq("is_active", true)
        .order("matched_at", { ascending: false });

      if (error) {
        console.error("Error fetching user matches:", error);
        return [];
      }

      // Transform the data to include job_title in the match object
      const matches = (data || []).map((match: any) => ({
        ...match,
        job_title: match.job_posts?.job_title || "Unknown Job",
      }));

      return matches;
    } catch (error) {
      console.error("Error fetching user matches:", error);
      return [];
    }
  },

  /**
   * Get match by ID (client-side)
   */
  async getMatchById(matchId: string): Promise<Match | null> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", matchId)
        .single();

      if (error) {
        console.error("Error fetching match:", error);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error fetching match:", error);
      return null;
    }
  },

  /**
   * Mark match as inactive (client-side) - to simulate "opening" a match
   */
  async markMatchAsInactive(matchId: string): Promise<boolean> {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("matches")
        .update({ is_active: false })
        .eq("id", matchId);

      if (error) {
        console.error("Error marking match as inactive:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking match as inactive:", error);
      return false;
    }
  },

  /**
   * Update match last message timestamp (client-side)
   */
  async updateMatchLastMessage(matchId: string): Promise<boolean> {
    try {
      const matches = JSON.parse(localStorage.getItem("matches") || "[]");
      const matchIndex = matches.findIndex(
        (match: any) => match.id === matchId
      );

      if (matchIndex !== -1) {
        matches[matchIndex].last_message_at = new Date().toISOString();
        localStorage.setItem("matches", JSON.stringify(matches));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error updating match last message:", error);
      return false;
    }
  },

  /**
   * Deactivate a match (client-side)
   */
  async deactivateMatch(matchId: string): Promise<boolean> {
    try {
      const matches = JSON.parse(localStorage.getItem("matches") || "[]");
      const matchIndex = matches.findIndex(
        (match: any) => match.id === matchId
      );

      if (matchIndex !== -1) {
        matches[matchIndex].is_active = false;
        localStorage.setItem("matches", JSON.stringify(matches));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error deactivating match:", error);
      return false;
    }
  },
};
