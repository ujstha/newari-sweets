import { Link } from "@/i18n/navigation";
import { getAllProducts } from "@/lib/content/products";
import { duplicateProductAction } from "./actions";

export default async function AdminProductsPage() {
  const products = await getAllProducts();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Products</h1>
        <Link href="/admin/products/new" className="btn-primary px-4 py-1.5 text-sm">
          New product
        </Link>
      </div>

      <ul className="mt-6 space-y-2">
        {products.map((product) => {
          const duplicateThis = duplicateProductAction.bind(null, product.id);
          return (
            <li
              key={product.id}
              className="card-surface flex items-center justify-between p-4 text-sm"
            >
              <div>
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="font-medium text-ink hover:text-brand"
                >
                  {product.name_i18n.en}
                </Link>
                <span className="ml-2 text-xs text-ink-faint">
                  {product.category?.name_i18n.en} &middot;{" "}
                  {(product.base_price_cents / 100).toFixed(2)} €
                  {!product.is_active ? " · inactive" : ""}
                </span>
              </div>
              <form action={duplicateThis}>
                <button
                  type="submit"
                  className="text-xs font-medium text-brand hover:text-brand-dark"
                >
                  Duplicate
                </button>
              </form>
            </li>
          );
        })}
        {products.length === 0 ? <p className="text-sm text-ink-soft">No products yet.</p> : null}
      </ul>
    </div>
  );
}
