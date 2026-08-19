import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";
import { verifyMfaChallenge } from "../actions";

export default async function MfaChallengePage(props: PageProps<"/[locale]/admin/mfa-challenge">) {
  const locale = await getLocale();
  const { error } = await props.searchParams;
  const errorMessage =
    typeof error === "string" ? "Invalid or expired code. Try again." : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // No session at all -- this page only makes sense as the second step
  // after a password sign-in, not as a standalone entry point.
  if (!user) {
    return redirect({ href: "/admin/login", locale });
  }

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");

  // Nothing to challenge -- shouldn't normally be reachable (the layout
  // only redirects here when a verified factor exists), but fail safe by
  // sending back to the dashboard rather than showing a dead-end form.
  if (!factor) {
    return redirect({ href: "/admin", locale });
  }

  return (
    <main className="flex min-h-screen flex-1 items-center justify-center bg-cream px-4 py-14">
      <div className="card-surface w-full max-w-sm p-8">
        <form action={verifyMfaChallenge} className="space-y-4">
          <input type="hidden" name="factorId" value={factor.id} />
          <h1 className="font-display text-xl font-semibold text-ink">Two-factor verification</h1>
          <p className="text-sm text-ink-soft">
            Enter the 6-digit code from your authenticator app.
          </p>
          {errorMessage ? (
            <p role="alert" className="text-sm text-brand-dark">
              {errorMessage}
            </p>
          ) : null}
          <div>
            <label htmlFor="code" className="field-label mb-1.5">
              Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              autoComplete="one-time-code"
              className="input-field"
            />
          </div>
          <button type="submit" className="btn-primary w-full py-2.5">
            Verify
          </button>
        </form>
      </div>
    </main>
  );
}
