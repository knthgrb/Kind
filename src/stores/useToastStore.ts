import { create } from "zustand";

export type ToastType = "success" | "error" | "info" | "warning";

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
  maxToasts: number;
  defaultDuration: number;

  // Actions
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Convenience methods
  showSuccess: (message: string, duration?: number) => string;
  showError: (message: string, duration?: number) => string;
  showInfo: (message: string, duration?: number) => string;
  showWarning: (message: string, duration?: number) => string;
}

const generateId = () =>
  `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  maxToasts: 3,
  defaultDuration: 4000, // 4 seconds default

  addToast: (toast: Omit<Toast, "id">): string => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? get().defaultDuration,
    };

    set((state) => {
      const currentToasts = state.toasts;

      // If we have space, add directly
      if (currentToasts.length < state.maxToasts) {
        return { toasts: [...currentToasts, newToast] };
      } else {
        // Remove oldest toast and add new one
        const updatedToasts = [...currentToasts.slice(1), newToast];
        return { toasts: updatedToasts };
      }
    });

    // Auto remove after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },

  clearAllToasts: () => {
    set({ toasts: [] });
  },

  showSuccess: (message: string, duration?: number) => {
    return get().addToast({
      type: "success",
      message,
      duration,
    });
  },

  showError: (message: string, duration?: number) => {
    return get().addToast({
      type: "error",
      message,
      duration,
    });
  },

  showInfo: (message: string, duration?: number) => {
    return get().addToast({
      type: "info",
      message,
      duration,
    });
  },

  showWarning: (message: string, duration?: number) => {
    return get().addToast({
      type: "warning",
      message,
      duration,
    });
  },
}));

// Selector hooks for better performance
export const useToasts = () => useToastStore((state) => state.toasts);

// Individual action selectors
export const useAddToast = () => useToastStore((state) => state.addToast);
export const useRemoveToast = () => useToastStore((state) => state.removeToast);
export const useClearAllToasts = () =>
  useToastStore((state) => state.clearAllToasts);
export const useShowSuccess = () => useToastStore((state) => state.showSuccess);
export const useShowError = () => useToastStore((state) => state.showError);
export const useShowInfo = () => useToastStore((state) => state.showInfo);
export const useShowWarning = () => useToastStore((state) => state.showWarning);

// Combined actions hook
export const useToastActions = () => {
  return {
    addToast: useAddToast(),
    removeToast: useRemoveToast(),
    clearAllToasts: useClearAllToasts(),
    showSuccess: useShowSuccess(),
    showError: useShowError(),
    showInfo: useShowInfo(),
    showWarning: useShowWarning(),
  };
};
