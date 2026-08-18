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

export async function signOut() {
  const locale = await getLocale();
  const supabase = await createClient();

  await supabase.auth.signOut();

  return redirect({ href: "/admin/login", locale });
}
