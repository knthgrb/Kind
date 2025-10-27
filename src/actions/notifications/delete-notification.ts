"use server";

import { NotificationService } from "@/services/server/NotificationService";
import { createClient } from "@/utils/supabase/server";

export interface DeleteNotificationResult {
  success: boolean;
  error?: string;
}

export async function deleteNotification(
  notificationId: string
): Promise<DeleteNotificationResult> {
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

    const result = await NotificationService.deleteNotification(notificationId);

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
    console.error("Error in deleteNotification action:", error);
    return {
      success: false,
      error: "Failed to delete notification",
    };
  }
}
