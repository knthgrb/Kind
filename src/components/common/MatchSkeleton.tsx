"use client";

export default function MatchSkeleton() {
  return (
    <div className="p-2">
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center p-3 rounded-lg">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse mr-3"></div>
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
            </div>
            <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
