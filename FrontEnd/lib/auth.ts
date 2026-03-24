"use client";

import { createClient } from "./supabase/client";

export const auth = {
  loginWithGoogle: async () => {
    const supabase = createClient();

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  },
};
