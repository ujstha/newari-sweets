import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { getActiveProducts } from "@/lib/content/public-catalog";
import { getPublicImageUrl } from "@/lib/content/image-url";

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
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Shop</h1>

      {[...byCategory.entries()].map(([categorySlug, categoryProducts]) => (
        <section key={categorySlug} className="mt-8">
          <h2 className="text-lg font-semibold">{categoryProducts[0].category.name_i18n.en}</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {categoryProducts.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="block rounded border p-3 hover:shadow"
              >
                {product.primary_image_path ? (
                  // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare)
                  <img
                    src={getPublicImageUrl(product.primary_image_path)}
                    alt={product.name_i18n.en ?? ""}
                    className="aspect-square w-full rounded object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full rounded bg-gray-100" />
                )}
                <p className="mt-2 text-sm font-medium">{product.name_i18n.en}</p>
                <p className="text-xs text-gray-600">
                  {(product.base_price_cents / 100).toFixed(2)} € / {product.unit.code}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">No products available yet.</p>
      ) : null}
    </main>
  );
}
