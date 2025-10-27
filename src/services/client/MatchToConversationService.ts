import { createClient } from "@/utils/supabase/client";
import { ChatService } from "./ChatService";

export interface MatchToConversationResult {
  success: boolean;
  conversationId?: string;
  error?: string;
}

export const MatchToConversationService = {
  /**
   * Get or create a conversation for a match
   */
  async getOrCreateConversation(
    matchId: string
  ): Promise<MatchToConversationResult> {
    const supabase = createClient();

    try {
      // First, check if a conversation already exists for this match
      const { data: existingConversation, error: conversationError } =
        await supabase
          .from("conversations")
          .select("id")
          .eq("match_id", matchId)
          .single();

      if (conversationError && conversationError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected if no conversation exists
        console.error(
          "Error checking existing conversation:",
          conversationError
        );
        return {
          success: false,
          error: "Failed to check existing conversation",
        };
      }

      if (existingConversation) {
        return {
          success: true,
          conversationId: existingConversation.id,
        };
      }

      // Get match details to create conversation
      const { data: match, error: matchError } = await supabase
        .from("matches")
        .select(
          `
          id,
          kindbossing_user_id,
          kindtao_user_id,
          job_post_id
        `
        )
        .eq("id", matchId)
        .single();

      if (matchError) {
        console.error("Error fetching match details:", matchError);
        return {
          success: false,
          error: "Match not found",
        };
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from("conversations")
        .insert({
          match_id: matchId,
          kindbossing_user_id: match.kindbossing_user_id,
          kindtao_user_id: match.kindtao_user_id,
          status: "active",
        })
        .select("id")
        .single();

      if (createError) {
        console.error("Error creating conversation:", createError);
        return {
          success: false,
          error: "Failed to create conversation",
        };
      }

      return {
        success: true,
        conversationId: newConversation.id,
      };
    } catch (error) {
      console.error("Error in getOrCreateConversation:", error);
      return {
        success: false,
        error: "An unexpected error occurred",
      };
    }
  },

  /**
   * Get conversation ID for a match (if it exists)
   */
  async getConversationId(matchId: string): Promise<string | null> {
    const supabase = createClient();

    try {
      const { data: conversation, error } = await supabase
        .from("conversations")
        .select("id")
        .eq("match_id", matchId)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Not found - no conversation exists yet
          return null;
        }
        console.error("Error fetching conversation:", error);
        return null;
      }

      return conversation.id;
    } catch (error) {
      console.error("Error in getConversationId:", error);
      return null;
    }
  },
};
