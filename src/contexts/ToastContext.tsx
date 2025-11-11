"use client";

import {
  useToastActions,
  useShowSuccess,
  useShowError,
  useShowInfo,
  useShowWarning,
} from "@/stores/useToastStore";

/**
 * Backward-compatible hook that wraps the Zustand toast store
 * Provides a simple API for showing toasts
 */
export function useToast() {
  const showSuccess = useShowSuccess();
  const showError = useShowError();
  const showInfo = useShowInfo();
  const showWarning = useShowWarning();
  const addToast = useToastActions().addToast;

  /**
   * Simple toast function for backward compatibility
   * @param message - The message to display
   * @param type - The type of toast
   * @param duration - Optional duration in milliseconds
   */
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    duration?: number
  ) => {
    switch (type) {
      case "success":
        showSuccess(message, duration);
        break;
      case "error":
        showError(message, duration);
        break;
      case "warning":
        showWarning(message, duration);
        break;
      case "info":
      default:
        showInfo(message, duration);
        break;
    }
  };

  return {
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    addToast,
  };
}

/**
 * ToastProvider is no longer needed since we use Zustand
 * This is kept for backward compatibility but does nothing
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
