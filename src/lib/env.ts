/**
 * Centralized, typed access to environment configuration. Import from here
 * instead of reading `process.env`/Cloudflare bindings directly elsewhere --
 * one place to see everything the app needs, and one place that documents
 * which of the two access patterns below applies to a given var.
 *
 * This stack requires TWO different patterns, and mixing them up fails
 * silently in production (works in `next dev`, breaks on the deployed
 * Worker) -- see README's "Environment variables" section for the full
 * explanation:
 *
 * 1. `NEXT_PUBLIC_*` vars are inlined into the JS bundle by Next.js at BUILD
 *    time, so reading them via `process.env` works everywhere (client,
 *    server, and the deployed Cloudflare Worker). Use `publicEnv` below.
 *
 * 2. Server-only secrets (never `NEXT_PUBLIC_`-prefixed) are Cloudflare
 *    Worker bindings, NOT process env vars -- `process.env.X` for these is
 *    empty on the deployed Worker. They're read via
 *    `getCloudflareContext().env.X` instead, which also works in `next dev`
 *    because of `initOpenNextCloudflareForDev()` in next.config.ts. Use
 *    `getServerEnv()` below, only from server-side code (Server Components,
 *    Server Actions, Route Handlers) -- never from a Client Component.
 */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
};

export async function getServerEnv() {
  const { getCloudflareContext } = await import("@opennextjs/cloudflare");
  const { env } = await getCloudflareContext({ async: true });

  return {
    supabaseServiceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
    resendApiKey: env.RESEND_API_KEY,
  };
}
