import { createServerClient, parseCookieHeader, serializeCookieHeader } from "@supabase/ssr";
import type { Database } from "./database.types";
import { env } from "./env";

export function getSupabaseServerClient(request: Request) {
  const headers = new Headers();

  const supabase = createServerClient<Database>(
    env.VITE_SUPABASE_URL || "https://placeholder.supabase.co",
    env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key",
    {
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("Cookie") ?? "");
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            headers.append("Set-Cookie", serializeCookieHeader(name, value, options));
          });
        },
      },
    },
  );

  return { supabase, headers };
}
