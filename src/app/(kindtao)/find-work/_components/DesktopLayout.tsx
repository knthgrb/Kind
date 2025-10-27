"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { JobPost } from "@/types/jobPosts";
import JobsCarousel from "./JobsCarousel";
import UpgradeBanner from "./UpgradeBanner";
import { JobService } from "@/services/client/JobService";
import { Filters } from "./FilterModal";
import FilterModal from "./FilterModal";
import JobPreferencesModal, {
  JobPreferences,
} from "@/components/modals/JobPreferencesModal";
import {
  FiFilter,
  FiMessageCircle,
  FiUsers,
  FiX,
  FiSettings,
} from "react-icons/fi";
import { useChatUI } from "@/hooks/chats/useChatUI";
import { useAuthStore } from "@/stores/useAuthStore";
import { formatTimestamp, getStatusColor } from "@/utils/chatUtils";
import { getOtherUser } from "@/utils/chatMessageUtils";
import type {
  ConversationWithDetails,
  User,
  MessageWithUser,
} from "@/types/chat";
import LoadingSpinner from "@/components/loader/LoadingSpinner";
import MatchSkeleton from "@/components/common/MatchSkeleton";
import MessageSkeleton from "@/components/common/MessageSkeleton";
import { useUnreadCounts } from "@/hooks/useUnreadCounts";
import { MatchToConversationService } from "@/services/client/MatchToConversationService";
import { MatchService } from "@/services/client/MatchService";

type MatchingScore = {
  jobId: string;
  score: number;
  reasons: string[];
  breakdown: {
    jobTypeMatch: number;
    locationMatch: number;
    salaryMatch: number;
    skillsMatch: number;
    experienceMatch: number;
    availabilityMatch: number;
    ratingBonus: number;
    recencyBonus: number;
  };
};

type DesktopLayoutProps = {
  initialJobs: JobPost[];
  initialMatchingScores: MatchingScore[];
  provinces: string[];
  jobTypes: string[];
  initialFilters: Filters;
  initialSwipeLimit: {
    remainingSwipes: number;
    dailyLimit: number;
    canSwipe: boolean;
  };
  currentPlan: string;
  pageSize: number;
};

export default function DesktopLayout({
  initialJobs,
  initialMatchingScores,
  provinces,
  jobTypes,
  initialFilters,
  initialSwipeLimit,
  currentPlan,
  pageSize,
}: DesktopLayoutProps) {
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<JobPost[]>(initialJobs);
  const [matchingScores, setMatchingScores] = useState<MatchingScore[]>(
    initialMatchingScores
  );
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showJobPreferencesModal, setShowJobPreferencesModal] = useState(false);
  const [jobPreferences, setJobPreferences] = useState<JobPreferences | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("matches");

  // Unread counts
  const { unreadCounts, refreshUnreadCounts } = useUnreadCounts();

  // Match-related state
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);

  // Chat state
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Chat UI hook
  const {
    conversations,
    isLoadingConversations,
    conversationsError,
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

  const handleFilterChange = async (newFilters: Filters) => {
    setFilters(newFilters);
    setLoading(true);
    try {
      const filteredJobs = await JobService.fetchJobsClient({
        search: newFilters.search,
        province: newFilters.province,
        radius: newFilters.radius,
        jobType: newFilters.jobType,
        limit: 20,
        offset: 0,
      });
      setJobs(filteredJobs);
      // Reset matching scores for now - in a real app you'd recalculate them
      setMatchingScores([]);
    } catch (error) {
      console.error("Failed to filter jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Chat functions
  const handleConversationSelect = useCallback(
    (conversationId: string) => {
      setSelectedConversationId(conversationId);
      selectConversation(conversationId);

      // Refresh unread counts when selecting a conversation
      refreshUnreadCounts();
    },
    [selectConversation, refreshUnreadCounts]
  );

  const handleCloseChat = useCallback(() => {
    setSelectedConversationId(null);
    selectConversation(null);
  }, [selectConversation]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversationId || isSending) return;

    try {
      await sendChatMessage(newMessage.trim());
      setNewMessage("");
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Switch to messages tab after sending
      setActiveTab("messages");

      // Refresh unread counts after sending message
      refreshUnreadCounts();
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [
    newMessage,
    selectedConversationId,
    isSending,
    sendChatMessage,
    refreshUnreadCounts,
  ]);

  // Handle match click - open chat
  const handleMatchClick = useCallback(
    async (match: any) => {
      try {
        // Mark match as inactive (opened)
        await MatchService.markMatchAsInactive(match.id);

        // Get or create conversation for this match
        const result = await MatchToConversationService.getOrCreateConversation(
          match.id
        );

        if (result.success && result.conversationId) {
          // Switch to messages tab and select the conversation
          setActiveTab("messages");
          setSelectedConversationId(result.conversationId);
          selectConversation(result.conversationId);

          // Refresh unread counts after opening match
          refreshUnreadCounts();
        } else {
          console.error("Failed to create conversation:", result.error);
        }
      } catch (error) {
        console.error("Failed to open match chat:", error);
      }
    },
    [selectConversation, refreshUnreadCounts]
  );

  // Auto-resize textarea
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNewMessage(e.target.value);

      // Auto-resize
      const textarea = e.target;
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 120; // Max height in pixels (about 5-6 lines)

      if (scrollHeight <= maxHeight) {
        textarea.style.height = `${scrollHeight}px`;
      } else {
        textarea.style.height = `${maxHeight}px`;
      }
    },
    []
  );

  // Handle keyboard events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load matches when component mounts
  useEffect(() => {
    const loadMatches = async () => {
      if (!user?.id) return;

      setMatchesLoading(true);
      try {
        const userMatches = await MatchService.getUserMatches(user.id);

        // Fetch job details for each match
        const matchesWithJobs = await Promise.all(
          userMatches.map(async (match) => {
            try {
              const jobDetails = await JobService.fetchById(match.job_post_id);
              return {
                ...match,
                job_title: jobDetails?.title || "Unknown Job",
                job_location: jobDetails?.location || "Unknown Location",
              };
            } catch (error) {
              console.error(
                "Failed to fetch job details for match:",
                match.id,
                error
              );
              return {
                ...match,
                job_title: "Unknown Job",
                job_location: "Unknown Location",
              };
            }
          })
        );

        setMatches(matchesWithJobs);

        // Refresh unread counts after loading matches
        refreshUnreadCounts();
      } catch (error) {
        console.error("Failed to load matches:", error);
      } finally {
        setMatchesLoading(false);
      }
    };

    loadMatches();
  }, [user?.id, refreshUnreadCounts]);

  // Memoize sorted conversations
  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const aTime = new Date(a.last_message_at || a.created_at).getTime();
      const bTime = new Date(b.last_message_at || b.created_at).getTime();
      return bTime - aTime;
    });
  }, [conversations]);

  // Use real unread counts
  const newMatchesCount = unreadCounts.newMatches;
  const newMessagesCount = unreadCounts.unreadMessages;

  return (
    <div className="flex flex-col md:flex-row overflow-hidden h-[calc(100vh-8vh)] bg-gray-50">
      {/* Left Sidebar - Tinder-like - Hidden on mobile */}
      <div className="hidden md:flex w-80 bg-white border-r border-gray-200 flex-col">
        {/* Navigation Tabs */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("matches")}
              className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === "matches"
                  ? "text-[#CC0000] border-b-2 border-[#CC0000]"
                  : "text-gray-600 hover:text-gray-900 rounded-lg"
              }`}
            >
              <FiUsers className="w-4 h-4" />
              Matches
              {newMatchesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {newMatchesCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`flex-1 cursor-pointer flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors relative ${
                activeTab === "messages"
                  ? "text-[#CC0000] border-b-2 border-[#CC0000]"
                  : "text-gray-600 hover:text-gray-900 rounded-lg"
              }`}
            >
              <FiMessageCircle className="w-4 h-4" />
              Messages
              {newMessagesCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#CC0000] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {newMessagesCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "matches" && (
            <div className="p-2">
              {matchesLoading ? (
                <MatchSkeleton />
              ) : matches.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <FiUsers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No matches yet</p>
                  <p className="text-sm">
                    Start swiping to find your perfect job!
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {matches.map((match) => (
                    <div
                      key={match.id}
                      onClick={() => handleMatchClick(match)}
                      className="flex items-center p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg"
                    >
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <FiUsers className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {match.job_title || `Match #${match.id.slice(0, 8)}`}
                        </h4>
                        <p className="text-xs text-gray-500 truncate">
                          {match.job_location || "Unknown Location"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(match.matched_at).toLocaleDateString()}
                        </p>
                      </div>
                      {match.is_active && (
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "messages" && (
            <div>
              {isLoadingConversations ? (
                <MessageSkeleton />
              ) : conversationsError ? (
                <div className="text-center text-red-500 py-4">
                  Error loading conversations: {conversationsError.message}
                </div>
              ) : sortedConversations.length === 0 ? (
                <div className="text-center text-gray-500 py-6">
                  <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No messages yet</p>
                  <p className="text-sm">Start swiping to find matches!</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {sortedConversations.map((conversation) => {
                    if (!user) return null;

                    const otherUser = getOtherUser(conversation, user.id);
                    const isActive = selectedConversationId === conversation.id;

                    return (
                      <div
                        key={conversation.id}
                        onClick={() =>
                          handleConversationSelect(conversation.id)
                        }
                        className={`flex items-center p-2 cursor-pointer hover:bg-gray-100 transition-colors ${
                          isActive ? "bg-gray-200" : ""
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={
                              otherUser.profile_image_url ||
                              "/people/user-profile.png"
                            }
                            alt={`${otherUser.first_name} ${otherUser.last_name}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                              false
                            )}`}
                          />
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {`${otherUser.first_name} ${otherUser.last_name}`}
                          </h4>
                          <p className="text-xs text-gray-500 truncate">
                            {conversation.last_message_at
                              ? "Last message"
                              : "No messages yet"}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 ml-1 whitespace-nowrap">
                          {conversation.last_message_at
                            ? formatTimestamp(
                                conversation.last_message_at,
                                "sidebar"
                              )
                            : ""}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {activeTab === "matches" ? (
          /* Job Cards Area */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Job Swiper - Full Height */}
            <div className="flex-1 flex items-center justify-center p-1 md:p-4">
              <div className="w-full max-w-sm md:max-w-md h-full flex items-center justify-center">
                <JobsCarousel
                  jobs={jobs}
                  matchingScores={matchingScores}
                  initialSwipeLimit={initialSwipeLimit}
                  onOpenFilters={() => setShowFilterModal(true)}
                  onOpenJobPreferences={() => setShowJobPreferencesModal(true)}
                />
              </div>
            </div>
          </div>
        ) : activeTab === "messages" &&
          selectedConversationId &&
          selectedConversation ? (
          /* Chat Interface */
          <div className="flex-1 flex h-full">
            {/* Left: Chat Column */}
            <div className="flex-1 flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 flex-shrink-0 bg-white border-b border-gray-200">
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={
                        otherUser?.profile_image_url ||
                        "/people/user-profile.png"
                      }
                      alt={`${otherUser?.first_name} ${otherUser?.last_name}`}
                      className="w-10 h-10 rounded-full"
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        false
                      )}`}
                    />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {`${otherUser?.first_name} ${otherUser?.last_name}`}
                    </h3>
                    <p className="text-xs text-gray-500">Offline</p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={handleCloseChat}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  title="Close chat"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Messages Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#f5f6fa]">
                {isLoadingMessages && messages.length === 0 ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="sm" variant="minimal" />
                  </div>
                ) : messagesError ? (
                  <div className="text-center text-red-500 py-4">
                    Error loading messages: {messagesError.message}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <FiMessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <>
                    {/* Load more trigger for infinite scroll */}
                    {hasMore && (
                      <div
                        ref={loadMoreRef}
                        className="h-1 w-full"
                        onClick={() => loadMore()}
                      >
                        {isLoadingMore && (
                          <LoadingSpinner size="sm" variant="minimal" />
                        )}
                      </div>
                    )}

                    {messages.map((msg, index) => {
                      const isSent = msg.sender_id === user?.id;
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
                              className={`text-sm mt-1 pb-3 flex items-center justify-between gap-2 ${
                                isSent ? "text-white" : "text-[#757589]"
                              }`}
                            >
                              <span className="font-bold">{`${sender.first_name} ${sender.last_name}`}</span>
                              <span>
                                {formatTimestamp(msg.created_at, "chat")}
                              </span>
                            </p>
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
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

              {/* Message Input */}
              <div className="p-3 flex items-center gap-2 bg-[#f5f6fa] relative flex-shrink-0">
                {isSending && (
                  <div className="absolute inset-0 bg-gray-300/30 backdrop-blur-[1px] z-10 rounded-lg" />
                )}

                <div className="flex-1 flex items-center bg-white rounded-lg px-3 py-2 border border-gray-200">
                  <textarea
                    ref={textareaRef}
                    placeholder="Type message here... (Shift+Enter for new line)"
                    disabled={isSending}
                    rows={1}
                    className={`flex-1 outline-none text-sm text-[#757589] resize-none overflow-y-auto ${
                      isSending ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    style={{
                      minHeight: "20px",
                      maxHeight: "120px",
                    }}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>

                <button
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className={`rounded-lg w-[40px] h-[40px] flex items-center justify-center ${
                    isSending || !newMessage.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-500 cursor-pointer"
                  }`}
                >
                  <img src="/icons/send.png" alt="send" className="w-3 h-4" />
                </button>
              </div>
              {/* Close left chat column */}
            </div>

            {/* Right: Profile Panel */}
            <aside className="w-80 border-l border-gray-200 bg-white flex flex-col h-full">
              {/* Profile header */}
              <div className="p-4 border-b border-gray-100">
                <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img
                    src={
                      otherUser?.profile_image_url || "/people/user-profile.png"
                    }
                    alt={`${otherUser?.first_name || ""} ${
                      otherUser?.last_name || ""
                    }`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3">
                  <h2 className="text-base font-semibold text-gray-900">
                    {`${otherUser?.first_name || ""} ${
                      otherUser?.last_name || ""
                    }`.trim() || "User"}
                  </h2>
                  {otherUser?.city || otherUser?.province ? (
                    <p className="text-sm text-gray-500">
                      {[otherUser?.city, otherUser?.province]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Basic info list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {otherUser?.email && (
                  <div className="text-sm">
                    <p className="text-gray-500">Email</p>
                    <p className="text-gray-800 break-all">{otherUser.email}</p>
                  </div>
                )}
                {otherUser?.address && (
                  <div className="text-sm">
                    <p className="text-gray-500">Address</p>
                    <p className="text-gray-800">{otherUser.address}</p>
                  </div>
                )}

                {/* Actions - Only show if we have user data */}
                {otherUser && (
                  <div className="pt-4 space-y-2">
                    <button
                      type="button"
                      className="w-full py-2.5 text-sm font-medium rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors"
                      onClick={() => console.log("Unmatch clicked")}
                    >
                      Unmatch
                    </button>
                    <button
                      type="button"
                      className="w-full py-2.5 text-sm font-medium rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      onClick={() => console.log("Block clicked")}
                    >
                      Block User
                    </button>
                    <button
                      type="button"
                      className="w-full py-2.5 text-sm font-medium rounded-lg bg-white text-red-600 hover:bg-gray-50 transition-colors border border-red-200"
                      onClick={() => console.log("Report clicked")}
                    >
                      Report User
                    </button>
                  </div>
                )}
              </div>
            </aside>
          </div>
        ) : activeTab === "messages" ? (
          /* Show job swipe UI when no conversation is selected in messages tab */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            {/* Job Swiper - Full Height */}
            <div className="flex-1 flex items-center justify-center p-1 md:p-4">
              <div className="w-full max-w-sm md:max-w-md h-full flex items-center justify-center">
                <JobsCarousel
                  jobs={jobs}
                  matchingScores={matchingScores}
                  initialSwipeLimit={initialSwipeLimit}
                  onOpenFilters={() => setShowFilterModal(true)}
                  onOpenJobPreferences={() => setShowJobPreferencesModal(true)}
                />
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Job Preferences Modal */}
      <JobPreferencesModal
        isOpen={showJobPreferencesModal}
        onClose={() => setShowJobPreferencesModal(false)}
        onSave={(preferences) => {
          setJobPreferences(preferences);
          // TODO: Apply job preferences to filter jobs
          console.log("Job preferences saved:", preferences);
        }}
        initialPreferences={jobPreferences || undefined}
      />
    </div>
  );
}
