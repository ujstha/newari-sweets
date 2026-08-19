import { getTranslations, getLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/content/site-settings";
import { getPageContent } from "@/lib/content/page-content";
import { pickLocalized } from "@/lib/domain/i18n-content";
import { getFeaturedProducts, getBestSellingProducts } from "@/lib/content/public-catalog";
import { Link } from "@/i18n/navigation";
import { ProductGrid } from "@/components/ProductGrid";

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const [settings, about, featured, bestSellers] = await Promise.all([
    getSiteSettings(),
    getPageContent("about"),
    getFeaturedProducts(),
    getBestSellingProducts(),
  ]);

  const heading = pickLocalized(settings.hero_heading_i18n, locale) || t("title");
  const subtext = pickLocalized(settings.hero_subtext_i18n, locale);
  const aboutBody = pickLocalized(about.body_i18n, locale);

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border-warm bg-gradient-to-b from-brand-soft/60 to-cream">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center sm:px-8 sm:py-28">
          <span className="rounded-full border border-gold/40 bg-gold-soft px-3 py-1 text-xs font-medium tracking-wide text-ink-soft uppercase">
            Handmade in Helsinki
          </span>
          <h1 className="font-display text-4xl leading-tight font-semibold text-ink sm:text-5xl">
            {heading}
          </h1>
          {subtext ? (
            <p className="max-w-xl text-base text-ink-soft sm:text-lg">{subtext}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link href="/products" className="btn-primary">
              Browse the shop
            </Link>
            <Link href="/checkout" className="btn-secondary">
              Order a custom cake
            </Link>
          </div>
          {aboutBody ? <p className="mt-6 max-w-2xl text-sm text-ink-soft">{aboutBody}</p> : null}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
        {featured.length > 0 ? (
          <section>
            <div className="flex items-baseline justify-between">
              <h2 className="font-display text-2xl font-semibold text-ink">Featured</h2>
              <Link
                href="/products"
                className="text-sm font-medium text-brand hover:text-brand-dark"
              >
                View all
              </Link>
            </div>
            <div className="mt-5">
              <ProductGrid products={featured} />
            </div>
          </section>
        ) : null}

        {bestSellers.length > 0 ? (
          <section className="mt-14">
            <h2 className="font-display text-2xl font-semibold text-ink">Best Sellers</h2>
            <div className="mt-5">
              <ProductGrid products={bestSellers} />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
