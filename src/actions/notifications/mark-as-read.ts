"use server";

import { NotificationService } from "@/services/server/NotificationService";
import { createClient } from "@/utils/supabase/server";

export interface MarkAsReadResult {
  success: boolean;
  error?: string;
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<MarkAsReadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const result = await NotificationService.markAsRead(notificationId);

    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in markNotificationAsRead action:", error);
    return {
      success: false,
      error: "Failed to mark notification as read",
    };
  }
}

export async function markAllNotificationsAsRead(): Promise<MarkAsReadResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const result = await NotificationService.markAllAsRead(user.id);

    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in markAllNotificationsAsRead action:", error);
    return {
      success: false,
      error: "Failed to mark all notifications as read",
    };
  }
}
