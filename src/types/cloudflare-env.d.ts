// Augments the global `CloudflareEnv` interface that `@opennextjs/cloudflare`'s
// `getCloudflareContext().env` is typed against (see src/lib/env.ts). This is
// deliberately hand-written rather than sourced from the `wrangler types`
// output (`worker-configuration.d.ts`): that file infers literal `""` types
// from wrangler.jsonc's current placeholder values and doesn't know about
// secrets (which aren't declared in wrangler.jsonc at all) -- neither is
// useful here.
export {};

declare global {
  interface CloudflareEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    // Secrets -- set via `wrangler secret put <NAME>` (and `--env staging`),
    // never present in wrangler.jsonc or any committed file.
    SUPABASE_SERVICE_ROLE_KEY: string;
    RESEND_API_KEY: string;
  }
}
