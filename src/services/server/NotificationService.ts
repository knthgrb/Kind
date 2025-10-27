import { createClient } from "@/utils/supabase/server";
import { DatabaseNotification } from "@/types/notification";
import { logger } from "@/utils/logger";

export class NotificationService {
  /**
   * Fetch notifications for a user
   */
  static async fetchNotifications(
    userId: string,
    filters?: {
      status?: "all" | "unread" | "read";
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    data: DatabaseNotification[] | null;
    error: string | null;
  }> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      // Apply status filter
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      // Apply pagination
      if (filters?.limit) {
        if (filters.offset !== undefined) {
          query = query.range(
            filters.offset,
            filters.offset + filters.limit - 1
          );
        } else {
          query = query.limit(filters.limit);
        }
      }

      const { data, error } = await query;

      if (error) {
        logger.error("Error fetching notifications:", error);
        return { data: null, error: error.message };
      }

      return { data: data as DatabaseNotification[], error: null };
    } catch (error) {
      logger.error("Error fetching notifications:", error);
      return { data: null, error: "Failed to fetch notifications" };
    }
  }

  /**
   * Get notification count for a user
   */
  static async getNotificationCount(
    userId: string,
    status?: "unread" | "read"
  ): Promise<{ count: number; error: string | null }> {
    try {
      const supabase = await createClient();

      let query = supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      if (status) {
        query = query.eq("status", status);
      }

      const { count, error } = await query;

      if (error) {
        logger.error("Error fetching notification count:", error);
        return { count: 0, error: error.message };
      }

      return { count: count || 0, error: null };
    } catch (error) {
      logger.error("Error fetching notification count:", error);
      return { count: 0, error: "Failed to fetch notification count" };
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from("notifications")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
        })
        .eq("id", notificationId)
        .eq("status", "unread");

      if (error) {
        logger.error("Error marking notification as read:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      logger.error("Error marking notification as read:", error);
      return { success: false, error: "Failed to mark notification as read" };
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from("notifications")
        .update({
          status: "read",
          read_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("status", "unread");

      if (error) {
        logger.error("Error marking all notifications as read:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      logger.error("Error marking all notifications as read:", error);
      return {
        success: false,
        error: "Failed to mark all notifications as read",
      };
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(notificationId: string): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const supabase = await createClient();

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) {
        logger.error("Error deleting notification:", error);
        return { success: false, error: error.message };
      }

      return { success: true, error: null };
    } catch (error) {
      logger.error("Error deleting notification:", error);
      return { success: false, error: "Failed to delete notification" };
    }
  }

  /**
   * Create a new notification
   */
  static async createNotification(
    notification: Omit<
      DatabaseNotification,
      "id" | "created_at" | "read_at"
    > & {
      read_at?: string;
    }
  ): Promise<{ data: DatabaseNotification | null; error: string | null }> {
    try {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("notifications")
        .insert([
          {
            user_id: notification.user_id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            data: notification.data || {},
            status: notification.status || "unread",
            read_at: notification.read_at || null,
          },
        ])
        .select("*")
        .single();

      if (error) {
        logger.error("Error creating notification:", error);
        return { data: null, error: error.message };
      }

      return { data: data as DatabaseNotification, error: null };
    } catch (error) {
      logger.error("Error creating notification:", error);
      return { data: null, error: "Failed to create notification" };
    }
  }
}
