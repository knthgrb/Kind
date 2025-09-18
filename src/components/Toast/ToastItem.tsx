"use client";

import React, { useEffect, useState } from "react";
import { useToast, Toast } from "@/contexts/ToastContext";
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoWarning,
  IoInformationCircle,
} from "react-icons/io5";

interface ToastItemProps {
  toast: Toast;
}

export default function ToastItem({ toast }: ToastItemProps) {
  const { removeToast } = useToast();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Match the exit animation duration
  };

  const getToastStyles = () => {
    const baseStyles =
      "relative shadow-lg bg-white p-4 transition-all duration-300 transform";

    if (isExiting) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    if (!isVisible) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    return `${baseStyles} translate-x-0 opacity-100`;
  };

  const getLeftBorderColor = () => {
    const colors = {
      success: "border-green-500",
      error: "border-red-500",
      warning: "border-yellow-500",
      info: "border-blue-400",
    };
    return colors[toast.type];
  };

  const getIconComponent = () => {
    const iconContainerStyles =
      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0";
    const iconStyles = "w-5 h-5 text-white";

    const getIconContainerColor = () => {
      const colors = {
        success: "bg-green-500",
        error: "bg-red-500",
        warning: "bg-yellow-500",
        info: "bg-blue-400",
      };
      return colors[toast.type];
    };

    switch (toast.type) {
      case "success":
        return (
          <div className={`${iconContainerStyles} ${getIconContainerColor()}`}>
            <IoCheckmarkCircle className={iconStyles} />
          </div>
        );
      case "error":
        return (
          <div className={`${iconContainerStyles} ${getIconContainerColor()}`}>
            <IoCloseCircle className={iconStyles} />
          </div>
        );
      case "warning":
        return (
          <div className={`${iconContainerStyles} ${getIconContainerColor()}`}>
            <IoWarning className={iconStyles} />
          </div>
        );
      case "info":
        return (
          <div className={`${iconContainerStyles} ${getIconContainerColor()}`}>
            <IoInformationCircle className={iconStyles} />
          </div>
        );
      default:
        return null;
    }
  };

  // If custom content is provided, render it instead of the default layout
  if (toast.customContent) {
    return (
      <div className={`${getToastStyles()} border-l-8 ${getLeftBorderColor()}`}>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {toast.customContent}
      </div>
    );
  }

  return (
    <div className={`${getToastStyles()} border-l-8 ${getLeftBorderColor()}`}>
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      <div className="flex items-start space-x-3 pr-6">
        {getIconComponent()}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
          {toast.message && (
            <p className="text-sm text-gray-600 mt-1">{toast.message}</p>
          )}

          {toast.action && (
            <button
              onClick={() => {
                toast.action!.onClick();
                handleClose();
              }}
              className="mt-2 text-sm font-medium text-[#cc0000] hover:text-red-800 hover:underline focus:outline-none focus:underline"
            >
              {toast.action.label}
            </button>
          )}
        </div>
      </div>

      {/* Progress bar for timed notifications */}
      {toast.duration && toast.duration > 0 && !toast.persistent && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200 overflow-hidden">
          <div
            className={`h-full transition-all ease-linear ${getLeftBorderColor()}`}
            style={{
              animation: `shrink ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
