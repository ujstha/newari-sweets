"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { cartLeadDays, earliestRequestedDate } from "@/lib/domain/lead-time";
import { computeOrderSubtotal } from "@/lib/domain/pricing";
import type { Allergen } from "@/lib/content/catalog-master-data";
import { submitOrder } from "@/app/[locale]/(storefront)/checkout/actions";

export function CheckoutForm({
  siteDefaultLeadDays,
  allergens,
}: {
  siteDefaultLeadDays: number;
  allergens: Allergen[];
}) {
  const router = useRouter();
  const { items, clear } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [fulfillmentType, setFulfillmentType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryCity, setDeliveryCity] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [requestedDate, setRequestedDate] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [dietaryAllergenIds, setDietaryAllergenIds] = useState<string[]>([]);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const minDate = useMemo(() => {
    const leadDays = cartLeadDays(
      items.map((i) => ({ productMinPrepDays: i.minPrepDays })),
      siteDefaultLeadDays,
    );
    return earliestRequestedDate(leadDays);
  }, [items, siteDefaultLeadDays]);

  const subtotal = computeOrderSubtotal(
    items.map((i) => ({
      unitPriceCents: i.unitPriceCents,
      lineTotalCents: Math.round(i.unitPriceCents * i.quantity),
    })),
  );

  function toggleAllergen(id: string) {
    setDietaryAllergenIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const { orderId } = await submitOrder({
        customerName,
        customerPhone,
        customerEmail,
        fulfillmentType,
        deliveryAddress,
        deliveryCity,
        deliveryNotes,
        requestedDate,
        customerNote,
        dietaryAllergenIds,
        termsAccepted,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          selectedValueIds: i.selectedOptions.map((o) => o.valueId),
          customNote: i.customNote,
          cakeMessage: i.cakeMessage,
        })),
      });
      clear();
      router.push(`/orders/${orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return <p className="mt-4 text-sm text-ink-soft">Your cart is empty.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex flex-col gap-8 sm:grid sm:grid-cols-[1.5fr_1fr] sm:items-start sm:gap-10">
        <div className="space-y-8">
          <p className="rounded-xl bg-gold-soft p-4 text-sm text-ink-soft">
            Submitting this order sends a <strong className="text-ink">request</strong> -- it
            isn&apos;t confirmed until we approve it. We&apos;ll be in touch to confirm and arrange
            cash or mobile-pay on pickup/delivery.
          </p>

          <fieldset className="space-y-3">
            <legend className="field-label mb-1">Contact info</legend>
            <div>
              <label htmlFor="customerName" className="sr-only">
                Name
              </label>
              <input
                id="customerName"
                required
                placeholder="Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="customerPhone" className="sr-only">
                Phone
              </label>
              <input
                id="customerPhone"
                required
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="customerEmail" className="sr-only">
                Email (optional)
              </label>
              <input
                id="customerEmail"
                type="email"
                placeholder="Email (optional -- for status updates)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="input-field"
              />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="field-label mb-1">Fulfillment</legend>
            <div className="inline-flex rounded-full border border-border-warm bg-surface p-1">
              <button
                type="button"
                onClick={() => setFulfillmentType("pickup")}
                aria-pressed={fulfillmentType === "pickup"}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${fulfillmentType === "pickup" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"}`}
              >
                Pickup
              </button>
              <button
                type="button"
                onClick={() => setFulfillmentType("delivery")}
                aria-pressed={fulfillmentType === "delivery"}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${fulfillmentType === "delivery" ? "bg-brand text-white" : "text-ink-soft hover:text-ink"}`}
              >
                Delivery
              </button>
            </div>
            {fulfillmentType === "delivery" ? (
              <div className="space-y-2 pt-1">
                <div>
                  <label htmlFor="deliveryAddress" className="sr-only">
                    Delivery address
                  </label>
                  <input
                    id="deliveryAddress"
                    required
                    placeholder="Delivery address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="deliveryCity" className="sr-only">
                    City
                  </label>
                  <input
                    id="deliveryCity"
                    required
                    placeholder="City"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label htmlFor="deliveryNotes" className="sr-only">
                    Delivery notes (optional)
                  </label>
                  <input
                    id="deliveryNotes"
                    placeholder="Delivery notes (optional)"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            ) : null}

            <div className="pt-1">
              <label htmlFor="requestedDate" className="field-label mb-1.5">
                Requested date
              </label>
              <div className="relative">
                <input
                  id="requestedDate"
                  type="date"
                  required
                  min={minDate}
                  value={requestedDate}
                  onChange={(e) => setRequestedDate(e.target.value)}
                  className="input-field pr-9"
                />
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-faint"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="16"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M3 9h18M8 3v3M16 3v3"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <p className="mt-1.5 text-xs text-ink-faint">Earliest available: {minDate}</p>
            </div>
          </fieldset>

          {allergens.length > 0 ? (
            <fieldset className="space-y-2">
              <legend className="field-label mb-1">Dietary requests (optional)</legend>
              <p className="text-xs text-ink-faint">
                We&apos;ll review these with your order and confirm what we can accommodate.
              </p>
              <div className="flex flex-wrap gap-2">
                {allergens.map((a) => (
                  <label key={a.id} className="chip-option px-3 py-1.5 text-xs">
                    <input
                      type="checkbox"
                      checked={dietaryAllergenIds.includes(a.id)}
                      onChange={() => toggleAllergen(a.id)}
                      className="sr-only"
                    />
                    No {a.label_i18n.en}
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}

          <div>
            <label htmlFor="customerNote" className="field-label mb-1.5">
              Order note (optional)
            </label>
            <textarea
              id="customerNote"
              rows={2}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="input-field"
            />
          </div>

          <label className="flex items-start gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              required
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="checkbox-field mt-0.5"
            />
            I accept the{" "}
            <a
              href="/legal/terms-of-sale"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand underline hover:text-brand-dark"
            >
              Terms of Sale
            </a>
          </label>
        </div>

        {/* Live order-summary panel -- same pattern as the cart page, so the
            running total stays visible while filling out the form. */}
        <div className="order-summary-panel sm:sticky sm:top-24">
          <p className="font-display text-lg font-semibold text-ink">Order summary</p>
          <div className="mt-4 flex flex-col gap-2">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-ink-soft">
                <span>
                  {item.name} &middot; {item.quantity} {item.unitLabel}
                </span>
                <span>{((item.unitPriceCents * item.quantity) / 100).toFixed(2)} €</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-border-warm pt-4">
            <span className="font-display text-base font-semibold text-ink">Total</span>
            <span className="font-display text-base font-semibold text-brand">
              {(subtotal / 100).toFixed(2)} €
            </span>
          </div>

          {error ? <p className="mt-4 text-sm text-brand-dark">{error}</p> : null}

          <button type="submit" disabled={submitting} className="btn-primary mt-5 w-full py-3">
            {submitting ? "Submitting..." : "Send order request"}
          </button>
        </div>
      </div>
    </form>
  );
}
