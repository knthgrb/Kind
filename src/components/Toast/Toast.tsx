"use client";

import { useEffect, useState } from "react";
import {
  FaCheck,
  FaTimes,
  FaInfo,
  FaExclamationTriangle,
} from "react-icons/fa";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
}

export default function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose?.(), 300); // Wait for animation
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose?.(), 300);
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheck className="w-5 h-5" />;
      case "error":
        return <FaTimes className="w-5 h-5" />;
      case "warning":
        return <FaExclamationTriangle className="w-5 h-5" />;
      default:
        return <FaInfo className="w-5 h-5" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case "success":
        return "bg-green-500 text-white";
      case "error":
        return "bg-red-500 text-white";
      case "warning":
        return "bg-yellow-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${getColors()} px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 max-w-sm`}
      >
        {getIcon()}
        <span className="flex-1">{message}</span>
        <button
          onClick={handleClose}
          className="ml-2 hover:bg-white/20 rounded-full p-1 transition-colors"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
