import { type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { publicEnv } from "./lib/env";

// Deliberately kept as the deprecated `middleware.ts` convention rather than
// Next 16's `proxy.ts`: Proxy dropped Edge runtime support (Node.js-only,
// non-configurable), and @opennextjs/cloudflare 1.20.x doesn't support
// Node.js-runtime middleware/proxy on Workers yet ("Node.js middleware is
// not currently supported" at build time) -- Edge is required here. This is
// exactly the kind of adapter rough edge PLAN.md's Hosting section flagged
// as an accepted risk. Revisit once the adapter adds Node.js support, or
// Next.js adds an Edge option back to Proxy.
const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Runs first so its rewrites/redirects (locale detection) are what the
  // Supabase cookie refresh below attaches to.
  const response = intlMiddleware(request);

  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Refreshes the auth session cookie (if needed) so Server Components see
  // a valid session -- see PLAN.md's RLS & Security section. Must be
  // getUser(), not getSession(): getSession() only reads the local cookie
  // without revalidating against Supabase, so an expired/tampered session
  // wouldn't be caught here.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  // Skip static files, Next.js internals, and API/RPC-style routes.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
