import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Simple connecting animation */}
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="w-3 h-3 bg-[#CC0000] rounded-full animate-bounce"></div>
        <div
          className="w-3 h-3 bg-[#CC0000] rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-3 h-3 bg-[#CC0000] rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
}
