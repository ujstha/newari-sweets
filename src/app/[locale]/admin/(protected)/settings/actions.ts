"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Not authenticated");
  }

  const { data: current } = await supabase
    .from("site_settings")
    .select("announcement_text_i18n, hero_heading_i18n, hero_subtext_i18n")
    .eq("id", 1)
    .single();

  const str = (name: string) => ((formData.get(name) as string | null) ?? "").trim();

  const { error } = await supabase
    .from("site_settings")
    .update({
      business_name: str("business_name"),
      contact_email: str("contact_email"),
      contact_phone: str("contact_phone"),
      service_area_text: str("service_area_text"),
      instagram_url: str("instagram_url") || null,
      facebook_url: str("facebook_url") || null,
      hours_text: str("hours_text"),
      announcement_active: formData.get("announcement_active") === "on",
      // Merge into the existing jsonb rather than replacing it outright, so
      // a future "fi" key isn't clobbered by this English-only form -- see
      // PLAN.md's Localization note.
      announcement_text_i18n: {
        ...((current?.announcement_text_i18n as Record<string, string>) ?? {}),
        en: str("announcement_text"),
      },
      hero_heading_i18n: {
        ...((current?.hero_heading_i18n as Record<string, string>) ?? {}),
        en: str("hero_heading"),
      },
      hero_subtext_i18n: {
        ...((current?.hero_subtext_i18n as Record<string, string>) ?? {}),
        en: str("hero_subtext"),
      },
      hero_image_url: str("hero_image_url") || null,
      default_min_prep_days: Number(formData.get("default_min_prep_days")) || 0,
      updated_by: user.id,
    })
    .eq("id", 1);

  if (error) {
    throw new Error(error.message);
  }

  // Site chrome (header/footer/banner/hero) is read on every public page.
  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
}
