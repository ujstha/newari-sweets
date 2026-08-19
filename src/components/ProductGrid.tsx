import { Link } from "@/i18n/navigation";
import { getPublicImageUrl } from "@/lib/content/image-url";
import type { CatalogProductListItem } from "@/lib/content/public-catalog";

export function ProductGrid({
  products,
  showPrice = false,
}: {
  products: CatalogProductListItem[];
  showPrice?: boolean;
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
            {product.is_featured ? (
              <span className="absolute top-2 left-2 rounded-full bg-gold px-2.5 py-0.5 text-xs font-medium text-ink shadow-sm">
                Featured
              </span>
            ) : null}
          </div>
          <div className="p-3">
            <p className="font-display text-sm font-medium text-ink">{product.name_i18n.en}</p>
            {showPrice ? (
              <p className="mt-0.5 text-xs text-ink-soft">
                {(product.base_price_cents / 100).toFixed(2)} € / {product.unit.code}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}
