import { getTranslations, getLocale } from "next-intl/server";
import { getSiteSettings } from "@/lib/content/site-settings";
import { getPageContent } from "@/lib/content/page-content";
import { pickLocalized } from "@/lib/domain/i18n-content";
import {
  getActiveProducts,
  getFeaturedProducts,
  getBestSellingProducts,
} from "@/lib/content/public-catalog";
import { getPublicImageUrl } from "@/lib/content/image-url";
import { Link } from "@/i18n/navigation";
import { ProductGrid } from "@/components/ProductGrid";

const VALUE_PROPS = [
  {
    title: "Handmade to order",
    body: "Small batches, made fresh -- not sitting in a display case.",
    icon: (
      <path
        d="M12 3v3m0 12v3M5 12H2m20 0h-3m-1.6-6.4L15 8m-6 8 2.4-2.4M6.4 6.4 9 9m6 6 2.6 2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    ),
  },
  {
    title: "Pickup or delivery",
    body: "Local delivery or pickup, arranged directly with you.",
    icon: (
      <path
        d="M3 7h11v9H3zm11 3h4l3 3v3h-7zM6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    ),
  },
  {
    title: "Order ahead",
    body: "Most items need a little notice -- check the product page for lead time.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M12 7v5l3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
];

export default async function HomePage() {
  const t = await getTranslations("HomePage");
  const locale = await getLocale();
  const [settings, about, allProducts, featured, bestSellers] = await Promise.all([
    getSiteSettings(),
    getPageContent("about"),
    getActiveProducts(),
    getFeaturedProducts(),
    getBestSellingProducts(),
  ]);

  const heading = pickLocalized(settings.hero_heading_i18n, locale) || t("title");
  const subtext = pickLocalized(settings.hero_subtext_i18n, locale);
  const aboutBody = pickLocalized(about.body_i18n, locale);

  const heroImage =
    settings.hero_image_url || featured[0]?.primary_image_path
      ? settings.hero_image_url || getPublicImageUrl(featured[0].primary_image_path!)
      : null;

  const categories = [...new Map(allProducts.map((p) => [p.category.slug, p.category])).values()];

  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark to-brand">
        {/* Purely decorative glow shapes -- the one bold-pop moment on the
            page (see docs/design-examples), so the color energy here is
            deliberately louder than the rest of the site. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-120px] right-[-80px] h-80 w-80 rounded-full bg-white/[0.06] sm:h-[420px] sm:w-[420px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[-140px] left-[15%] h-56 w-56 rounded-full bg-pop-pink/25 sm:h-80 sm:w-80"
        />
        <div className="relative mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-8 sm:py-24 md:grid-cols-2 md:gap-14">
          <div className="flex flex-col items-center gap-5 text-center md:items-start md:text-left">
            <span className="pill-filter-inverse">Handmade in Helsinki</span>
            <h1 className="font-pop text-4xl leading-[0.92] font-extrabold tracking-tight text-cream uppercase sm:text-6xl">
              {heading}
            </h1>
            {subtext ? (
              <p className="max-w-xl text-base text-cream/85 sm:text-lg">{subtext}</p>
            ) : null}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link href="/products" className="btn-primary bg-gold text-ink hover:bg-gold/90">
                Browse the shop
              </Link>
              {aboutBody ? (
                <a href="#about" className="btn-ghost-inverse">
                  About us
                </a>
              ) : null}
            </div>
          </div>

          {heroImage ? (
            <div className="order-first mx-auto aspect-square w-full max-w-[320px] overflow-hidden rounded-full shadow-2xl md:order-last md:max-w-[380px]">
              {/* eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare) */}
              <img src={heroImage} alt="" className="h-full w-full object-cover" />
            </div>
          ) : null}
        </div>

        {categories.length > 1 ? (
          <div className="relative border-t border-white/10">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2 px-4 py-4 sm:justify-start sm:px-8">
              <span className="text-xs font-medium tracking-wide text-cream/50 uppercase">
                Shop by category
              </span>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={{ pathname: "/products", hash: category.slug }}
                  className="pill-filter-inverse"
                >
                  {category.name_i18n.en}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="grid gap-4 py-8 sm:grid-cols-3 sm:gap-6 sm:py-14">
          {VALUE_PROPS.map((item) => (
            <div
              key={item.title}
              className="flex flex-row items-center gap-3 text-left sm:flex-col sm:items-start sm:gap-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="shrink-0 text-brand sm:h-7 sm:w-7"
                aria-hidden="true"
              >
                {item.icon}
              </svg>
              <div>
                <p className="font-display text-base font-medium text-ink">{item.title}</p>
                <p className="text-sm text-ink-soft">{item.body}</p>
              </div>
            </div>
          ))}
        </div>

        {aboutBody ? (
          <section id="about" className="scroll-mt-20 border-t border-border-warm py-10 sm:py-14">
            <h2 className="font-display text-2xl font-semibold text-ink">About</h2>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-ink-soft">{aboutBody}</p>
          </section>
        ) : null}

        {featured.length > 0 ? (
          <section className="border-t border-border-warm py-10 sm:py-14">
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

        {/* Promo band -- the one other place the bold-pop treatment shows
            up, deliberately scaled back from the full hero exploration
            (see docs/design-examples) so it's a secondary beat, not a
            second hero. */}
        <section className="py-10 sm:py-14">
          <div className="relative flex items-center gap-6 overflow-hidden rounded-3xl bg-pop-pink p-8 sm:gap-9 sm:p-14">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-[-70px] right-[30px] h-52 w-52 rounded-full bg-white/10 sm:h-64 sm:w-64"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute bottom-[-80px] left-[55%] h-36 w-36 rounded-full bg-ink/10"
            />
            <div className="relative hidden h-44 w-24 shrink-0 items-center justify-center rounded-full bg-white/15 sm:flex">
              <svg width="44" height="44" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                <rect x="30" y="50" width="60" height="34" rx="4" fill="#832f22" />
                <rect x="26" y="34" width="68" height="20" rx="4" fill="#fffdf9" />
                <circle cx="60" cy="26" r="5" fill="#fffdf9" />
              </svg>
            </div>
            <div className="relative flex-1">
              <h3 className="font-pop text-3xl leading-[0.9] font-extrabold tracking-tight text-white uppercase sm:text-5xl">
                Custom
                <br />
                Cakes.
              </h3>
              <p className="mt-3 max-w-sm text-sm text-white/85 sm:text-[15px]">
                Any occasion — birthdays, weddings, pujas. Tell us the flavor, size and date.
                Layered cakes need at least 7 days notice.
              </p>
              <Link href="/products" className="btn-primary mt-5 bg-ink hover:bg-ink/90">
                Start a custom order
              </Link>
            </div>
          </div>
        </section>

        {bestSellers.length > 0 ? (
          <section className="border-t border-border-warm py-10 sm:py-14">
            <h2 className="font-display text-2xl font-semibold text-ink">Best Sellers</h2>
            <div className="mt-5">
              <ProductGrid products={bestSellers} showPopularBadge />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
