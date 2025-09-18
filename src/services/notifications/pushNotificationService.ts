"use client";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  silent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export class PushNotificationService {
  private static isSupported =
    typeof window !== "undefined" && "Notification" in window;
  private static isServiceWorkerSupported =
    typeof window !== "undefined" && "serviceWorker" in navigator;

  /**
   * Check if notifications are supported
   */
  static isNotificationSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Check if service worker is supported
   */
  static isServiceWorkerAvailable(): boolean {
    return this.isServiceWorkerSupported;
  }

  /**
   * Get current notification permission status
   */
  static getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) return "denied";
    return Notification.permission;
  }

  /**
   * Request notification permission from user
   */
  static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn("Notifications are not supported in this browser");
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return "denied";
    }
  }

  /**
   * Check if notifications are enabled
   */
  static isEnabled(): boolean {
    return this.getPermissionStatus() === "granted";
  }

  /**
   * Show a notification
   */
  static async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isEnabled()) {
      console.warn("Notifications are not enabled");
      return;
    }

    try {
      // Use service worker if available, otherwise use direct notification
      if (this.isServiceWorkerAvailable() && "serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notificationOptions: any = {
          body: options.body,
          icon: options.icon || "/icons/icon-192x192.png",
          badge: options.badge || "/icons/icon-192x192.png",
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
        };

        // Add actions if available (service worker specific)
        if (options.actions && options.actions.length > 0) {
          notificationOptions.actions = options.actions;
        }

        await registration.showNotification(options.title, notificationOptions);
      } else {
        // Fallback to direct notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/icons/icon-192x192.png",
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
          silent: options.silent || false,
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);
      }
    } catch (error) {
      console.error("Error showing notification:", error);
    }
  }

  /**
   * Show a chat message notification
   */
  static async showChatNotification(
    senderName: string,
    message: string,
    conversationId: string,
    senderAvatar?: string
  ): Promise<void> {
    const options: NotificationOptions = {
      title: `New message from ${senderName}`,
      body: message.length > 100 ? message.substring(0, 100) + "..." : message,
      icon: senderAvatar || "/icons/icon-192x192.png",
      tag: `chat-${conversationId}`,
      data: {
        type: "chat",
        conversationId,
        senderName,
        message,
      },
      requireInteraction: false,
      actions: [
        {
          action: "view",
          title: "View Chat",
          icon: "/icons/icon-192x192.png",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    await this.showNotification(options);
  }

  /**
   * Register service worker for notifications
   */
  static async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isServiceWorkerAvailable()) {
      console.warn("Service Worker is not supported");
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered:", registration);
      return registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  /**
   * Setup notification click handlers
   */
  static setupNotificationHandlers(): void {
    if (!this.isSupported) return;

    // Handle notification click
    navigator.serviceWorker?.addEventListener("message", (event) => {
      if (event.data && event.data.type === "NOTIFICATION_CLICK") {
        const { action, data } = event.data;

        if (action === "view" && data.conversationId) {
          // Navigate to chat
          window.location.href = `/chats/${data.conversationId}`;
        }
      }
    });

    // Handle direct notification click
    window.addEventListener("notificationclick", (event: any) => {
      event.preventDefault();

      const notification = event.notification;
      const data = notification.data;

      if (data && data.conversationId) {
        // Close the notification
        notification.close();

        // Navigate to chat
        window.location.href = `/chats/${data.conversationId}`;
      }
    });
  }

  /**
   * Initialize notification service
   */
  static async initialize(): Promise<boolean> {
    try {
      // Register service worker
      await this.registerServiceWorker();

      // Setup handlers
      this.setupNotificationHandlers();

      return true;
    } catch (error) {
      console.error("Failed to initialize push notification service:", error);
      return false;
    }
  }

  /**
   * Test notification (for debugging)
   */
  static async testNotification(): Promise<void> {
    await this.showNotification({
      title: "Test Notification",
      body: "This is a test notification from Kind Platform",
      icon: "/icons/icon-192x192.png",
      tag: "test",
    });
  }
}
