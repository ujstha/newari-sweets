"use client";

import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { computeOrderSubtotal } from "@/lib/domain/pricing";
import { getPublicImageUrl } from "@/lib/content/image-url";
import { QuantityStepper } from "@/components/QuantityStepper";

// Cart items only carry the unit's display label, not its default step size
// (that lives on the product, already left behind at add-to-cart time) --
// this mirrors the same defaults the units master list seeds (see
// PLAN.md's Catalog & Content table), close enough for a +/- nudge here.
function stepForUnit(unitLabel: string) {
  if (unitLabel === "kg") return 0.5;
  if (unitLabel === "g") return 50;
  return 1;
}

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
      <main className="mx-auto max-w-2xl px-4 py-14 text-center sm:px-8">
        <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>
        <p className="mt-4 text-sm text-ink-soft">Your cart is empty.</p>
        <Link href="/products" className="btn-primary mt-6">
          Browse the shop
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="font-display text-3xl font-semibold text-ink">Cart</h1>

      <div className="card-surface mt-6 divide-y divide-border-warm">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4 p-4">
            {item.imagePath ? (
              // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section
              <img
                src={getPublicImageUrl(item.imagePath)}
                alt=""
                className="h-20 w-20 rounded-xl object-cover"
              />
            ) : (
              <div className="h-20 w-20 flex-shrink-0 rounded-xl bg-brand-soft" />
            )}
            <div className="flex-1">
              <p className="font-display text-sm font-medium text-ink">{item.name}</p>
              {item.selectedOptions.length > 0 ? (
                <p className="mt-0.5 text-xs text-ink-soft">
                  {item.selectedOptions.map((o) => o.valueLabel).join(", ")}
                </p>
              ) : null}
              {item.cakeMessage ? (
                <p className="mt-0.5 text-xs text-ink-soft">
                  Message: &quot;{item.cakeMessage}&quot;
                </p>
              ) : null}
              {item.customNote ? (
                <p className="mt-0.5 text-xs text-ink-soft">Note: {item.customNote}</p>
              ) : null}
              <div className="mt-2 flex items-center gap-3">
                <QuantityStepper
                  value={item.quantity}
                  onChange={(next) => updateQuantity(item.id, next)}
                  min={0}
                  step={stepForUnit(item.unitLabel)}
                  ariaLabel={item.name}
                />
                <span className="text-xs text-ink-faint">{item.unitLabel}</span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs font-medium text-brand hover:text-brand-dark"
                >
                  Remove
                </button>
              </div>
            </div>
            <p className="text-sm font-medium text-ink">
              {((item.unitPriceCents * item.quantity) / 100).toFixed(2)} €
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-border-warm pt-6">
        <p className="font-display text-lg font-semibold text-ink">
          Subtotal: {(subtotal / 100).toFixed(2)} €
        </p>
        <Link href="/checkout" className="btn-primary">
          Checkout
        </Link>
      </div>
    </main>
  );
}
