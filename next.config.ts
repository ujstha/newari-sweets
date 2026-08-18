import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Exposes Cloudflare bindings (env vars/secrets) to `next dev`, mirroring
// what's available in the deployed Worker. See PLAN.md's Deployment section.
initOpenNextCloudflareForDev();

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  images: {
    // No Vercel-style image optimizer on Cloudflare Workers. Phase 1
    // pre-resizes/compresses images client-side on admin upload instead.
    // See PLAN.md's Deployment section.
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
