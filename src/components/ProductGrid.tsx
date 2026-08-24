import { Link } from "@/i18n/navigation";
import { getPublicImageUrl } from "@/lib/content/image-url";
import type { CatalogProductListItem } from "@/lib/content/public-catalog";
import { FavoriteButton } from "@/components/FavoriteButton";

export function ProductGrid({
  products,
  showPrice = false,
  showPopularBadge = false,
}: {
  products: CatalogProductListItem[];
  showPrice?: boolean;
  /** True for a best-sellers grid: every card is popular by definition (the
   * list itself is the computed signal), so this overrides the per-item
   * is_featured badge rather than needing a stored "is_bestseller" field. */
  showPopularBadge?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/products/${product.slug}`}
          className="group block overflow-hidden rounded-2xl border border-border-warm bg-surface transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
        >
          <div className="relative aspect-square overflow-hidden bg-brand-soft">
            {product.primary_image_path ? (
              // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare)
              <img
                src={getPublicImageUrl(product.primary_image_path)}
                alt={product.name_i18n.en ?? ""}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-ink-faint">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                  <path
                    d="M21 15l-5-5-9 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            {showPopularBadge ? (
              <span className="badge-popular absolute top-2 left-2">Popular</span>
            ) : product.is_featured ? (
              <span className="badge-featured absolute top-2 left-2">Featured</span>
            ) : null}
            <FavoriteButton
              product={{
                productId: product.id,
                slug: product.slug,
                name: product.name_i18n.en ?? "",
                imagePath: product.primary_image_path,
                priceCents: product.base_price_cents,
                unitCode: product.unit.code,
              }}
              className="absolute top-2 right-2 h-8 w-8 bg-surface/90 shadow-sm backdrop-blur"
            />
          </div>
          <div className="p-3">
            <p className="text-[10px] font-medium tracking-wider text-ink-faint uppercase">
              {product.category.name_i18n.en}
            </p>
            <p className="mt-0.5 font-display text-sm font-medium text-ink">
              {product.name_i18n.en}
            </p>
            {showPrice ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-ink-soft">
                <span className="text-brand">&#9670;</span>
                {(product.base_price_cents / 100).toFixed(2)} € / {product.unit.code}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
