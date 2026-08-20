"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { FavoriteItem } from "./types";

const STORAGE_KEY = "newari-sweets-favorites";

interface FavoritesContextValue {
  favorites: FavoriteItem[];
  isFavorited: (productId: string) => boolean;
  toggleFavorite: (item: FavoriteItem) => void;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// Client-side only, localStorage-persisted -- same architecture as
// CartContext, for the same reason: this site is guest-checkout-only with
// no accounts, so there's no server-side identity to persist favorites
// against. Device-only, no cross-device sync -- an accepted limitation the
// cart already has.
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // Hydrating from localStorage can only happen client-side after mount;
      // starting from an empty array keeps server/client markup identical.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setFavorites(JSON.parse(raw));
    } catch {
      // Corrupt/unavailable localStorage -- start empty rather than crashing.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  function isFavorited(productId: string) {
    return favorites.some((f) => f.productId === productId);
  }

  function toggleFavorite(item: FavoriteItem) {
    setFavorites((prev) =>
      prev.some((f) => f.productId === item.productId)
        ? prev.filter((f) => f.productId !== item.productId)
        : [...prev, item],
    );
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorited, toggleFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites must be used within a FavoritesProvider");
  return ctx;
}
