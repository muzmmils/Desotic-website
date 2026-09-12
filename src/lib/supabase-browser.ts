import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { env } from "./env";

let client: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
      env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
    );
  }
  return client;
}
