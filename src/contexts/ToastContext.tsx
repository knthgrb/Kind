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
   * @param message - The message to display (used as title)
   * @param type - The type of toast
   * @param duration - Optional duration in milliseconds
   */
  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info",
    duration?: number
  ) => {
    const toastOptions = duration ? { duration } : undefined;

    switch (type) {
      case "success":
        showSuccess(message, undefined, toastOptions);
        break;
      case "error":
        showError(message, undefined, toastOptions);
        break;
      case "warning":
        showWarning(message, undefined, toastOptions);
        break;
      case "info":
      default:
        showInfo(message, undefined, toastOptions);
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
