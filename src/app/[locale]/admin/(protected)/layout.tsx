import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

// Force every admin route to render fresh on every request -- these pages
// show live business data an admin just edited, and must never serve a
// cached response (observed in dev testing: without this, a manual browser
// reload could show a stale value briefly even though the DB and the
// in-place post-save UI update were always correct).
export const dynamic = "force-dynamic";

// Route-group layout (`(protected)`) so /admin/login sits outside this gate
// -- a flat admin/layout.tsx covering login too would redirect-loop.
export default async function AdminProtectedLayout({ children }: LayoutProps<"/[locale]/admin">) {
  const locale = await getLocale();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect({ href: "/admin/login", locale });
  }

  // Authenticated AND admin, not just authenticated -- this is what lets a
  // future non-admin customer account exist without accidentally getting
  // admin UI access just by being logged in. See PLAN.md's Admin/CMS
  // section. RLS (not this check) is the real authorization boundary; this
  // is a fast redirect for a better UX, not a security control on its own.
  const { data: adminRow } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) {
    return redirect({ href: "/admin/login", locale });
  }

  return <>{children}</>;
}
