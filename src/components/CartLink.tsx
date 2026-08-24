"use client";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";

export function CartLink() {
  const { items } = useCart();
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Link
      href="/cart"
      aria-label="Cart"
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
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
      {count > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-xs font-semibold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
