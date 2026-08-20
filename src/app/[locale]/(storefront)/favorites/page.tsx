"use client";

import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/lib/favorites/FavoritesContext";
import { getPublicImageUrl } from "@/lib/content/image-url";
import { FavoriteButton } from "@/components/FavoriteButton";

export default function FavoritesPage() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Favorites</h1>
        <p className="mt-4 text-sm text-ink-soft">
          No favorites yet -- browse the shop and tap the heart on anything you love.
        </p>
        <Link href="/products" className="btn-primary mt-6">
          Browse the shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="font-display text-3xl font-semibold text-ink">Favorites</h1>
      <p className="mt-1 text-sm text-ink-faint">Saved on this device only.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
        {favorites.map((product) => (
          <Link
            key={product.productId}
            href={`/products/${product.slug}`}
            className="group block overflow-hidden rounded-2xl border border-border-warm bg-surface transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/5"
          >
            <div className="relative aspect-square overflow-hidden bg-brand-soft">
              {product.imagePath ? (
                // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare)
                <img
                  src={getPublicImageUrl(product.imagePath)}
                  alt={product.name}
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
              <FavoriteButton
                product={product}
                className="absolute top-2 right-2 h-8 w-8 bg-surface/90 shadow-sm backdrop-blur"
              />
            </div>
            <div className="p-3">
              <p className="font-display text-sm font-medium text-ink">{product.name}</p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-soft">
                <span className="text-brand">&#9670;</span>
                {(product.priceCents / 100).toFixed(2)} € / {product.unitCode}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
