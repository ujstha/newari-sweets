"use client";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { computeOrderSubtotal } from "@/lib/domain/pricing";
import { getPublicImageUrl } from "@/lib/content/image-url";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCart();

  const subtotal = computeOrderSubtotal(
    items.map((i) => ({
      unitPriceCents: i.unitPriceCents,
      lineTotalCents: Math.round(i.unitPriceCents * i.quantity),
    })),
  );

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <h1 className="text-xl font-semibold">Cart</h1>
        <p className="mt-4 text-sm text-gray-600">
          Your cart is empty.{" "}
          <Link href="/products" className="underline">
            Browse the shop
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Cart</h1>

      <ul className="mt-6 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="flex gap-3 rounded border p-3">
            {item.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section
              <img
                src={getPublicImageUrl(item.imagePath)}
                alt=""
                className="h-16 w-16 rounded object-cover"
              />
            ) : null}
            <div className="flex-1">
              <p className="text-sm font-medium">{item.name}</p>
              {item.selectedOptions.length > 0 ? (
                <p className="text-xs text-gray-500">
                  {item.selectedOptions.map((o) => o.valueLabel).join(", ")}
                </p>
              ) : null}
              {item.cakeMessage ? (
                <p className="text-xs text-gray-500">Message: &quot;{item.cakeMessage}&quot;</p>
              ) : null}
              {item.customNote ? (
                <p className="text-xs text-gray-500">Note: {item.customNote}</p>
              ) : null}
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  value={item.quantity}
                  onChange={(e) => updateQuantity(item.id, Number(e.target.value) || 0)}
                  className="w-16 rounded border px-1 py-0.5 text-xs"
                />
                <span className="text-xs text-gray-500">{item.unitLabel}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs text-red-600 underline"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="text-sm font-medium">
              {((item.unitPriceCents * item.quantity) / 100).toFixed(2)} €
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-right text-lg font-semibold">
        Subtotal: {(subtotal / 100).toFixed(2)} €
      </p>

      <div className="mt-4 text-right">
        <Link
          href="/checkout"
          className="inline-block rounded bg-black px-4 py-2 text-sm text-white"
        >
          Checkout
        </Link>
      </div>
    </main>
  );
}
