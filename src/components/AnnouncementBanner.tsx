import { getSiteSettings } from "@/lib/content/site-settings";
import { pickLocalized } from "@/lib/domain/i18n-content";
import { getLocale } from "next-intl/server";

export async function AnnouncementBanner() {
  const settings = await getSiteSettings();
  if (!settings.announcement_active) return null;

  const locale = await getLocale();
  const text = pickLocalized(settings.announcement_text_i18n, locale);
  if (!text) return null;

  return (
    <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
      {text}
    </div>
  );
}
