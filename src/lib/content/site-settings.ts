import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedText } from "@/lib/domain/i18n-content";

export interface SiteSettings {
  business_name: string;
  contact_email: string;
  contact_phone: string;
  service_area_text: string;
  instagram_url: string | null;
  facebook_url: string | null;
  hours_text: string;
  announcement_text_i18n: LocalizedText;
  announcement_active: boolean;
  hero_heading_i18n: LocalizedText;
  hero_subtext_i18n: LocalizedText;
  hero_image_url: string | null;
  default_min_prep_days: number;
  active_locales: string[];
}

// Public read (RLS allows anon), safe to call from any Server
// Component/page. Falls back to sane empty defaults if the singleton row
// is somehow missing, rather than throwing and breaking every page.
// Wrapped in React's cache() so the header/footer/homepage calling this
// independently within one request only hits the DB once.
export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select(
      "business_name, contact_email, contact_phone, service_area_text, instagram_url, facebook_url, hours_text, announcement_text_i18n, announcement_active, hero_heading_i18n, hero_subtext_i18n, hero_image_url, default_min_prep_days, active_locales",
    )
    .eq("id", 1)
    .maybeSingle();

  return (
    data ?? {
      business_name: "",
      contact_email: "",
      contact_phone: "",
      service_area_text: "",
      instagram_url: null,
      facebook_url: null,
      hours_text: "",
      announcement_text_i18n: {},
      announcement_active: false,
      hero_heading_i18n: {},
      hero_subtext_i18n: {},
      hero_image_url: null,
      default_min_prep_days: 2,
      active_locales: ["en"],
    }
  );
});
