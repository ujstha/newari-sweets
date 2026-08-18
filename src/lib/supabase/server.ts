import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { publicEnv } from "@/lib/env";

// Server client (anon key, RLS-scoped) for Server Components, Server
// Actions, and Route Handlers. Always create a new instance per request --
// never share one across requests.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component, which can't set cookies.
          // middleware.ts refreshes the session on every request instead,
          // so this is safe to ignore -- see PLAN.md's RLS & Security
          // section.
        }
      },
    },
  });
}
