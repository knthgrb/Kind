import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  UnreadCountService,
  UnreadCounts,
} from "@/services/client/UnreadCountService";

export interface UseUnreadCountsReturn {
  unreadCounts: UnreadCounts;
  isLoading: boolean;
  error: Error | null;
  refreshUnreadCounts: () => Promise<void>;
}

export function useUnreadCounts(): UseUnreadCountsReturn {
  const { user } = useAuthStore();
  const [unreadCounts, setUnreadCounts] = useState<UnreadCounts>({
    newMatches: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadUnreadCounts = useCallback(async () => {
    if (!user?.id) {
      setUnreadCounts({
        newMatches: 0,
        unreadMessages: 0,
        unreadNotifications: 0,
      });
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const counts = await UnreadCountService.getUnreadCounts(user.id);
      setUnreadCounts(counts);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const refreshUnreadCounts = useCallback(async () => {
    await loadUnreadCounts();
  }, [loadUnreadCounts]);

  // Load unread counts when user changes
  useEffect(() => {
    loadUnreadCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadUnreadCounts();
    }, 30000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    unreadCounts,
    isLoading,
    error,
    refreshUnreadCounts,
  };
}
