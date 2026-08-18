"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./types";

const STORAGE_KEY = "newari-sweets-cart";

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Client-side only, no server cart table -- see PLAN.md's Storefront Cart
// row. Guest checkout has no account to persist a cart against anyway.
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // This IS the external-system-sync case the rule's own docs carve
      // out: localStorage isn't available during SSR, so hydrating it can
      // only happen client-side after mount. Starting from an empty array
      // keeps server/client markup identical, avoiding a hydration mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // Corrupt/unavailable localStorage -- start with an empty cart rather
      // than crashing the page.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "id">) {
    setItems((prev) => [...prev, { ...item, id: crypto.randomUUID() }]);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity } : i)));
  }

  function clear() {
    setItems([]);
  }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
