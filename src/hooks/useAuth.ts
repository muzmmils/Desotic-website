import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase-browser";
import type { Database } from "@/lib/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      try {
        const {
          data: { session: initialSession },
        } = await supabase.auth.getSession();

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          if (initialSession?.user) {
            fetchProfile(initialSession.user.id);
          } else {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Failed getting auth session:", err);
        if (mounted) setIsLoading(false);
      }
    }

    async function fetchProfile(userId: string) {
      try {
        const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
        if (mounted && data) {
          setProfile(data);
        }
      } catch (err) {
        console.error("Failed fetching profile:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          fetchProfile(newSession.user.id);
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  return {
    user,
    session,
    profile,
    isLoading,
    isAuthenticated: Boolean(user),
    signOut,
  };
}
