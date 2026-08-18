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
    <main className="flex flex-1 items-center justify-center p-8">
      <form action={verifyMfaChallenge} className="w-full max-w-sm space-y-4">
        <input type="hidden" name="factorId" value={factor.id} />
        <h1 className="text-xl font-semibold">Two-factor verification</h1>
        <p className="text-sm text-gray-600">Enter the 6-digit code from your authenticator app.</p>
        {errorMessage ? (
          <p role="alert" className="text-sm text-red-600">
            {errorMessage}
          </p>
        ) : null}
        <div className="space-y-1">
          <label htmlFor="code" className="block text-sm font-medium">
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
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <button type="submit" className="w-full rounded bg-black px-3 py-2 text-white">
          Verify
        </button>
      </form>
    </main>
  );
}
