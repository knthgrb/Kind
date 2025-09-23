"use client";

import { FaTimes, FaClock, FaCrown, FaGift } from "react-icons/fa";

type SwipeLimitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  remainingSwipes: number;
  dailyLimit: number;
  onUpgrade?: () => void;
};

export default function SwipeLimitModal({
  isOpen,
  onClose,
  remainingSwipes,
  dailyLimit,
  onUpgrade,
}: SwipeLimitModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <FaClock className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Daily Swipe Limit Reached
          </h2>
          <p className="text-gray-600 mb-6">
            You've used all {dailyLimit} of your daily swipes. Upgrade to get unlimited swipes!
          </p>

          {/* Swipe counter */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Swipes used today:</span>
              <span className="font-semibold text-gray-900">
                {dailyLimit - remainingSwipes} / {dailyLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((dailyLimit - remainingSwipes) / dailyLimit) * 100}%` }}
              />
            </div>
          </div>

          {/* Benefits of upgrading */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
              <FaCrown className="w-4 h-4 mr-2" />
              Upgrade Benefits
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Unlimited daily swipes
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Priority job matching
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Advanced filters
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Premium support
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            {onUpgrade && (
              <button
                onClick={onUpgrade}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-[#CC0000] to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg"
              >
                <FaGift className="w-4 h-4" />
                <span>Upgrade Now - ₱99/month</span>
              </button>
            )}
            
            <button
              onClick={onClose}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          {/* Additional info */}
          <p className="text-xs text-gray-500 mt-4">
            Your daily swipe limit resets at midnight
          </p>
        </div>
      </div>
    </div>
  );
}
