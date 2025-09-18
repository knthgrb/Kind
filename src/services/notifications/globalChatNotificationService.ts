"use client";

import { RealtimeService } from "@/services/chat/realtimeService";
import { ChatService } from "@/services/chat/chatService";
import { PushNotificationService } from "./pushNotificationService";
import { ChatNotificationService } from "./chatNotificationService";

export class GlobalChatNotificationService {
  private static isInitialized = false;
  private static subscriptions = new Map<string, any>();
  private static currentUserId: string | null = null;

  /**
   * Set toast context for showing notifications
   */
  static setToastContext(context: any) {
    ChatNotificationService.setToastContext(context);
  }

  /**
   * Initialize global chat notifications for a user
   */
  static async initialize(userId: string) {
    if (this.isInitialized && this.currentUserId === userId) {
      return;
    }
    this.currentUserId = userId;

    try {
      // Get all user conversations
      const conversations = await ChatService.getUserConversations(userId);

      // Subscribe to all conversations for notifications
      for (const conversation of conversations) {
        await this.subscribeToConversation(conversation.id);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize global chat notifications:", error);
    }
  }

  /**
   * Subscribe to a single conversation for notifications
   */
  private static async subscribeToConversation(conversationId: string) {
    try {
      const subscription = await RealtimeService.subscribeToMessages(
        conversationId,
        (message) => {
          this.handleIncomingMessage(message, conversationId);
        },
        (error) => {
          console.error(
            "Global subscription error for conversation:",
            conversationId,
            error
          );
        }
      );

      this.subscriptions.set(conversationId, subscription);
    } catch (error) {
      console.error(
        "Failed to subscribe to conversation:",
        conversationId,
        error
      );
    }
  }

  /**
   * Handle incoming messages and show notifications
   */
  private static handleIncomingMessage(message: any, conversationId: string) {
    try {
      // Check if notifications are enabled
      if (!PushNotificationService.isEnabled()) {
        return;
      }

      // Check if message is from current user
      if (this.currentUserId && message.user.id === this.currentUserId) {
        return;
      }

      // Check if user is currently on the chat page for this conversation
      const isOnChatPage = window.location.pathname.includes(
        `/chats/${conversationId}`
      );

      // Only show notification if:
      // 1. Page is hidden (user is not actively viewing)
      // 2. OR user is not on the specific chat page
      if (document.hidden || !isOnChatPage) {
        // Show toast notification
        ChatNotificationService.showChatNotification(
          message.user.name,
          message.content,
          conversationId,
          message.user.avatar
        );

        // Also show push notification for background scenarios
        PushNotificationService.showChatNotification(
          message.user.name,
          message.content,
          conversationId,
          message.user.avatar
        );
      }
    } catch (error) {
      console.error("Error handling global notification:", error);
    }
  }

  /**
   * Add a new conversation subscription
   */
  static async addConversation(conversationId: string) {
    if (!this.isInitialized) {
      console.warn("Global chat notifications not initialized");
      return;
    }

    if (this.subscriptions.has(conversationId)) {
      return;
    }

    await this.subscribeToConversation(conversationId);
  }

  /**
   * Cleanup all subscriptions
   */
  static cleanup() {
    this.subscriptions.forEach((subscription, conversationId) => {
      try {
        RealtimeService.unsubscribeFromMessages(conversationId);
      } catch (error) {
        console.error(
          "Error unsubscribing from conversation:",
          conversationId,
          error
        );
      }
    });

    this.subscriptions.clear();
    this.isInitialized = false;
    this.currentUserId = null;
  }

  /**
   * Get current initialization status
   */
  static getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentUserId: this.currentUserId,
      subscriptionCount: this.subscriptions.size,
    };
  }
}
