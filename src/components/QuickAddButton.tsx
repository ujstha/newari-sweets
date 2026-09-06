"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart/CartContext";
import type { CatalogProductListItem } from "@/lib/content/public-catalog";

// Adds the base config directly from a grid card, no detour through the
// PDP -- only rendered for products with no required option group (see
// has_required_options on CatalogProductListItem), since there's no UI
// here to make that choice.
export function QuickAddButton({
  product,
  className = "",
}: {
  product: CatalogProductListItem;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      onClick={(e) => {
        // Cards wrap the whole thing in a <Link> -- stop the click from
        // also navigating to the product page.
        e.preventDefault();
        e.stopPropagation();
        addItem({
          productId: product.id,
          productSlug: product.slug,
          name: product.name_i18n.en ?? "",
          imagePath: product.primary_image_path,
          unitLabel: product.unit.code,
          minPrepDays: product.min_prep_days,
          quantity: product.unit.default_step,
          unitPriceCents: product.base_price_cents,
          selectedOptions: [],
          customNote: "",
          cakeMessage: "",
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
      }}
      aria-label={`Add ${product.name_i18n.en ?? "product"} to cart`}
      className={`btn-secondary w-full py-1.5 text-xs ${className}`}
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
