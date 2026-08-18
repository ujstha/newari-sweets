import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Deliberately kept as the deprecated `middleware.ts` convention rather than
// Next 16's `proxy.ts`: Proxy dropped Edge runtime support (Node.js-only,
// non-configurable), and @opennextjs/cloudflare 1.20.x doesn't support
// Node.js-runtime middleware/proxy on Workers yet ("Node.js middleware is
// not currently supported" at build time) -- Edge is required here. This is
// exactly the kind of adapter rough edge PLAN.md's Hosting section flagged
// as an accepted risk. Revisit once the adapter adds Node.js support, or
// Next.js adds an Edge option back to Proxy.
//
// TODO(phase 2 -- auth foundation): this also needs to refresh the Supabase
// session cookie (the standard @supabase/ssr middleware pattern) once
// admin_users/is_admin() land, per PLAN.md's RLS & Security section.
export default createMiddleware(routing);

export const config = {
  // Skip static files, Next.js internals, and API/RPC-style routes.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
