"use client";

import { useFavorites } from "@/lib/favorites/FavoritesContext";
import type { FavoriteItem } from "@/lib/favorites/types";

export function FavoriteButton({
  product,
  className = "",
}: {
  product: FavoriteItem;
  className?: string;
}) {
  const { isFavorited, toggleFavorite } = useFavorites();
  const favorited = isFavorited(product.productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        // Cards wrap the whole thing in a <Link> -- stop the click from
        // also navigating to the product page.
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(product);
      }}
      aria-label={
        favorited ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`
      }
      aria-pressed={favorited}
      className={`flex items-center justify-center rounded-full transition-transform active:scale-90 ${className}`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={favorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={favorited ? "text-brand" : "text-ink-soft"}
      >
        <path d="M12 21s-7.5-4.7-10-9.3C.4 8.2 2 4.5 5.6 4c2-.3 3.9.7 6.4 3.4C14.5 4.7 16.4 3.7 18.4 4c3.6.5 5.2 4.2 3.6 7.7C19.5 16.3 12 21 12 21Z" />
      </svg>
    </button>
  );
}
