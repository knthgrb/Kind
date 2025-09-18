"use client";

import React from "react";
import { useToast } from "@/contexts/ToastContext";
import { IoChatbubble } from "react-icons/io5";

interface ChatNotificationData {
  conversationId: string;
  senderName: string;
  senderAvatar?: string;
  message: string;
}

// Custom chat notification component
const ChatNotificationContent: React.FC<{
  data: ChatNotificationData;
  onViewChat: () => void;
}> = ({ data, onViewChat }) => {
  return (
    <div className="flex items-start space-x-3 pr-6">
      {/* Avatar */}
      {data.senderAvatar ? (
        <img
          src={data.senderAvatar}
          alt={data.senderName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
          <IoChatbubble className="w-4 h-4 text-gray-600" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">
          New message from {data.senderName}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          {data.message.length > 60
            ? data.message.substring(0, 60) + "..."
            : data.message}
        </p>
        <button
          onClick={onViewChat}
          className="mt-2 text-sm font-medium text-[#cc0000] hover:text-red-800 focus:outline-none focus:underline"
        >
          View Chat
        </button>
      </div>
    </div>
  );
};

export class ChatNotificationService {
  private static toastContext: ReturnType<typeof useToast> | null = null;

  /**
   * Set the toast context for showing notifications
   */
  static setToastContext(context: ReturnType<typeof useToast>) {
    this.toastContext = context;
  }

  /**
   * Show a chat notification toast
   */
  static showChatNotification(
    senderName: string,
    message: string,
    conversationId: string,
    senderAvatar?: string,
    duration: number = 6000
  ): string | null {
    if (!this.toastContext) {
      console.warn("ChatNotificationService: Toast context not set");
      return null;
    }

    const chatData: ChatNotificationData = {
      conversationId,
      senderName,
      senderAvatar,
      message,
    };

    const customContent = (
      <ChatNotificationContent
        data={chatData}
        onViewChat={() => {
          window.location.href = `/chats/${conversationId}`;
        }}
      />
    );

    return this.toastContext.showToast({
      type: "success",
      title: "New Message",
      message: `${senderName}: ${
        message.length > 40 ? message.substring(0, 40) + "..." : message
      }`,
      customContent,
      duration,
    });
  }

  /**
   * Show a simple chat notification (without custom content)
   */
  static showSimpleChatNotification(
    senderName: string,
    message: string,
    conversationId: string,
    senderAvatar?: string,
    duration: number = 6000
  ): string | null {
    if (!this.toastContext) {
      console.warn("ChatNotificationService: Toast context not set");
      return null;
    }

    return this.toastContext.showSuccess(
      `New message from ${senderName}`,
      message.length > 60 ? message.substring(0, 60) + "..." : message,
      {
        duration,
        action: {
          label: "View Chat",
          onClick: () => {
            window.location.href = `/chats/${conversationId}`;
          },
        },
      }
    );
  }
}
