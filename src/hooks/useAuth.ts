import { supabase } from "@/lib/supabase";
import type { Profile, UserRole } from "@/types";

export function useAuth() {
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: UserRole = "corretor") => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      // no instalador (file://) não há URL própria: usa a "Site URL" configurada no Supabase
      redirectTo: window.location.protocol === "file:" ? undefined : `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const getProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return { data: data as Profile | null, error };
  };

  const updateProfile = async (userId: string, updates: Partial<Profile>) => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", userId)
      .select()
      .single();
    return { data, error };
  };

  return {
    signIn,
    signUp,
    signOut,
    resetPassword,
    getProfile,
    updateProfile,
    supabase,
  };
}
