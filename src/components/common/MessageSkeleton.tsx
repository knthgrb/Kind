"use client";

export default function MessageSkeleton() {
  return (
    <div className="space-y-1 p-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex items-center p-2 rounded-lg">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-200 rounded-full animate-pulse"></div>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-12 ml-1"></div>
        </div>
      ))}
    </div>
  );
}
