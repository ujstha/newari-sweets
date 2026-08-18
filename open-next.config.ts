import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Deliberately minimal for Phase 1 -- no incrementalCache override (no R2
// bucket dependency), keeping the Next.js feature surface modest per
// PLAN.md's accepted-risk note on the OpenNext/Cloudflare adapter.
export default defineCloudflareConfig({});
