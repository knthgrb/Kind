"use client";

import { useState } from "react";
import { Application } from "@/types/application";
import { UserProfile } from "@/types/userProfile";
import { JobPost } from "@/types/jobPosts";
import { FaTimes, FaEnvelope, FaClock } from "react-icons/fa";

interface SwipeActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  kindtaoProfile: UserProfile;
  jobDetails: JobPost | null;
  onMessage: () => void;
  onSaveForLater: () => void;
}

export default function SwipeActionModal({
  isOpen,
  onClose,
  application,
  kindtaoProfile,
  jobDetails,
  onMessage,
  onSaveForLater,
}: SwipeActionModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: () => void) => {
    if (!action || typeof action !== "function") {
      console.error("Invalid action function");
      return;
    }
    setIsProcessing(true);
    try {
      await action();
      onClose();
    } catch (error) {
      console.error("Error processing action:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen || !application || !kindtaoProfile) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Great Match! 🎉</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            You've matched with an applicant! What would you like to do?
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Candidate Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <img
                src={
                  kindtaoProfile?.profile_image_url ||
                  "/people/user-profile.png"
                }
                alt="Applicant"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-semibold text-gray-900">Applicant</h3>
                <p className="text-sm text-gray-600">
                  {jobDetails?.job_title || "Job Candidate"}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleAction(onMessage)}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-[#CC0000] text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              <FaEnvelope className="w-5 h-5" />
              <span className="font-medium">Start Messaging</span>
            </button>

            <button
              onClick={() => handleAction(onSaveForLater)}
              disabled={isProcessing}
              className="w-full flex items-center justify-center space-x-3 p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              <FaClock className="w-5 h-5" />
              <span className="font-medium">Save for Later</span>
            </button>
          </div>

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#CC0000]"></div>
                <span className="text-gray-600">Processing...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
