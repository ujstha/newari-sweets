import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedText } from "@/lib/domain/i18n-content";

export const PAGE_CONTENT_KEYS = [
  "about",
  "legal_privacy",
  "legal_terms",
  "legal_imprint",
] as const;
export type PageContentKey = (typeof PAGE_CONTENT_KEYS)[number];

export interface PageContent {
  key: PageContentKey;
  title_i18n: LocalizedText;
  body_i18n: LocalizedText;
}

// Public read (RLS allows anon). Returns an empty shell if the row is
// missing rather than throwing, since a not-yet-written legal page
// shouldn't 500 the route. Wrapped in React's cache() -- see
// site-settings.ts for why.
export const getPageContent = cache(async (key: PageContentKey): Promise<PageContent> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("page_content")
    .select("key, title_i18n, body_i18n")
    .eq("key", key)
    .maybeSingle();

  return data ?? { key, title_i18n: {}, body_i18n: {} };
});
