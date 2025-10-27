"use client";

export default function ChatSkeleton() {
  return (
    <div className="flex flex-1 h-full">
      {/* Sidebar Skeleton */}
      <div className="w-64 p-3 flex flex-col shadow-[2px_0_3px_-2px_rgba(0,0,0,0.25)] z-20 h-full">
        {/* Search bar skeleton */}
        <div className="flex items-center gap-2 mb-3 bg-[#eeeef1] px-3 py-2 rounded-lg border border-dashed border-gray-300">
          <div className="w-4 h-4 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-300 rounded animate-pulse flex-1"></div>
        </div>

        {/* View New Matches button skeleton */}
        <div className="mb-4">
          <div className="w-full h-10 bg-gray-300 rounded-lg animate-pulse"></div>
        </div>

        {/* Recent Chats label skeleton */}
        <div className="mb-2">
          <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
        </div>

        {/* Conversations list skeleton */}
        <div className="flex-1 space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center space-x-3 p-2 rounded-lg"
            >
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-1">
                <div className="h-3 bg-gray-300 rounded animate-pulse w-3/4"></div>
                <div className="h-2 bg-gray-300 rounded animate-pulse w-1/2"></div>
              </div>
              <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window Skeleton */}
      <div className="flex-1 flex flex-col h-full">
        {/* Chat Header Skeleton */}
        <div className="flex items-center justify-between p-4 flex-shrink-0 bg-white border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            <div className="ml-3 space-y-1">
              <div className="h-4 bg-gray-300 rounded animate-pulse w-32"></div>
              <div className="h-3 bg-gray-300 rounded animate-pulse w-20"></div>
            </div>
          </div>
        </div>

        {/* Messages area skeleton */}
        <div className="flex-1 p-4 space-y-4 bg-[#f5f6fa]">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className={`flex ${
                index % 3 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-xs rounded-lg p-3">
                <div className="h-4 bg-gray-300 rounded animate-pulse w-24"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Message input skeleton */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 bg-gray-300 rounded-lg animate-pulse flex-1"></div>
            <div className="w-10 h-10 bg-gray-300 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
