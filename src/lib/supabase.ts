const supabaseUrl = (typeof process !== "undefined" ? process.env.VITE_SUPABASE_URL : import.meta.env.VITE_SUPABASE_URL) || "";
const supabaseAnonKey = (typeof process !== "undefined" ? process.env.VITE_SUPABASE_ANON_KEY : import.meta.env.VITE_SUPABASE_ANON_KEY) || "";

export const hasCredentials = Boolean(supabaseUrl && supabaseAnonKey);

type Database = import("./types").Database;
type SupabaseClient = import("@supabase/supabase-js").SupabaseClient<Database>;

let client: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient> | null = null;

export async function getSupabase(): Promise<SupabaseClient> {
  if (client) return client;
  if (initPromise) return initPromise;

  if (!hasCredentials) {
    throw new Error(
      "Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    );
  }

  initPromise = (async () => {
    const { createClient } = await import("@supabase/supabase-js");
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    });
    return client;
  })();

  return initPromise;
}
