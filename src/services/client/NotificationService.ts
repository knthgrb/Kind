import { createClient } from "@/utils/supabase/client";

export interface NotificationData {
  title: string;
  message: string;
  type: "application" | "match" | "message" | "system";
  jobId?: string;
  applicantId?: string;
  employerId?: string;
}

export const NotificationService = {
  /**
   * Initialize notification service for a user
   */
  async initialize(userId: string): Promise<boolean> {
    try {
      // Request notification permission
      const hasPermission = await this.requestPermission();

      if (hasPermission) {
        console.log("Notification service initialized for user:", userId);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return false;
    }
  },

  /**
   * Cleanup notification service
   */
  cleanup(): void {
    // Cleanup any active notification listeners
    console.log("Notification service cleaned up");
  },

  /**
   * Send notification when someone applies to a job
   */
  async notifyJobApplication(
    jobId: string,
    applicantId: string,
    employerId: string,
    applicantName: string,
    jobTitle: string
  ): Promise<boolean> {
    const supabase = createClient();

    try {
      // Create notification in database
      const { error } = await supabase.from("notifications").insert({
        user_id: employerId,
        type: "application",
        title: "New Job Application",
        message: `${applicantName} has applied to your job: ${jobTitle}`,
        data: {
          job_id: jobId,
          applicant_id: applicantId,
          applicant_name: applicantName,
          job_title: jobTitle,
        },
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error creating notification:", error);
        return false;
      }

      // Send push notification if user has granted permission
      if (Notification.permission === "granted") {
        new Notification("New Job Application", {
          body: `${applicantName} has applied to your job: ${jobTitle}`,
          icon: "/icons/icon-192x192.png",
          badge: "/icons/icon-192x192.png",
          tag: `application-${jobId}`,
          data: {
            jobId,
            applicantId,
            type: "application",
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  },

  /**
   * Send notification when a match is created
   */
  async notifyMatch(
    kindtaoId: string,
    kindbossingId: string,
    jobTitle: string
  ): Promise<boolean> {
    const supabase = createClient();

    try {
      // Notify both users about the match
      const notifications = [
        {
          user_id: kindtaoId,
          type: "match",
          title: "You've been matched!",
          message: `Great news! You've been selected for the job: ${jobTitle}. You can now start chatting with the employer.`,
          data: {
            job_title: jobTitle,
            match_type: "job_selection",
          },
          created_at: new Date().toISOString(),
        },
        {
          user_id: kindbossingId,
          type: "match",
          title: "Match created!",
          message: `You've approved a candidate for: ${jobTitle}. You can now start chatting.`,
          data: {
            job_title: jobTitle,
            match_type: "candidate_approval",
          },
          created_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase
        .from("notifications")
        .insert(notifications);

      if (error) {
        console.error("Error creating match notifications:", error);
        return false;
      }

      // Send push notifications
      if (Notification.permission === "granted") {
        new Notification("You've been matched!", {
          body: `Great news! You've been selected for the job: ${jobTitle}`,
          icon: "/icons/icon-192x192.png",
          tag: `match-${kindtaoId}`,
        });
      }

      return true;
    } catch (error) {
      console.error("Error sending match notification:", error);
      return false;
    }
  },

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): "default" | "granted" | "denied" {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return "denied";
    }

    return Notification.permission as "default" | "granted" | "denied";
  },

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  /**
   * Get user's notifications
   */
  async getUserNotifications(userId: string): Promise<any[]> {
    const supabase = createClient();

    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<boolean> {
    const supabase = createClient();

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) {
        console.error("Error marking notification as read:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },

  /**
   * Check if notifications are enabled
   */
  isEnabled(): boolean {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return false;
    }
    return Notification.permission === "granted";
  },

  /**
   * Send a test notification
   */
  testNotification(): void {
    if (typeof window === "undefined" || !("Notification" in window)) {
      console.warn("Notifications not supported in this browser");
      return;
    }

    if (Notification.permission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification to verify your settings are working correctly.",
        icon: "/icons/icon-192x192.png",
        badge: "/icons/icon-192x192.png",
        tag: "test-notification",
      });
    } else {
      console.warn("Notification permission not granted");
    }
  },
};
