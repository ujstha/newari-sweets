"use client";

import { useEffect, useMemo, useState } from "react";
import { ProductGrid } from "@/components/ProductGrid";
import { SelectField } from "@/components/SelectField";
import type { CatalogProductListItem } from "@/lib/content/public-catalog";

type Category = CatalogProductListItem["category"];

const SORTS = [
  { value: "featured", label: "Featured first" },
  { value: "name", label: "Name (A-Z)" },
  { value: "price-asc", label: "Price (low to high)" },
  { value: "price-desc", label: "Price (high to low)" },
] as const;
type SortValue = (typeof SORTS)[number]["value"];

// One mixed grid across all categories (not sectioned) with a filter/sort
// toolbar -- see docs/design-examples's ProductListing reference and the
// "don't section by category, mix + filter instead" discussion. All
// filtering/sorting happens client-side against the already-fetched
// product list; fine at this catalog's current size (50-60 items), worth
// revisiting (pagination) if the catalog grows much further.
export function ProductListingClient({
  products,
  categories,
}: {
  products: CatalogProductListItem[];
  categories: Category[];
}) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [sort, setSort] = useState<SortValue>("featured");

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (categories.some((c) => c.slug === hash)) {
      // Preserves the homepage's category-pill deep links (/products#slug)
      // now that there's no per-category <section id> to jump to -- the
      // filter itself becomes the landing state instead. Can't read the
      // hash during SSR, so this necessarily lands one render after the
      // unfiltered default.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveSlug(hash);
    }

    // needs to run once, against the hash present on initial load.
  }, []);

  const filtered = useMemo(() => {
    const base = activeSlug ? products.filter((p) => p.category.slug === activeSlug) : products;
    const sorted = [...base];
    if (sort === "name") {
      sorted.sort((a, b) => (a.name_i18n.en ?? "").localeCompare(b.name_i18n.en ?? ""));
    } else if (sort === "price-asc") {
      sorted.sort((a, b) => a.base_price_cents - b.base_price_cents);
    } else if (sort === "price-desc") {
      sorted.sort((a, b) => b.base_price_cents - a.base_price_cents);
    } else {
      sorted.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
    }
    return sorted;
  }, [products, activeSlug, sort]);

  return (
    <>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-border-warm pb-6">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveSlug(null)}
            className={activeSlug === null ? "pill-filter-active" : "pill-filter"}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => setActiveSlug(category.slug)}
              className={activeSlug === category.slug ? "pill-filter-active" : "pill-filter"}
            >
              {category.name_i18n.en}
            </button>
          ))}
        </div>
        <div className="w-full sm:w-48">
          <SelectField
            aria-label="Sort products"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortValue)}
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </SelectField>
        </div>
      </div>

      <div className="mt-6">
        {filtered.length > 0 ? (
          <ProductGrid products={filtered} showPrice />
        ) : (
          <p className="mt-6 text-sm text-ink-soft">No products in this category yet.</p>
        )}
      </div>
    </>
  );
}
