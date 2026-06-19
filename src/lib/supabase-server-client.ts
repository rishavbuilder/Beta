import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL) || "";
const supabaseAnonKey = (typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY) || "";
const AUTH_COOKIE_NAME = "sb-access-token";

let anonClient: ReturnType<typeof createClient> | null = null;

export function getServerSupabase() {
  if (!anonClient) {
    anonClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return anonClient;
}

export async function getAuthToken() {
  try {
    const { getCookie } = await import("@tanstack/start-server-core/request-response");
    return getCookie(AUTH_COOKIE_NAME) || null;
  } catch {
    return null;
  }
}

export function getServerSupabaseWithAuth(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}
