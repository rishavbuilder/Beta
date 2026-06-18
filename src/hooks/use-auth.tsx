import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getSupabase, hasCredentials } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

const AUTH_COOKIE_NAME = "sb-access-token";

function syncAuthCookie(session: Session) {
  try {
    document.cookie = `${AUTH_COOKIE_NAME}=${session.access_token}; path=/; SameSite=Lax; max-age=${60 * 60}`;
  } catch {}
}

function clearAuthCookie() {
  try {
    document.cookie = `${AUTH_COOKIE_NAME}=; path=/; SameSite=Lax; max-age=0`;
  } catch {}
}

interface AuthContextValue {
  user: User | null;
  profile: import("@/lib/types").User | null;
  loading: boolean;
  creatorMode: boolean;
  setCreatorMode: (v: boolean) => void;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, username: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<import("@/lib/types").User | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatorMode, setCreatorMode] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("creator_mode") !== "false";
  });

  useEffect(() => {
    if (!hasCredentials) {
      setLoading(false);
      return;
    }

    let unsub: (() => void) | undefined;

    getSupabase()
      .then((supabase) => {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
            syncAuthCookie(session);
          }
          setLoading(false);
        });

        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) {
            fetchProfile(session.user.id);
            syncAuthCookie(session);
          } else {
            setProfile(null);
            clearAuthCookie();
          }
        });

        unsub = () => subscription.unsubscribe();
      })
      .catch(() => setLoading(false));

    return () => unsub?.();
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const supabase = await getSupabase();
      const { data } = await supabase.from("users").select("*").eq("id", userId).single();
      if (data) setProfile(data as unknown as import("@/lib/types").User);
    } catch {
      /* ignore */
    }
  }

  async function signIn(_email: string, _password: string): Promise<string | null> {
    if (!hasCredentials)
      return "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: _email,
        password: _password,
      });
      if (error) return error.message;
      if (!data?.session) return "Login failed: no session returned. Check if email is confirmed.";
      syncAuthCookie(data.session);
      return null;
    } catch (e) {
      console.error("signIn error:", e);
      return "Authentication service unavailable. Check Supabase credentials.";
    }
  }

  async function signUp(
    _email: string,
    _password: string,
    _username: string,
  ): Promise<string | null> {
    if (!hasCredentials)
      return "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.";
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email: _email,
        password: _password,
        options: { data: { username: _username } },
      });
      if (error) return error.message;
      if (!data?.user) return "Signup failed: no user returned.";
      return null;
    } catch (e) {
      console.error("signUp error:", e);
      return "Authentication service unavailable. Check Supabase credentials.";
    }
  }

  async function signOut() {
    if (!hasCredentials) return;
    try {
      const supabase = await getSupabase();
      await supabase.auth.signOut();
      clearAuthCookie();
    } catch {
      /* ignore */
    }
  }

  async function signInWithGoogle() {
    if (!hasCredentials) return;
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({ provider: "google" });
    } catch {
      /* ignore */
    }
  }

  async function signInWithGitHub() {
    if (!hasCredentials) return;
    try {
      const supabase = await getSupabase();
      await supabase.auth.signInWithOAuth({ provider: "github" });
    } catch {
      /* ignore */
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        creatorMode,
        setCreatorMode: (v: boolean) => {
          setCreatorMode(v);
          localStorage.setItem("creator_mode", String(v));
        },
        signIn,
        signUp,
        signOut,
        signInWithGoogle,
        signInWithGitHub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
