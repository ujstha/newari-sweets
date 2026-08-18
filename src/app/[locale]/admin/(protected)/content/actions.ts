"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/content/page-content";

export async function updatePageContent(key: PageContentKey, formData: FormData) {
  if (!PAGE_CONTENT_KEYS.includes(key)) {
    throw new Error(`Unknown page content key: ${key}`);
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: current } = await supabase
    .from("page_content")
    .select("title_i18n, body_i18n")
    .eq("key", key)
    .single();

  const str = (name: string) => ((formData.get(name) as string | null) ?? "").trim();

  const { error } = await supabase
    .from("page_content")
    .update({
      title_i18n: { ...((current?.title_i18n as Record<string, string>) ?? {}), en: str("title") },
      body_i18n: { ...((current?.body_i18n as Record<string, string>) ?? {}), en: str("body") },
      updated_by: user.id,
    })
    .eq("key", key);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/", "layout");
  revalidatePath(`/admin/content/${key}`);
}
