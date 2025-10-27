import { createClient } from "@/utils/supabase/client";

export interface UnreadCounts {
  newMatches: number;
  unreadMessages: number;
  unreadNotifications: number;
}

export const UnreadCountService = {
  /**
   * Get unread counts for a user
   */
  async getUnreadCounts(userId: string): Promise<UnreadCounts> {
    const supabase = createClient();

    try {
      // Get new matches count (active matches that don't have conversations yet)
      // First, get all active matches for the user
      const { data: allMatches, error: matchesError } = await supabase
        .from("matches")
        .select("id")
        .or(`kindbossing_user_id.eq.${userId},kindtao_user_id.eq.${userId}`)
        .eq("is_active", true);

      if (matchesError) {
        console.error("Error fetching matches:", matchesError);
      }

      let newMatchesCount = 0;
      if (allMatches && allMatches.length > 0) {
        // Get all conversations for these matches
        const matchIds = allMatches.map((match) => match.id);
        const { data: existingConversations, error: conversationsError } =
          await supabase
            .from("conversations")
            .select("match_id")
            .in("match_id", matchIds);

        if (conversationsError) {
          console.error("Error fetching conversations:", conversationsError);
        } else {
          // Count matches that don't have conversations
          const matchIdsWithConversations =
            existingConversations?.map((conv) => conv.match_id) || [];
          newMatchesCount = allMatches.filter(
            (match) => !matchIdsWithConversations.includes(match.id)
          ).length;
        }
      }

      if (matchesError) {
        console.error("Error fetching new matches:", matchesError);
      }

      // Get unread messages count (messages where read_at is null and sender is not the current user)
      // First, get all conversations for this user
      const { data: userConversations, error: conversationsError } =
        await supabase
          .from("conversations")
          .select("id")
          .or(`kindbossing_user_id.eq.${userId},kindtao_user_id.eq.${userId}`);

      if (conversationsError) {
        console.error("Error fetching user conversations:", conversationsError);
      }

      let unreadMessagesCount = 0;
      if (userConversations && userConversations.length > 0) {
        const conversationIds = userConversations.map((conv) => conv.id);

        const { data: unreadMessages, error: messagesError } = await supabase
          .from("messages")
          .select("id")
          .in("conversation_id", conversationIds)
          .is("read_at", null)
          .neq("sender_id", userId);

        if (messagesError) {
          console.error("Error fetching unread messages:", messagesError);
        } else {
          unreadMessagesCount = unreadMessages?.length || 0;
        }
      }

      // Get unread notifications count (notifications where read_at is null)
      const { count: unreadNotificationsCount, error: notificationsError } =
        await supabase
          .from("notifications")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .is("read_at", null);

      if (notificationsError) {
        console.error(
          "Error fetching unread notifications:",
          notificationsError
        );
      }

      return {
        newMatches: newMatchesCount,
        unreadMessages: unreadMessagesCount,
        unreadNotifications: unreadNotificationsCount || 0,
      };
    } catch (error) {
      console.error("Error fetching unread counts:", error);
      return {
        newMatches: 0,
        unreadMessages: 0,
        unreadNotifications: 0,
      };
    }
  },

  /**
   * Get unread counts for conversations (for sidebar display)
   */
  async getConversationUnreadCounts(
    userId: string
  ): Promise<Map<string, number>> {
    const supabase = createClient();
    const unreadCounts = new Map<string, number>();

    try {
      // Get all conversations for the user
      const { data: conversations, error: conversationsError } = await supabase
        .from("conversations")
        .select(
          `
          id,
          kindbossing_user_id,
          kindtao_user_id
        `
        )
        .or(`kindbossing_user_id.eq.${userId},kindtao_user_id.eq.${userId}`);

      if (conversationsError) {
        console.error("Error fetching conversations:", conversationsError);
        return unreadCounts;
      }

      if (!conversations || conversations.length === 0) {
        return unreadCounts;
      }

      // Get unread message counts for each conversation
      const conversationIds = conversations.map((conv) => conv.id);

      const { data: unreadMessages, error: messagesError } = await supabase
        .from("messages")
        .select(
          `
          conversation_id,
          sender_id
        `
        )
        .in("conversation_id", conversationIds)
        .is("read_at", null)
        .neq("sender_id", userId);

      if (messagesError) {
        console.error("Error fetching unread messages:", messagesError);
        return unreadCounts;
      }

      // Count unread messages per conversation
      unreadMessages?.forEach((message) => {
        const currentCount = unreadCounts.get(message.conversation_id) || 0;
        unreadCounts.set(message.conversation_id, currentCount + 1);
      });

      return unreadCounts;
    } catch (error) {
      console.error("Error fetching conversation unread counts:", error);
      return unreadCounts;
    }
  },
};
