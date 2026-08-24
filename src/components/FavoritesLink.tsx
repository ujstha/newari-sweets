"use client";

import { Link } from "@/i18n/navigation";
import { useFavorites } from "@/lib/favorites/FavoritesContext";

export function FavoritesLink() {
  const { favorites } = useFavorites();
  const count = favorites.length;

  return (
    <Link
      href="/favorites"
      aria-label="Favorites"
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-brand-soft hover:text-brand"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 21s-7.5-4.7-10-9.3C.4 8.2 2 4.5 5.6 4c2-.3 3.9.7 6.4 3.4C14.5 4.7 16.4 3.7 18.4 4c3.6.5 5.2 4.2 3.6 7.7C19.5 16.3 12 21 12 21Z" />
      </svg>
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
