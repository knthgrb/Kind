import { User } from "@/types/user";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { logger } from "@/utils/logger";
import { createClient } from "@/utils/supabase/client";

interface State {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  initialized: boolean;

  initializeAuth: () => () => void; // Return cleanup function
  setUser: (user: User | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      isAuthenticated: false,
      initialized: false,

      initializeAuth: () => {
        const state = get();
        if (state.initialized) return () => {}; // Return empty cleanup function

        const supabase = createClient();

        // Set up the auth state listener
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session?.user) {
            // Handle both INITIAL_SESSION and SIGNED_IN the same way
            set({
              user: session.user as User,
              isAuthenticated: true,
              loading: false,
              initialized: true,
            });
          } else if (event === "SIGNED_OUT") {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
              initialized: true,
            });
          }
        });

        // Mark as initialized to prevent multiple calls
        set({ initialized: true });

        // Return cleanup function
        return () => {
          subscription.unsubscribe();
        };
      },

      setUser: (user: User | null) => set({ user }),
      setIsAuthenticated: (isAuthenticated: boolean) =>
        set({ isAuthenticated }),
      setLoading: (loading: boolean) => set({ loading }),

      signOut: async () => {
        const supabase = createClient();
        const { error } = await supabase.auth.signOut();
        if (error) {
          logger.error("Error signing out:", error);
          return;
        }
      },
    }),

    {
      name: "auth-storage",
      partialize: (state: State) => ({
        user: state.user
          ? {
              id: state.user.id,
              user_metadata: state.user.user_metadata
                ? {
                    role: state.user.user_metadata.role,
                    first_name: state.user.user_metadata.first_name,
                    last_name: state.user.user_metadata.last_name,
                    email: state.user.user_metadata.email,
                    phone: state.user.user_metadata.phone,
                    profile_image_url:
                      state.user.user_metadata.profile_image_url,
                  }
                : undefined,
              app_metadata: state.user.app_metadata
                ? {
                    provider: state.user.app_metadata.provider,
                    providers: state.user.app_metadata.providers,
                  }
                : undefined,
            }
          : null,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.loading = false;
        }
      },
    }
  )
);
