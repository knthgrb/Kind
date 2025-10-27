"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useParams, useRouter } from "next/navigation";
import { LuSearch } from "react-icons/lu";
import { FaChevronLeft } from "react-icons/fa";
import {
  FiMessageCircle,
  FiUsers,
  FiChevronDown,
  FiChevronRight,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import BlockUserModal from "./BlockUserModal";
import ReportUserModal, { ReportData } from "./ReportUserModal";
import FileAttachmentModal from "./FileAttachmentModal";
import FileMessage from "./FileMessage";
import LoadingSpinner from "@/components/loader/LoadingSpinner";
import ChatSkeleton from "@/components/common/ChatSkeleton";
import { FileUploadService } from "@/services/client/FileUploadService";
import { useChatUI } from "@/hooks/chats/useChatUI";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSidebarMonitoring } from "@/hooks/chats/useSidebarMonitoring";
import { useToast } from "@/contexts/ToastContext";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { ChatService } from "@/services/client/ChatService";
import { RealtimeService } from "@/services/client/realtimeService";
import { BlockingService } from "@/services/client/BlockingService";
import { ReportingService } from "@/services/client/reportingService";
import { MatchService } from "@/services/client/MatchService";
import { UserService } from "@/services/client/UserService";
import StartConversationModal from "@/components/modals/StartConversationModal";
import { formatTimestamp, getStatusColor } from "@/utils/chatUtils";
import type {
  ConversationWithDetails,
  User,
  MessageWithUser,
} from "@/types/chat";
import type { SidebarData } from "@/hooks/chats/useSidebarMonitoring";
import { getOtherUser } from "@/utils/chatMessageUtils";
import type { User as AuthUser } from "@/types/user";

// Utility functions moved to src/utils/chatUtils.ts

// Convert auth user to chat user
function convertAuthUserToChatUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    role: authUser.user_metadata.role,
    email: authUser.user_metadata.email,
    phone: authUser.user_metadata.phone || null,
    first_name: authUser.user_metadata.first_name,
    last_name: authUser.user_metadata.last_name,
    date_of_birth: authUser.user_metadata.date_of_birth || null,
    gender: authUser.user_metadata.gender || null,
    profile_image_url: authUser.user_metadata.profile_image_url || null,
    address: authUser.user_metadata.full_address || null,
    city: authUser.user_metadata.city || null,
    province: authUser.user_metadata.province || null,
    postal_code: authUser.user_metadata.postal_code || null,
    is_verified: false, // Default value
    verification_status: authUser.user_metadata.verification_status,
    subscription_tier: authUser.user_metadata.subscription_tier,
    subscription_expires_at: null, // Default value
    swipe_credits: authUser.user_metadata.swipe_credits,
    boost_credits: authUser.user_metadata.boost_credits,
    last_active: new Date().toISOString(), // Default value
    created_at: authUser.created_at || new Date().toISOString(),
    updated_at: authUser.updated_at || new Date().toISOString(),
  };
}

// Memoized conversation item component to prevent unnecessary re-renders
const ConversationItem = memo(
  ({
    conversation,
    currentUser,
    sidebarData,
    selectedConversationId,
    onSelect,
  }: {
    conversation: ConversationWithDetails;
    currentUser: User;
    sidebarData: SidebarData;
    selectedConversationId: string | null;
    onSelect: (id: string) => void;
  }) => {
    const otherUser = useMemo(() => {
      return getOtherUser(conversation, currentUser.id);
    }, [conversation, currentUser.id]);

    const isActive = selectedConversationId === conversation.id;
    const unreadCount = sidebarData.unreadCounts.get(conversation.id) || 0;
    const hasUnread = unreadCount > 0 && !isActive;
    const lastMessageText =
      sidebarData.lastMessages.get(conversation.id) || "No messages yet";
    const lastMessageTimestamp = sidebarData.conversationTimestamps.get(
      conversation.id
    )
      ? new Date(
          sidebarData.conversationTimestamps.get(conversation.id)!
        ).toISOString()
      : conversation.last_message_at;

    return (
      <div
        onClick={() => onSelect(conversation.id)}
        className={`flex items-center p-2 mb-2 cursor-pointer border-b border-[#DCDCE2] hover:bg-gray-200 ${
          isActive ? "bg-[#f0e7f2]" : ""
        }`}
      >
        <div className="relative">
          <img
            src={otherUser.profile_image_url || "/people/user-profile.png"}
            alt={`${otherUser.first_name} ${otherUser.last_name}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          <span
            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
              false
            )}`}
          />
          {hasUnread && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <h4
            className={`text-[clamp(0.663rem,0.8rem,0.9rem)] font-medium text-[#212529] truncate ${
              hasUnread ? "font-bold" : ""
            }`}
          >
            {`${otherUser.first_name} ${otherUser.last_name}`}
          </h4>
          <p
            className={`text-[clamp(0.663rem,0.8rem,0.9rem)] text-[#757589] truncate ${
              hasUnread ? "font-bold" : ""
            }`}
          >
            {lastMessageText}
          </p>
        </div>
        <span className="text-[clamp(0.663rem,0.8rem,0.9rem)] text-[#757589] ml-1 whitespace-nowrap">
          {lastMessageTimestamp
            ? formatTimestamp(lastMessageTimestamp, "sidebar")
            : ""}
        </span>
      </div>
    );
  }
);

ConversationItem.displayName = "ConversationItem";

export default function ChatUIClient({
  conversationId: propConversationId,
}: { conversationId?: string } = {}) {
  const { user } = useAuthStore();
  const userMetadata = user?.user_metadata;
  const { showToast } = useToast();
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newMessage, setNewMessage] = useState("");

  // Block and Report modals
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  // Dropdown menu
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Emoji picker
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  // File attachment
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Matches
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [userRole, setUserRole] = useState<"kindbossing" | "kindtao" | null>(
    null
  );
  const [recipientName, setRecipientName] = useState<string>("");

  // Tab state
  const [activeTab, setActiveTab] = useState<"matches" | "messages">(
    "messages"
  );

  // Unread counts
  const { unreadCounts } = useUnreadCounts();

  // Expanded job folders state
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

  // Group matches by job title
  const groupedMatches = useMemo(() => {
    const grouped = new Map<string, any[]>();
    matches.forEach((match) => {
      const jobTitle = match.job_title || "Unknown Job";
      if (!grouped.has(jobTitle)) {
        grouped.set(jobTitle, []);
      }
      grouped.get(jobTitle)!.push(match);
    });
    return grouped;
  }, [matches]);

  // Toggle job folder expansion
  const toggleJobFolder = (jobTitle: string) => {
    setExpandedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobTitle)) {
        newSet.delete(jobTitle);
      } else {
        newSet.add(jobTitle);
      }
      return newSet;
    });
  };

  // Get conversation ID from props or URL params
  const conversationId =
    propConversationId || (params.conversationId as string);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(conversationId || null);

  // Ref for auto-scrolling to bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the chat UI hook
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
    refreshConversations,
    selectedConversation,
    otherUser,
    messages,
    isLoadingMessages,
    isLoadingMore,
    hasMore,
    messagesError,
    loadMoreRef,
    loadMore,
    sendMessage: sendChatMessage,
    isSending,
    sendError,
    selectConversation,
  } = useChatUI({
    selectedConversationId,
    autoMarkAsRead: true,
  });

  // Load user role and matches
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.id) return;

      try {
        setMatchesLoading(true);

        // Get user role
        const { role } = await UserService.getCurrentUserRole();
        setUserRole(role === "admin" ? null : role);

        // Get user matches
        const allMatches = await MatchService.getUserMatches(user.id);

        // Filter out matches that already have conversations
        // Create a set of match IDs that have conversations
        const matchIdsWithConversations = new Set<string>();

        for (const conv of conversations) {
          // Only add match_id if it exists and is a valid string
          if (
            conv.match_id &&
            typeof conv.match_id === "string" &&
            conv.match_id.length > 0
          ) {
            matchIdsWithConversations.add(conv.match_id);
          }
        }

        // Filter out matches that already have conversations
        const filteredMatches = allMatches.filter(
          (match) => !matchIdsWithConversations.has(match.id)
        );

        setMatches(filteredMatches);
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setMatchesLoading(false);
      }
    };

    loadUserData();
  }, [user?.id, conversations]);

  // Separate loading states to prevent flickering
  const isInitialLoading =
    isLoadingConversations || (isLoadingMessages && messages.length === 0);
  const isSidebarLoading = isLoadingConversations;

  // Match-related functions
  const handleSendMessage = async (match: any) => {
    setSelectedMatch(match);
    setIsMatchModalOpen(true);

    // Don't fetch recipient name - keep it generic in modal
    setRecipientName("this user");
  };

  const getRecipientName = async (match: any) => {
    if (!userRole) return "Unknown User";

    try {
      // Import the server action
      const { getMultipleUsers } = await import(
        "@/actions/user/get-multiple-users"
      );

      // Determine which user ID to fetch based on current user's role
      const recipientId =
        userRole === "kindtao"
          ? match.kindbossing_user_id
          : match.kindtao_user_id;

      // Fetch user details
      const { data: userResults, error } = await getMultipleUsers([
        recipientId,
      ]);

      if (error || !userResults || userResults.length === 0) {
        return userRole === "kindtao" ? "KindBossing User" : "KindTao User";
      }

      const user = userResults[0].user;
      if (!user) {
        return userRole === "kindtao" ? "KindBossing User" : "KindTao User";
      }

      const firstName = user.user_metadata?.first_name || "";
      const lastName = user.user_metadata?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim();

      return (
        fullName ||
        (userRole === "kindtao" ? "KindBossing User" : "KindTao User")
      );
    } catch (error) {
      console.error("Error fetching recipient name:", error);
      return userRole === "kindtao" ? "KindBossing User" : "KindTao User";
    }
  };

  const handleSendFirstMessage = async (message: string) => {
    if (!user?.id || !selectedMatch) return;

    setIsCreatingConversation(true);
    try {
      // Check if conversation already exists for this match
      const existingConversation = conversations.find(
        (conv) =>
          conv.matches &&
          ((conv.matches.kindbossing_user_id ===
            selectedMatch.kindbossing_user_id &&
            conv.matches.kindtao_user_id === selectedMatch.kindtao_user_id) ||
            (conv.matches.kindbossing_user_id ===
              selectedMatch.kindtao_user_id &&
              conv.matches.kindtao_user_id ===
                selectedMatch.kindbossing_user_id))
      );

      let conversationId: string;

      if (existingConversation) {
        // Navigate to existing conversation
        conversationId = existingConversation.id;
      } else {
        // Create new conversation using the match ID
        const conversation = await ChatService.createConversation(
          selectedMatch.id
        );

        if (!conversation) {
          throw new Error("Failed to create conversation");
        }

        conversationId = conversation.id;

        // Send the first message
        const sentMessage = await ChatService.sendMessage(
          conversation.id,
          user.id,
          message,
          "text"
        );

        console.log("Message sent successfully:", sentMessage);

        // Small delay to ensure message is saved
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Mark match as inactive so it doesn't show in the matches list anymore
      await MatchService.markMatchAsInactive(selectedMatch.id);

      // Remove the match from local state to update UI immediately
      setMatches((prev) => prev.filter((m) => m.id !== selectedMatch.id));

      // Switch to messages tab first
      setActiveTab("messages");

      // Navigate to conversation (this will trigger the useEffect to set selectedConversationId)
      router.push(`/chats/${conversationId}`);

      // Refresh conversations after navigation
      await refreshConversations();
    } catch (error) {
      console.error("Error creating conversation:", error);
      showToast("Failed to start conversation. Please try again.", "error");
    } finally {
      setIsCreatingConversation(false);
      setIsMatchModalOpen(false);
      setSelectedMatch(null);
    }
  };

  const handleCloseMatchModal = () => {
    setIsMatchModalOpen(false);
    setSelectedMatch(null);
    setRecipientName("");
  };

  // Use sidebar monitoring hook
  const {
    sidebarData,
    refreshSidebar,
    updateSelectedConversationSidebar,
    isInitialDataLoading,
  } = useSidebarMonitoring({
    conversations,
    selectedConversationId,
  });

  // Only hide full loading screen when both sidebar and chat window have data
  const shouldShowFullLoading =
    isLoadingConversations ||
    (isLoadingMessages && messages.length === 0) ||
    isInitialDataLoading;

  // Memoize sorted conversations to prevent unnecessary re-sorting
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      // Use local timestamp if available, otherwise use database timestamp
      const aTime =
        sidebarData.conversationTimestamps.get(a.id) ||
        new Date(a.last_message_at || a.created_at).getTime();
      const bTime =
        sidebarData.conversationTimestamps.get(b.id) ||
        new Date(b.last_message_at || b.created_at).getTime();
      return bTime - aTime; // Most recent first
    });
  }, [conversations, sidebarData.conversationTimestamps]);

  // Ref to track last processed message to prevent infinite loops
  const lastProcessedMessageRef = useRef<string | null>(null);

  // Update sidebar when messages change in the selected conversation
  useEffect(() => {
    if (messages.length > 0 && selectedConversationId) {
      const latestMessage = messages[messages.length - 1];

      // Check if we've already processed this message
      if (lastProcessedMessageRef.current === latestMessage.id) {
        return; // Already processed, skip
      }

      // Mark this message as processed
      lastProcessedMessageRef.current = latestMessage.id;

      // Convert MessageWithUser to ChatMessage format for sidebar update
      const chatMessage = {
        id: latestMessage.id,
        content: latestMessage.content,
        user: {
          id: latestMessage.sender_id,
          name: `${latestMessage.sender.first_name} ${latestMessage.sender.last_name}`,
          avatar: latestMessage.sender.profile_image_url || undefined,
        },
        createdAt: latestMessage.created_at,
        conversationId: latestMessage.conversation_id,
        messageType: latestMessage.message_type || "text",
        fileUrl: latestMessage.file_url,
      };

      updateSelectedConversationSidebar(selectedConversationId, chatMessage);
    }
  }, [messages, selectedConversationId]); // Remove updateSelectedConversationSidebar from dependencies

  // Reset processed message ref when conversation changes
  useEffect(() => {
    lastProcessedMessageRef.current = null;
  }, [selectedConversationId]);

  // Update selected conversation when URL changes
  useEffect(() => {
    if (conversationId && conversationId !== selectedConversationId) {
      setSelectedConversationId(conversationId);
      selectConversation(conversationId);
    }
  }, [conversationId, selectedConversationId, selectConversation]);

  // Set default conversation based on last sent message
  useEffect(() => {
    const setDefaultConversation = async () => {
      if (
        !conversationId &&
        !selectedConversationId &&
        conversations.length > 0 &&
        user?.id
      ) {
        try {
          // Get the conversation where user last sent a message
          const lastSentConversation =
            await ChatService.getLastSentConversation(user.id);

          let defaultConversationId: string;

          if (lastSentConversation) {
            // Check if the last sent conversation still exists in current conversations
            const existsInCurrent = conversations.find(
              (c) => c.id === lastSentConversation.conversation_id
            );
            defaultConversationId = existsInCurrent
              ? lastSentConversation.conversation_id
              : conversations[0].id;
          } else {
            // If no messages sent, use the first conversation
            defaultConversationId = conversations[0].id;
          }

          setSelectedConversationId(defaultConversationId);
          selectConversation(defaultConversationId);
          // Redirect to the default conversation
          router.push(`/chats/${defaultConversationId}`);
        } catch (error) {
          // Fallback to first conversation
          const firstConversationId = conversations[0].id;
          setSelectedConversationId(firstConversationId);
          selectConversation(firstConversationId);
          router.push(`/chats/${firstConversationId}`);
        }
      }
    };

    setDefaultConversation();
  }, [
    conversations,
    selectedConversationId,
    selectConversation,
    conversationId,
    router,
    user?.id,
  ]);

  // Auto-scroll to bottom when new messages arrive (not when loading older messages)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  const isLoadingOlderMessagesRef = useRef(false);

  // Track when we're loading older messages to prevent auto-scroll
  useEffect(() => {
    if (isLoadingMore) {
      isLoadingOlderMessagesRef.current = true;
    } else {
      // Reset the flag after loading is complete
      const timer = setTimeout(() => {
        isLoadingOlderMessagesRef.current = false;
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isLoadingMore]);

  useEffect(() => {
    // Only auto-scroll if:
    // 1. We should auto-scroll (user hasn't scrolled up)
    // 2. New messages were added (not loading older ones)
    // 3. Not currently loading more messages
    // 4. Not in the process of loading older messages
    const shouldAutoScrollNow =
      shouldAutoScroll &&
      messages.length > lastMessageCount &&
      !isLoadingMore &&
      !isLoadingOlderMessagesRef.current &&
      messagesEndRef.current;

    if (shouldAutoScrollNow && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: "instant",
        block: "end",
      });
    }
    setLastMessageCount(messages.length);
  }, [messages, shouldAutoScroll, isLoadingMore, lastMessageCount]);

  // Track if user has scrolled up to disable auto-scroll when loading older messages
  useEffect(() => {
    const messagesContainer = document.querySelector(".overflow-y-auto");
    if (!messagesContainer) {
      return;
    }

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
      setShouldAutoScroll(isAtBottom);
    };

    messagesContainer.addEventListener("scroll", handleScroll);
    return () => messagesContainer.removeEventListener("scroll", handleScroll);
  }, []);

  // Cleanup realtime subscriptions on unmount and periodic cleanup
  useEffect(() => {
    // Periodic cleanup of expired subscriptions
    const cleanupInterval = setInterval(() => {
      if (RealtimeService.cleanupExpiredSubscriptions) {
        RealtimeService.cleanupExpiredSubscriptions();
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    return () => {
      clearInterval(cleanupInterval);
      // Cleanup all realtime channels when component unmounts
      if (RealtimeService.cleanup) {
        RealtimeService.cleanup();
      }
    };
  }, []);

  // Function to update URL when conversation is selected
  const updateUrlWithConversation = useCallback(
    (conversationId: string) => {
      router.push(`/chats/${conversationId}`, { scroll: false });
    },
    [router]
  );

  // Send message function
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || isSending) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage("");
      setEmojiPickerOpen(false); // Close emoji picker after sending
      // Sidebar will be updated automatically via the useEffect that watches messages
    } catch (error) {
      // Show error notification for blocked user
      if (error instanceof Error && error.message.includes("blocked user")) {
        showToast("Cannot send message to blocked user", "error");
      }
    }
  };

  // Handle emoji selection from the emoji picker
  const handleEmojiClick = (emojiObject: { emoji: string }) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setEmojiPickerOpen(false);
  };

  // Handle file selection and upload
  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (files.length === 0) {
        return;
      }

      if (!selectedConversationId) {
        showToast("Please select a conversation first.", "error");
        return;
      }

      try {
        const uploadedFiles = await FileUploadService.uploadMultipleFiles(
          files,
          selectedConversationId,
          (progress) => {}
        );

        for (let i = 0; i < uploadedFiles.length; i++) {
          const fileMetadata = uploadedFiles[i];
          await sendChatMessage(
            fileMetadata.fileName,
            fileMetadata.mimeType,
            fileMetadata.url
          );
        }

        setSelectedFiles([]);
      } catch (error) {
        showToast("Failed to upload files. Please try again.", "error");
      }
    },
    [selectedConversationId, sendChatMessage, showToast]
  );

  // Block user handler
  const handleBlockUser = async () => {
    if (!user?.id || !otherUser || !selectedConversationId) return;

    setIsBlocking(true);
    try {
      await BlockingService.blockUser({
        blockerId: user.id,
        blockedUserId: otherUser.id,
        conversationId: selectedConversationId,
        blockerName: `${userMetadata?.first_name || ""} ${
          userMetadata?.last_name || ""
        }`.trim(),
        blockedUserName: `${otherUser.first_name || ""} ${
          otherUser.last_name || ""
        }`.trim(),
      });

      // Close modal and redirect to chats list
      setBlockModalOpen(false);
      showToast("User has been blocked successfully", "success");
      router.push("/chats");
    } catch (error) {
      showToast("Failed to block user. Please try again.", "error");
    } finally {
      setIsBlocking(false);
    }
  };

  // Report user handler
  const handleReportUser = async (reportData: ReportData) => {
    if (!user?.id || !otherUser || !selectedConversationId) return;

    setIsReporting(true);
    try {
      await ReportingService.reportUser({
        reporterId: user.id,
        reportedUserId: otherUser.id,
        reportData,
        reporterName: `${userMetadata?.first_name || ""} ${
          userMetadata?.last_name || ""
        }`.trim(),
        reportedUserName: `${otherUser.first_name || ""} ${
          otherUser.last_name || ""
        }`.trim(),
        conversationId: selectedConversationId,
      });

      // Close modal
      setReportModalOpen(false);
      showToast("Your report has been submitted successfully.", "success");
    } catch (error) {
      showToast("Failed to submit report. Please try again.", "error");
    } finally {
      setIsReporting(false);
    }
  };

  // Handle dropdown action selection
  const handleDropdownAction = (action: string) => {
    setDropdownOpen(false);

    if (action === "Block User") {
      setBlockModalOpen(true);
    } else if (action === "Report User") {
      setReportModalOpen(true);
    }
  };

  // Close dropdown and emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;

      if (dropdownOpen && !target.closest(".dropdown-container")) {
        setDropdownOpen(false);
      }

      if (emojiPickerOpen && !target.closest(".emoji-picker-container")) {
        setEmojiPickerOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen, emojiPickerOpen]);

  // Memoize user objects to prevent unnecessary re-renders
  const activeUser = useMemo(() => {
    return (
      otherUser || {
        id: "",
        first_name: "Select a conversation",
        last_name: "",
        profile_image_url: "/people/user-profile.png",
        last_active: new Date().toISOString(),
      }
    );
  }, [otherUser]);

  const currentUser = useMemo(() => {
    return (
      user || {
        id: "",
        first_name: "User",
        last_name: "",
        profile_image_url: "/people/user-profile.png",
      }
    );
  }, [user]);

  return (
    <div className="h-[calc(100vh-8vh)] w-full flex flex-col">
      {/* Show skeleton when both sidebar and chat window are loading */}
      {shouldShowFullLoading ? (
        <ChatSkeleton />
      ) : (
        <>
          <div className="flex flex-1 h-full overflow-hidden">
            {/* Sidebar - Always visible */}
            <div
              className={`w-80 flex flex-col shadow-[2px_0_3px_-2px_rgba(0,0,0,0.25)] z-20 h-full bg-white
        ${sidebarOpen ? "flex" : "hidden"} md:flex`}
            >
              <div className="p-4 flex flex-col h-full">
                {/* Search */}
                <div className="flex items-center gap-2 mb-4 bg-[#eeeef1] px-3 py-2 rounded-lg border border-dashed border-gray-300 flex-shrink-0">
                  <LuSearch className="text-gray-400 text-sm flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search here..."
                    className="flex-1 bg-transparent text-sm text-[#55585b] outline-none min-w-0"
                  />
                </div>

                {/* Tabs */}
                <div className="mb-4 flex-shrink-0">
                  <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setActiveTab("matches")}
                      className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded relative ${
                        activeTab === "matches"
                          ? "text-[#CC0000] bg-white"
                          : "text-gray-600"
                      }`}
                    >
                      <FiUsers className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Matches</span>
                      {unreadCounts.newMatches > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                          {unreadCounts.newMatches}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setActiveTab("messages")}
                      className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors rounded relative ${
                        activeTab === "messages"
                          ? "text-[#CC0000] bg-white"
                          : "text-gray-600"
                      }`}
                    >
                      <FiMessageCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">Messages</span>
                      {unreadCounts.unreadMessages > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                          {unreadCounts.unreadMessages}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0 px-1">
                  {activeTab === "matches" ? (
                    /* Matches Tab Content */
                    matchesLoading ? (
                      <LoadingSpinner
                        message="Loading matches..."
                        size="sm"
                        variant="minimal"
                      />
                    ) : groupedMatches.size === 0 ? (
                      <div className="text-center text-sm text-[#757589] py-4 px-2">
                        No matches yet
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Array.from(groupedMatches.entries()).map(
                          ([jobTitle, jobMatches]) => {
                            const isExpanded = expandedJobs.has(jobTitle);
                            return (
                              <div
                                key={jobTitle}
                                className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                              >
                                {/* Job Folder Header */}
                                <button
                                  onClick={() => toggleJobFolder(jobTitle)}
                                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                                >
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="text-sm font-semibold text-[#212529] truncate">
                                      {jobTitle}
                                    </span>
                                    <span className="text-xs text-[#757589] bg-gray-100 px-2 py-0.5 rounded-full">
                                      {jobMatches.length}
                                    </span>
                                  </div>
                                  {isExpanded ? (
                                    <FiChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  ) : (
                                    <FiChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  )}
                                </button>

                                {/* Job Matches */}
                                {isExpanded && (
                                  <div className="border-t border-gray-200 bg-gray-50">
                                    {jobMatches.map((match) => (
                                      <div
                                        key={match.id}
                                        onClick={() => handleSendMessage(match)}
                                        className="flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-200 last:border-b-0"
                                      >
                                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                                          <FiUsers className="w-4 h-4 text-gray-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h4 className="text-xs font-medium text-[#212529] truncate">
                                            {userRole === "kindtao"
                                              ? `KindBossing User`
                                              : "KindTao User"}
                                          </h4>
                                          <p className="text-xs text-[#757589] truncate">
                                            ID: {match.id.slice(0, 8)}
                                          </p>
                                        </div>
                                        {match.is_active && (
                                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          }
                        )}
                      </div>
                    )
                  ) : /* Messages Tab Content */
                  isSidebarLoading ? (
                    <LoadingSpinner
                      message="Loading conversations..."
                      size="sm"
                      variant="minimal"
                    />
                  ) : conversationsError ? (
                    <div className="text-center text-sm text-red-500 py-4 px-2">
                      <p className="break-words">
                        {conversationsError.message}
                      </p>
                    </div>
                  ) : sortedConversations.length === 0 ? (
                    <div className="text-center text-sm text-[#757589] py-4 px-2">
                      No conversations yet
                    </div>
                  ) : (
                    sortedConversations.map(
                      (conversation) =>
                        user && (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            currentUser={convertAuthUserToChatUser(user)}
                            sidebarData={sidebarData}
                            selectedConversationId={selectedConversationId}
                            onSelect={(id) => {
                              setSelectedConversationId(id);
                              selectConversation(id);
                              updateUrlWithConversation(id);
                              setSidebarOpen(false); // close on mobile
                            }}
                          />
                        )
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Chat Window - Show when there's a selected conversation, otherwise show empty state */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedConversationId && selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="flex items-center justify-between p-4 flex-shrink-0 bg-white border-b border-gray-200">
                    <div className="flex items-center">
                      {/* Mobile back/hamburger */}
                      <button
                        className="md:hidden mr-3"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                      >
                        <FaChevronLeft className="text-gray-600 w-4 h-4" />
                      </button>
                      <div className="relative">
                        <img
                          src={
                            activeUser.profile_image_url ||
                            "/people/user-profile.png"
                          }
                          alt={`${activeUser.first_name} ${activeUser.last_name}`}
                          className="w-10 h-10 rounded-full"
                        />
                        <span
                          className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                            false
                          )}`}
                        />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-[clamp(0.663rem,0.8rem,0.9rem)] font-medium text-[#212529]">
                          {`${activeUser.first_name} ${activeUser.last_name}`}
                        </h3>
                        <p className="text-[clamp(0.663rem,0.8rem,0.9rem)] text-[#757589]">
                          Offline // ! is_online not implemented yet
                        </p>
                      </div>
                    </div>

                    {/* Right action icons */}
                    <div className="flex items-center gap-2">
                      <div
                        className="p-2 bg-[#f5f6f9] rounded hover:bg-gray-200 cursor-pointer"
                        onClick={() => {}}
                      >
                        <img
                          src="/icons/info.png"
                          alt="info"
                          className="w-4 h-4"
                        />
                      </div>

                      {/* Actions Dropdown - using original image button style */}
                      <div className="relative dropdown-container">
                        <div
                          className="p-2 bg-[#f5f6f9] rounded hover:bg-gray-200 cursor-pointer"
                          onClick={() => setDropdownOpen(!dropdownOpen)}
                        >
                          <img
                            src="/icons/menubar.png"
                            alt="menu"
                            className="w-4 h-4"
                          />
                        </div>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-md border border-gray-200 shadow-lg z-50">
                            <button
                              type="button"
                              onClick={() => handleDropdownAction("Block User")}
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-md"
                            >
                              Block User
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDropdownAction("Report User")
                              }
                              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-b-md"
                            >
                              Report User
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Messages */}
                  <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f5f6fa]">
                    {isLoadingMessages && messages.length === 0 ? (
                      <LoadingSpinner
                        message="Loading messages..."
                        size="sm"
                        variant="minimal"
                      />
                    ) : messagesError ? (
                      <div className="text-center text-[clamp(0.663rem,0.8rem,0.9rem)] text-red-500 py-4">
                        Error loading messages: {messagesError.message}
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-[clamp(0.663rem,0.8rem,0.9rem)] text-[#757589] py-4">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <>
                        {/* Load more trigger for infinite scroll - invisible sentinel */}
                        {hasMore && (
                          <div
                            ref={loadMoreRef}
                            data-load-more
                            className="h-1 w-full"
                            style={{ minHeight: "1px" }}
                            onClick={() => {
                              loadMore();
                            }}
                          >
                            {isLoadingMore && (
                              <LoadingSpinner
                                message="Loading older messages..."
                                size="sm"
                                variant="minimal"
                              />
                            )}
                          </div>
                        )}

                        {messages.map((msg, index) => {
                          const isSent = msg.sender_id === currentUser.id;
                          const sender = msg.sender;

                          return (
                            <div
                              key={`${msg.id}-${index}`}
                              className={`flex items-end ${
                                isSent ? "justify-end" : "justify-start"
                              }`}
                            >
                              {!isSent && (
                                <img
                                  src={
                                    sender.profile_image_url ||
                                    "/people/user-profile.png"
                                  }
                                  alt={`${sender.first_name} ${sender.last_name}`}
                                  className="w-8 h-8 rounded-full mr-2"
                                />
                              )}
                              <div
                                className={`p-3 rounded-2xl max-w-3xl ${
                                  isSent
                                    ? "bg-[#CC0000] text-white rounded"
                                    : "bg-white text-[#757589] rounded"
                                }`}
                              >
                                <p
                                  className={`text-[clamp(0.663rem,0.8rem,0.9rem)] mt-1 pb-3 flex items-center justify-between gap-2 ${
                                    isSent ? "text-white" : "text-[#757589]"
                                  }`}
                                >
                                  <span className="!font-bold">{`${sender.first_name} ${sender.last_name}`}</span>
                                  <span>
                                    {formatTimestamp(msg.created_at, "chat")}
                                  </span>
                                </p>

                                {msg.file_url && msg.message_type !== "text" ? (
                                  <FileMessage
                                    fileUrl={msg.file_url}
                                    fileName={msg.content}
                                    fileSize={0}
                                    mimeType={msg.message_type}
                                    isSent={isSent}
                                  />
                                ) : (
                                  <p className="text-[clamp(0.663rem,0.8rem,0.9rem)] whitespace-pre-wrap">
                                    {msg.content}
                                  </p>
                                )}
                              </div>
                              {isSent && (
                                <img
                                  src={
                                    sender.profile_image_url ||
                                    "/people/user-profile.png"
                                  }
                                  alt={`${sender.first_name} ${sender.last_name}`}
                                  className="w-8 h-8 rounded-full ml-2"
                                />
                              )}
                            </div>
                          );
                        })}
                        {/* Auto-scroll anchor */}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>
                  <hr className="text-gray-200" />
                  {/* Input */}
                  <div className="p-3 flex items-center gap-2 bg-[#f5f6fa] relative flex-shrink-0">
                    {/* Disable overlay when sending */}
                    {isSending && (
                      <div className="absolute inset-0 bg-gray-300/30 backdrop-blur-[1px] z-10 rounded-lg" />
                    )}
                    {/* File attachment button */}
                    <button
                      onClick={() => setFileModalOpen(true)}
                      disabled={isSending}
                      className={`p-2 bg-[#f5f6f9] rounded hover:bg-gray-200 ${
                        isSending
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                      title="Attach files"
                    >
                      <img
                        src="/icons/plus.png"
                        alt="attach"
                        className="w-4 h-4"
                      />
                    </button>

                    {/* message input */}
                    <div className="flex-1 flex items-center px-2">
                      <input
                        type="text"
                        placeholder="Type message here..."
                        disabled={isSending}
                        className={`flex-1 p-2 outline-none text-[clamp(0.663rem,0.8rem,0.9rem)] text-[#757589] ${
                          isSending ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !isSending && sendMessage()
                        }
                        onFocus={() => setEmojiPickerOpen(false)}
                      />
                      <div className="relative emoji-picker-container">
                        <img
                          src="/icons/emoji.png"
                          alt="emoji"
                          className={`w-4 h-4 ${
                            isSending
                              ? "cursor-not-allowed opacity-50"
                              : "cursor-pointer"
                          }`}
                          onClick={() =>
                            !isSending && setEmojiPickerOpen(!emojiPickerOpen)
                          }
                        />
                        {emojiPickerOpen && (
                          <>
                            {/* Dark overlay */}
                            <div
                              className="fixed inset-0 bg-black/20 z-40"
                              onClick={() => setEmojiPickerOpen(false)}
                            />
                            {/* Emoji picker positioned to the left of the emoji icon */}
                            <div className="absolute bottom-8 -left-[300px] z-50 shadow-lg rounded-lg overflow-hidden">
                              <EmojiPicker
                                onEmojiClick={handleEmojiClick}
                                width={300}
                                height={400}
                                previewConfig={{
                                  showPreview: false,
                                }}
                                skinTonesDisabled={true}
                                searchDisabled={false}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* send icon */}
                    <div
                      className={`rounded-sm w-[40px] h-[40px] flex items-center justify-center cursor-pointer ${
                        isSending || !newMessage.trim()
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-500"
                      }`}
                      onClick={sendMessage}
                    >
                      <img
                        src="/icons/send.png"
                        alt="send"
                        className="w-3 h-4"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Empty state when no conversation is selected */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl text-gray-400">💬</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-500">
                      Choose a conversation from the sidebar to start chatting
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Block User Modal */}
          <BlockUserModal
            open={blockModalOpen}
            onClose={() => setBlockModalOpen(false)}
            onConfirm={handleBlockUser}
            userName={
              activeUser
                ? `${activeUser.first_name} ${activeUser.last_name}`.trim()
                : "Unknown User"
            }
            isLoading={isBlocking}
          />

          {/* Report User Modal */}
          <ReportUserModal
            open={reportModalOpen}
            onClose={() => setReportModalOpen(false)}
            onSubmit={handleReportUser}
            userName={
              activeUser
                ? `${activeUser.first_name} ${activeUser.last_name}`.trim()
                : "Unknown User"
            }
            isLoading={isReporting}
          />

          {/* File Attachment Modal */}
          <FileAttachmentModal
            open={fileModalOpen}
            onClose={() => setFileModalOpen(false)}
            onFilesSelected={handleFileSelect}
            conversationId={selectedConversationId || ""}
          />

          {/* Start Conversation Modal */}
          <StartConversationModal
            isOpen={isMatchModalOpen}
            onClose={handleCloseMatchModal}
            onSendMessage={handleSendFirstMessage}
            recipientName={recipientName}
            isLoading={isCreatingConversation}
          />
        </>
      )}
    </div>
  );
}
