import { createClient } from "@/utils/supabase/client";

export const AuthService = {
  async signOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error: error || null };
  },

  async signInWithGoogle(redirectTo: string) {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });
    return { error: error || null };
  },
};
