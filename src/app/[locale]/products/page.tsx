import type { Metadata } from "next";
import { getActiveProducts } from "@/lib/content/public-catalog";
import { ProductGrid } from "@/components/ProductGrid";

export const metadata: Metadata = { title: "Shop" };

export default async function ProductsPage() {
  const products = await getActiveProducts();
  const byCategory = new Map<string, typeof products>();
  for (const product of products) {
    const key = product.category.slug;
    if (!byCategory.has(key)) byCategory.set(key, []);
    byCategory.get(key)!.push(product);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:px-8">
      <h1 className="font-display text-3xl font-semibold text-ink">Shop</h1>

      {[...byCategory.entries()].map(([categorySlug, categoryProducts]) => (
        <section key={categorySlug} className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            {categoryProducts[0].category.name_i18n.en}
          </h2>
          <div className="mt-5">
            <ProductGrid products={categoryProducts} showPrice />
          </div>
        </section>
      ))}

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No products available yet.</p>
      ) : null}
    </main>
  );
}
