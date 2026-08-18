import { getTranslations, getLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/content/site-settings";
import { getPageContent } from "@/lib/content/page-content";
import { pickLocalized } from "@/lib/domain/i18n-content";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const [settings, about] = await Promise.all([getSiteSettings(), getPageContent("about")]);

  const heading = pickLocalized(settings.hero_heading_i18n, locale) || t("title");
  const subtext = pickLocalized(settings.hero_subtext_i18n, locale);
  const aboutBody = pickLocalized(about.body_i18n, locale);

  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-semibold">{heading}</h1>
      {subtext ? <p className="text-gray-600">{subtext}</p> : null}
      {aboutBody ? <p className="mt-8 text-sm text-gray-600">{aboutBody}</p> : null}
    </main>
  );
}
