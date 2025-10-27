"use server";

import { NotificationService } from "@/services/server/NotificationService";
import { DatabaseNotification } from "@/types/notification";
import { createClient } from "@/utils/supabase/server";

export interface GetNotificationsResult {
  success: boolean;
  data?: DatabaseNotification[];
  error?: string;
}

export async function getNotifications(filters?: {
  status?: "all" | "unread" | "read";
  limit?: number;
  offset?: number;
}): Promise<GetNotificationsResult> {
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

    const result = await NotificationService.fetchNotifications(
      user.id,
      filters
    );

    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      data: result.data || [],
    };
  } catch (error) {
    console.error("Error in getNotifications action:", error);
    return {
      success: false,
      error: "Failed to fetch notifications",
    };
  }
}

export async function getUnreadNotificationCount(): Promise<{
  success: boolean;
  count?: number;
  error?: string;
}> {
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

    const result = await NotificationService.getNotificationCount(
      user.id,
      "unread"
    );

    if (result.error) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      count: result.count,
    };
  } catch (error) {
    console.error("Error in getUnreadNotificationCount action:", error);
    return {
      success: false,
      error: "Failed to fetch notification count",
    };
  }
}
