import { getTranslations, getLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/content/site-settings";
import { getPageContent } from "@/lib/content/page-content";
import { pickLocalized } from "@/lib/domain/i18n-content";
import { getFeaturedProducts } from "@/lib/content/public-catalog";
import { getPublicImageUrl } from "@/lib/content/image-url";
import { Link } from "@/i18n/navigation";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const [settings, about, featured] = await Promise.all([
    getSiteSettings(),
    getPageContent("about"),
    getFeaturedProducts(),
  ]);

  const heading = pickLocalized(settings.hero_heading_i18n, locale) || t("title");
  const subtext = pickLocalized(settings.hero_subtext_i18n, locale);
  const aboutBody = pickLocalized(about.body_i18n, locale);

  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-2xl font-semibold">{heading}</h1>
        {subtext ? <p className="text-gray-600">{subtext}</p> : null}
        {aboutBody ? <p className="mt-4 text-sm text-gray-600">{aboutBody}</p> : null}
      </div>

      {featured.length > 0 ? (
        <section className="mt-12">
          <h2 className="text-lg font-semibold">Featured</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {featured.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="block rounded border p-3 hover:shadow"
              >
                {product.primary_image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section
                  <img
                    src={getPublicImageUrl(product.primary_image_path)}
                    alt={product.name_i18n.en ?? ""}
                    className="aspect-square w-full rounded object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full rounded bg-gray-100" />
                )}
                <p className="mt-2 text-sm font-medium">{product.name_i18n.en}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Best Sellers is deferred until orders exist (build-order Phase 6) --
          see src/lib/content/public-catalog.ts's comment. */}
    </main>
  );
}
