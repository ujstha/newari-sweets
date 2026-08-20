import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { signOut } from "../actions";

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

  // MFA gate: if this admin has enrolled a verified TOTP factor, the
  // session must actually be elevated to AAL2 before reaching any
  // protected page -- a password-only (AAL1) session bounces to the
  // challenge page instead. Admins who never enrolled a factor are
  // unaffected (nextLevel stays aal1). See PLAN.md's "Shared admin
  // account" MFA note.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
    return redirect({ href: "/admin/mfa-challenge", locale });
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream sm:h-screen sm:flex-row sm:overflow-hidden">
      <aside className="border-b border-border-warm bg-surface sm:h-screen sm:w-56 sm:flex-shrink-0 sm:overflow-y-auto sm:border-r sm:border-b-0">
        <div className="flex items-center justify-between px-4 py-4 sm:px-5">
          <span className="font-display text-base font-semibold text-ink">Newari Sweets</span>
        </div>
        <AdminNav />
        <form action={signOut} className="px-4 py-3 sm:px-3">
          <button
            type="submit"
            className="w-full rounded-lg px-3.5 py-2 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand-dark"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 px-4 py-8 sm:overflow-y-auto sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
