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

// One tile of the hero photo mosaic -- purely decorative (a designer
// collage, not a shop grid), so no link, no caption, empty alt. The
// Featured/Best Sellers sections below already handle "click to buy a
// specific product."
function HeroMosaicTile({
  src,
  className = "",
  priority = false,
}: {
  src: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare)
    <img
      src={src}
      alt=""
      fetchPriority={priority ? "high" : undefined}
      // w-full h-full + min-h-0: without these, a grid item that's a raw
      // <img> sizes to its own intrinsic aspect ratio instead of
      // stretching to fill its assigned cell -- causes overflow past the
      // cell (looked like "too tall") that visually overlaps whatever's
      // in the row below, rather than object-cover cropping cleanly
      // within the cell's actual bounds.
      className={`h-full w-full min-h-0 rounded-2xl bg-brand-soft object-cover ${className}`}
    />
  );
}

// Badge content only -- no card chrome -- so the same content can sit
// inside the mosaic grid (6+ real photos) or stand alone (fallback below
// 4 photos), see HomePage below.
function HeroBadgeContent({
  headingLead,
  headingAccent,
  subtext,
  aboutBody,
}: {
  headingLead: string;
  headingAccent: string;
  subtext: string | null;
  aboutBody: string | null;
}) {
  return (
    <>
      <span className="pill-filter">Handmade in Helsinki</span>
      {/* Two-tone headline -- the last word takes the theme's pop accent,
          so each color theme reads distinctly here too, not just in the
          background. Sized for the badge's own footprint (roughly half
          the hero width once the mosaic is present), not the full-bleed
          size the old single-column hero used. */}
      <h1 className="font-pop text-4xl leading-[0.92] font-extrabold tracking-tight uppercase sm:text-5xl lg:text-6xl">
        {headingLead ? <span className="text-ink">{headingLead} </span> : null}
        <span className="text-pop-pink">{headingAccent}</span>
      </h1>
      {subtext ? (
        <p className="max-w-xs font-display text-base text-ink-soft italic sm:max-w-sm sm:text-lg">
          {subtext}
        </p>
      ) : null}
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-ink-faint">
        <span>Pickup or local delivery</span>
        <span aria-hidden="true">&middot;</span>
        <span>Helsinki area</span>
        <span aria-hidden="true">&middot;</span>
        <span>Order 2+ days ahead</span>
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3">
        <Link href="/products" className="btn-primary bg-ink text-cream hover:bg-ink/90">
          Browse the shop
        </Link>
        {aboutBody ? (
          <a href="#about" className="btn-secondary">
            About us
          </a>
        ) : null}
      </div>
    </>
  );
}

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

  // Up to 6 real catalog photos for the hero's decorative photo mosaic --
  // deduped by product id, same traversal order as the original mosaic
  // design (featured, then best-sellers, then everything else) so the
  // photo-to-slot layout stays exactly as approved.
  const seenProductIds = new Set<string>();
  const dedupedImages: string[] = [];
  for (const product of [...featured, ...bestSellers, ...allProducts]) {
    if (seenProductIds.has(product.id) || !product.primary_image_path) continue;
    seenProductIds.add(product.id);
    dedupedImages.push(getPublicImageUrl(product.primary_image_path));
  }
  const mosaicImages = dedupedImages.slice(0, 6);
  const hasMosaic = mosaicImages.length >= 4;

  const headingWords = heading.trim().split(/\s+/);
  const headingLead = headingWords.slice(0, -1).join(" ");
  const headingAccent = headingWords[headingWords.length - 1] ?? "";

  // Category quick-nav rail -- one circular thumbnail per category, using
  // each category's own first photographed product (already sorted by
  // sort_order from getActiveProducts) rather than a separate icon asset.
  // Links reuse the /products#slug deep link ProductListingClient already
  // reads out of the hash on mount. See docs/design-examples/
  // anandhaas-video-analysis.md's Tier A recommendations.
  const categories = [...new Map(allProducts.map((p) => [p.category.slug, p.category])).values()];
  const categoryThumbnails = categories
    .map((c) => ({
      ...c,
      image: allProducts.find((p) => p.category.slug === c.slug && p.primary_image_path)
        ?.primary_image_path,
    }))
    .filter((c): c is typeof c & { image: string } => c.image != null);

  // Curated occasion cards -- real product photos, hand-picked framing/copy
  // (not a literal 1:1 category listing, which the rail above already
  // covers). Kept as a separate section from the Custom Cakes promo band
  // rather than folded into it, even though both ultimately point at the
  // small real category set. Each `find` excludes images already claimed by
  // an earlier occasion card so the section doesn't repeat the same photo
  // twice with different captions.
  const usedForOccasions = new Set<string>();
  function pickOccasionImage(categorySlug: string) {
    const product = allProducts.find(
      (p) =>
        p.category.slug === categorySlug && p.primary_image_path && !usedForOccasions.has(p.id),
    );
    if (!product?.primary_image_path) return null;
    usedForOccasions.add(product.id);
    return getPublicImageUrl(product.primary_image_path);
  }
  const hasSweets = categories.some((c) => c.slug === "sweets");
  const hasCakes = categories.some((c) => c.slug === "cakes");
  const occasions = [
    hasSweets
      ? {
          title: "Dashain & Tihar",
          body: "Festival trays of mithai for the biggest celebrations of the year.",
          href: "/products#sweets",
          image: pickOccasionImage("sweets"),
        }
      : null,
    hasCakes
      ? {
          title: "Weddings, Birthdays & Celebrations",
          body: "Custom cakes made to order -- tell us the flavor, size and date.",
          href: "/products#cakes",
          image: pickOccasionImage("cakes"),
        }
      : null,
    hasSweets
      ? {
          title: "Gifting",
          body: "Boxed mithai, handmade and ready to bring to family or friends.",
          href: "/products#sweets",
          image: pickOccasionImage("sweets"),
        }
      : null,
  ].filter(
    (o): o is { title: string; body: string; href: string; image: string } =>
      o != null && o.image != null,
  );

  return (
    <main>
      <section className="relative overflow-hidden bg-cream">
        {/* Soft decorative glow shapes -- lighter version of the old dark
            hero's glow, per the light-background direction (see
            docs/design-examples). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-[-140px] right-[-100px] h-72 w-72 rounded-full bg-gold/15 sm:h-[380px] sm:w-[380px]"
        />
        {/* Contained within the hero's own bounds (not bleeding past the
            bottom edge) -- the section below is the same bg-cream, so a
            shape designed to "bleed off a colored band" would otherwise
            look like an orphaned half-circle floating at an invisible
            boundary instead of an intentional background accent. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-6 left-[15%] h-56 w-56 rounded-full bg-pop-pink/10 sm:h-72 sm:w-72"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-8 sm:py-20">
          {hasMosaic ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4 md:grid-rows-3 md:aspect-[4/3] md:gap-3">
              {/* Badge -- a real grid cell (not an absolute overlay), so it
                  cleanly owns one rectangular region instead of clipping the
                  corners of the 4 photo tiles it would otherwise sit on top
                  of. order-1 puts it first on mobile (full-width, legible,
                  no photos crowding it); explicit grid placement takes over
                  at md:. */}
              <div className="order-1 flex flex-col items-center justify-center gap-4 rounded-3xl border border-border-warm bg-surface p-6 text-center shadow-xl sm:p-8 md:order-none md:col-start-2 md:row-start-2 md:col-span-2 md:row-span-2">
                <HeroBadgeContent
                  headingLead={headingLead}
                  headingAccent={headingAccent}
                  subtext={subtext}
                  aboutBody={aboutBody}
                />
              </div>

              {/* Photo mosaic -- a simple 2-col grid on mobile, released via
                  md:contents into the outer bento grid's own placement
                  classes on desktop (same technique the old flanking-pill
                  layout used for its own mobile/desktop regrouping). */}
              <div className="order-2 grid grid-cols-2 gap-2 md:contents">
                <HeroMosaicTile
                  src={mosaicImages[0]}
                  priority
                  className="aspect-square md:aspect-auto md:col-start-1 md:row-start-1"
                />
                <HeroMosaicTile
                  src={mosaicImages[1]}
                  className="aspect-square md:aspect-auto md:col-start-2 md:row-start-1"
                />
                <HeroMosaicTile
                  src={mosaicImages[2]}
                  className="aspect-square md:aspect-auto md:col-start-3 md:row-start-1"
                />
                {mosaicImages[3] ? (
                  <HeroMosaicTile
                    src={mosaicImages[3]}
                    // Absorbs the 6th cell's row when there's no 6th photo
                    // (current catalog has 5, not 6) -- spans the full
                    // column instead of leaving an empty cell below it.
                    className={`aspect-square md:aspect-auto md:col-start-4 md:row-start-1 ${
                      mosaicImages[5] ? "md:row-span-2" : "md:row-span-3"
                    }`}
                  />
                ) : null}
                {mosaicImages[4] ? (
                  <HeroMosaicTile
                    src={mosaicImages[4]}
                    className="aspect-square md:aspect-auto md:col-start-1 md:row-start-2 md:row-span-2"
                  />
                ) : null}
                {mosaicImages[5] ? (
                  <HeroMosaicTile
                    src={mosaicImages[5]}
                    className="aspect-square md:aspect-auto md:col-start-4 md:row-start-3"
                  />
                ) : null}
              </div>
            </div>
          ) : (
            // Fewer than 4 real product photos exist -- skip the mosaic
            // entirely rather than rendering a sparse/awkward grid.
            <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-4 rounded-3xl border border-border-warm bg-surface p-6 text-center shadow-xl sm:p-8">
              <HeroBadgeContent
                headingLead={headingLead}
                headingAccent={headingAccent}
                subtext={subtext}
                aboutBody={aboutBody}
              />
            </div>
          )}
        </div>
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

        {categoryThumbnails.length > 0 ? (
          <section className="border-t border-border-warm py-10 sm:py-14">
            <h2 className="font-display text-2xl font-semibold text-ink">Shop by category</h2>
            <div className="mt-5 flex flex-wrap gap-6 sm:gap-8">
              {categoryThumbnails.map((category) => (
                <Link
                  key={category.slug}
                  href={`/products#${category.slug}`}
                  className="group flex flex-col items-center gap-2 text-center"
                >
                  <span className="h-20 w-20 overflow-hidden rounded-full border border-border-warm bg-brand-soft transition-transform group-hover:scale-105 sm:h-24 sm:w-24">
                    {/* eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare) */}
                    <img
                      src={getPublicImageUrl(category.image)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </span>
                  <span className="text-sm font-medium text-ink">{category.name_i18n.en}</span>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {occasions.length > 0 ? (
          <section className="border-t border-border-warm py-10 sm:py-14">
            <h2 className="font-display text-2xl font-semibold text-ink">Shop by occasion</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3 sm:gap-6">
              {occasions.map((occasion) => (
                <Link
                  key={occasion.title}
                  href={occasion.href}
                  className="group relative block overflow-hidden rounded-2xl border border-border-warm"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-brand-soft">
                    {/* eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare) */}
                    <img
                      src={occasion.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent"
                  />
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <h3 className="font-display text-lg font-semibold text-white">
                      {occasion.title}
                    </h3>
                    <p className="mt-1 text-xs text-white/85">{occasion.body}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

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
              <ProductGrid products={featured} showPrice />
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
              <ProductGrid products={bestSellers} showPopularBadge showPrice />
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
