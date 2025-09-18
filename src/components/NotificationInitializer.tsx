"use client";

import { useEffect } from "react";
import { PushNotificationService } from "@/services/notifications/pushNotificationService";
import { GlobalChatNotificationService } from "@/services/notifications/globalChatNotificationService";
import { useAuthStore } from "@/stores/useAuthStore";
import { useToast } from "@/contexts/ToastContext";

export default function NotificationInitializer() {
  const { user, isAuthenticated } = useAuthStore();
  const toastContext = useToast();

  useEffect(() => {
    // Initialize notification service when component mounts
    const initializeNotifications = async () => {
      try {
        await PushNotificationService.initialize();
      } catch (error) {
        console.error("Failed to initialize push notification service:", error);
      }
    };

    initializeNotifications();
  }, []);

  // Initialize global chat notifications when user is authenticated
  useEffect(() => {
    const initializeChatNotifications = async () => {
      if (isAuthenticated && user?.id) {
        try {
          // Set the toast context for notifications
          GlobalChatNotificationService.setToastContext(toastContext);

          await GlobalChatNotificationService.initialize(user.id);
        } catch (error) {
          console.error(
            "Failed to initialize global chat notifications:",
            error
          );
        }
      }
    };

    initializeChatNotifications();

    // Cleanup on unmount or user change
    return () => {
      GlobalChatNotificationService.cleanup();
    };
  }, [isAuthenticated, user?.id]);

  return null;
}
