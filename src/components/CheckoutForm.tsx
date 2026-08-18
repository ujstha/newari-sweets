"use client";

import { useMemo, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/CartContext";
import { cartLeadDays, earliestRequestedDate } from "@/lib/domain/lead-time";
import { computeOrderSubtotal } from "@/lib/domain/pricing";
import type { Allergen } from "@/lib/content/catalog-master-data";
import { submitOrder } from "@/app/[locale]/checkout/actions";

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
    return <p className="mt-4 text-sm text-gray-600">Your cart is empty.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      <p className="rounded bg-gray-50 p-3 text-sm text-gray-700">
        Submitting this order sends a <strong>request</strong> -- it isn&apos;t confirmed until we
        approve it. We&apos;ll be in touch to confirm and arrange cash or mobile-pay on
        pickup/delivery.
      </p>

      <fieldset className="space-y-3">
        <legend className="font-medium">Contact info</legend>
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
            className="w-full rounded border px-3 py-2 text-sm"
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
            className="w-full rounded border px-3 py-2 text-sm"
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
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-medium">Fulfillment</legend>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFulfillmentType("pickup")}
            aria-pressed={fulfillmentType === "pickup"}
            className={`rounded px-3 py-1 text-sm ${fulfillmentType === "pickup" ? "bg-black text-white" : "border"}`}
          >
            Pickup
          </button>
          <button
            type="button"
            onClick={() => setFulfillmentType("delivery")}
            aria-pressed={fulfillmentType === "delivery"}
            className={`rounded px-3 py-1 text-sm ${fulfillmentType === "delivery" ? "bg-black text-white" : "border"}`}
          >
            Delivery
          </button>
        </div>
        {fulfillmentType === "delivery" ? (
          <div className="space-y-2">
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
                className="w-full rounded border px-3 py-2 text-sm"
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
                className="w-full rounded border px-3 py-2 text-sm"
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
                className="w-full rounded border px-3 py-2 text-sm"
              />
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="requestedDate" className="block text-sm font-medium">
            Requested date
          </label>
          <input
            id="requestedDate"
            type="date"
            required
            min={minDate}
            value={requestedDate}
            onChange={(e) => setRequestedDate(e.target.value)}
            className="mt-1 rounded border px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-gray-500">Earliest available: {minDate}</p>
        </div>
      </fieldset>

      {allergens.length > 0 ? (
        <fieldset className="space-y-2">
          <legend className="font-medium">Dietary requests (optional)</legend>
          <p className="text-xs text-gray-500">
            We&apos;ll review these with your order and confirm what we can accommodate.
          </p>
          <div className="flex flex-wrap gap-3">
            {allergens.map((a) => (
              <label key={a.id} className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={dietaryAllergenIds.includes(a.id)}
                  onChange={() => toggleAllergen(a.id)}
                />
                No {a.label_i18n.en}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div>
        <label htmlFor="customerNote" className="block text-sm font-medium">
          Order note (optional)
        </label>
        <textarea
          id="customerNote"
          rows={2}
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <label className="flex items-start gap-2 text-sm">
        <input
          type="checkbox"
          required
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
        />
        I accept the{" "}
        <a
          href="/legal/terms-of-sale"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Terms of Sale
        </a>
      </label>

      <p className="text-lg font-semibold">Total: {(subtotal / 100).toFixed(2)} €</p>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitting ? "Submitting..." : "Submit order request"}
      </button>
    </form>
  );
}
