import { env } from "./env";

const url = env.VITE_SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY;

import { getSupabaseBrowserClient } from "./supabase-browser";

export const isSupabaseConfigured = Boolean(url && anonKey);

if (!isSupabaseConfigured && typeof window !== "undefined") {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY are not set. Add them to .env to enable data features.",
  );
}

export const supabase = getSupabaseBrowserClient();
export { getSupabaseBrowserClient } from "./supabase-browser";
export { getSupabaseServerClient } from "./supabase-server";
