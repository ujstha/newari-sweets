import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/content/public-catalog";
import { ProductListingClient } from "@/components/ProductListingClient";

export const metadata: Metadata = { title: "Shop" };

export default async function ProductsPage() {
  const products = await getActiveProducts();
  const categories = [...new Map(products.map((p) => [p.category.slug, p.category])).values()];

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <p className="text-xs font-semibold tracking-widest text-ink-faint uppercase">Shop</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">All sweets &amp; cakes</h1>

      {products.length > 0 ? (
        <ProductListingClient products={products} categories={categories} />
      ) : (
        <p className="mt-6 text-sm text-ink-soft">No products available yet.</p>
      )}
    </main>
  );
}
