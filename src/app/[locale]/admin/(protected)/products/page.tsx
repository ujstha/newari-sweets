import { Link } from "@/i18n/navigation";
import { getAllProducts } from "@/lib/content/products";
import { duplicateProductAction } from "./actions";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <main className="mx-auto max-w-3xl p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="rounded bg-black px-3 py-1 text-xs text-white">
          New product
        </Link>
      </div>

      <ul className="mt-6 space-y-2">
        {products.map((product) => {
          const duplicateThis = duplicateProductAction.bind(null, product.id);
          return (
            <li
              key={product.id}
              className="flex items-center justify-between rounded border p-3 text-sm"
            >
              <div>
                <Link href={`/admin/products/${product.id}/edit`} className="font-medium underline">
                  {product.name_i18n.en}
                </Link>
                <span className="ml-2 text-xs text-gray-500">
                  {product.category?.name_i18n.en} &middot;{" "}
                  {(product.base_price_cents / 100).toFixed(2)} €
                  {!product.is_active ? " · inactive" : ""}
                </span>
              </div>
              <form action={duplicateThis}>
                <button type="submit" className="text-xs underline">
                  Duplicate
                </button>
              </form>
            </li>
          );
        })}
        {products.length === 0 ? <p className="text-sm text-gray-600">No products yet.</p> : null}
      </ul>
    </main>
  );
}
