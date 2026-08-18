import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getServerEnv, publicEnv } from "@/lib/env";

// Service-role client -- bypasses RLS entirely. Server-only, and only for
// the few cases RLS genuinely can't express (see PLAN.md's RLS & Security
// section, e.g. the future payment webhook). Never import this from a
// Client Component, never expose its result to the browser, and prefer
// src/lib/supabase/server.ts (RLS-scoped) for everything else.
export async function createAdminClient() {
  const { supabaseServiceRoleKey } = await getServerEnv();

  return createSupabaseClient(publicEnv.supabaseUrl, supabaseServiceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
