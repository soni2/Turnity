"use client";

import { createClient } from "./supabase/client";

export const auth = {
  loginWithGoogle: async (next?: string) => {
    const supabase = createClient();
    const redirectUrl = new URL(`${window.location.origin}/api/auth/callback`);
    if (next) {
      redirectUrl.searchParams.set("next", next);
    }

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });
  },

  loginWithEmail: async (email: string, password: string) => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  },

  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  },
};
