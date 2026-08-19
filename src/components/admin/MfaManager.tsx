"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface Factor {
  id: string;
  friendly_name?: string;
  status: "verified" | "unverified";
}

export function MfaManager() {
  const supabase = createClient();
  const [factors, setFactors] = useState<Factor[] | null>(null);
  const [enrolling, setEnrolling] = useState<{
    factorId: string;
    qrSvg: string;
    secret: string;
  } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function refresh() {
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  }

  useEffect(() => {
    // Initial fetch of enrolled factors on mount, not a derived-state cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startEnroll() {
    setError(null);
    setBusy(true);
    const { data, error: enrollError } = await supabase.auth.mfa.enroll({ factorType: "totp" });
    setBusy(false);
    if (enrollError || !data) {
      setError(enrollError?.message ?? "Could not start enrollment.");
      return;
    }
    setEnrolling({ factorId: data.id, qrSvg: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirmEnroll() {
    if (!enrolling) return;
    setError(null);
    setBusy(true);
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
      factorId: enrolling.factorId,
    });
    if (challengeError || !challenge) {
      setBusy(false);
      setError(challengeError?.message ?? "Could not verify code.");
      return;
    }
    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: enrolling.factorId,
      challengeId: challenge.id,
      code,
    });
    setBusy(false);
    if (verifyError) {
      setError("Invalid code. Try again.");
      return;
    }
    setEnrolling(null);
    setCode("");
    await refresh();
  }

  async function unenroll(factorId: string) {
    setError(null);
    setBusy(true);
    const { error: unenrollError } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (unenrollError) {
      setError(unenrollError.message);
      return;
    }
    await refresh();
  }

  if (factors === null) {
    return <p className="text-sm text-ink-soft">Loading...</p>;
  }

  const verified = factors.filter((f) => f.status === "verified");

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="text-sm text-brand-dark">
          {error}
        </p>
      ) : null}

      {verified.length > 0 ? (
        <ul className="space-y-2">
          {verified.map((f) => (
            <li key={f.id} className="card-surface flex items-center justify-between p-4 text-sm">
              <span className="text-ink">
                Authenticator app ({f.friendly_name || f.id.slice(0, 8)})
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => unenroll(f.id)}
                className="text-sm font-medium text-brand hover:text-brand-dark disabled:opacity-50"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-ink-soft">
          No authenticator app enrolled yet. Enrolling adds a required second step at sign-in.
        </p>
      )}

      {enrolling ? (
        <div className="card-surface space-y-3 p-4">
          <p className="text-sm text-ink-soft">
            Scan this QR code with an authenticator app, then enter the code it shows.
          </p>
          <div
            className="h-48 w-48 rounded-xl bg-white p-2"
            // Supabase returns a trusted, server-generated QR SVG for the enrollment
            // it just created -- not arbitrary/user-supplied content.
            dangerouslySetInnerHTML={{ __html: enrolling.qrSvg }}
          />
          <p className="text-xs text-ink-faint">
            Can&apos;t scan? Enter this key manually: <code>{enrolling.secret}</code>
          </p>
          <div className="flex gap-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6-digit code"
              className="input-field flex-1"
            />
            <button
              type="button"
              disabled={busy || code.length !== 6}
              onClick={confirmEnroll}
              className="btn-primary px-4"
            >
              Confirm
            </button>
          </div>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={startEnroll} className="btn-primary">
          Add authenticator app
        </button>
      )}
    </div>
  );
}
