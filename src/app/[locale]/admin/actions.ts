"use server";

import { getLocale } from "next-intl/server";
import { redirect } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData) {
  const locale = await getLocale();
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return redirect({
      href: { pathname: "/admin/login", query: { error: "missing_fields" } },
      locale,
    });
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return redirect({
      href: { pathname: "/admin/login", query: { error: "invalid_credentials" } },
      locale,
    });
  }

  return redirect({ href: "/admin", locale });
}

export async function verifyMfaChallenge(formData: FormData) {
  const locale = await getLocale();
  const factorId = formData.get("factorId");
  const code = formData.get("code");

  if (typeof factorId !== "string" || typeof code !== "string" || !code) {
    return redirect({
      href: { pathname: "/admin/mfa-challenge", query: { error: "invalid" } },
      locale,
    });
  }

  const supabase = await createClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
    factorId,
  });

  if (challengeError) {
    return redirect({
      href: { pathname: "/admin/mfa-challenge", query: { error: "invalid" } },
      locale,
    });
  }

  const { error: verifyError } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code,
  });

  if (verifyError) {
    return redirect({
      href: { pathname: "/admin/mfa-challenge", query: { error: "invalid" } },
      locale,
    });
  }

  return redirect({ href: "/admin", locale });
}

export async function signOut() {
  const locale = await getLocale();
  const supabase = await createClient();

  await supabase.auth.signOut();

  return redirect({ href: "/admin/login", locale });
}
