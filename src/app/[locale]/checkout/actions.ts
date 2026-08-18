"use server";

import { createClient } from "@/lib/supabase/server";
import { getProductForOrder } from "@/lib/content/public-catalog";
import { getSiteSettings } from "@/lib/content/site-settings";
import { computeLinePrice } from "@/lib/domain/pricing";
import { computeDisplayedAllergens } from "@/lib/domain/ingredients";
import { cartLeadDays, earliestRequestedDate, effectiveLeadDays } from "@/lib/domain/lead-time";

export interface SubmitOrderItemInput {
  productId: string;
  quantity: number;
  selectedValueIds: string[];
  customNote: string;
  cakeMessage: string;
}

export interface SubmitOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillmentType: "pickup" | "delivery";
  deliveryAddress: string;
  deliveryCity: string;
  deliveryNotes: string;
  requestedDate: string;
  customerNote: string;
  dietaryAllergenIds: string[];
  termsAccepted: boolean;
  items: SubmitOrderItemInput[];
}

// The server-side re-pricing/re-validation authority -- client-submitted
// prices are never trusted (see PLAN.md's "Order creation" note). Every
// product/option value is re-fetched fresh here by id; only the resulting
// numbers, never anything the client computed, are passed to create_order.
export async function submitOrder(input: SubmitOrderInput): Promise<{ orderId: string }> {
  if (!input.termsAccepted) {
    throw new Error("You must accept the Terms of Sale to place an order.");
  }
  if (input.items.length === 0) {
    throw new Error("Your cart is empty.");
  }
  if (!input.customerName.trim() || !input.customerPhone.trim()) {
    throw new Error("Name and phone are required.");
  }
  if (
    input.fulfillmentType === "delivery" &&
    (!input.deliveryAddress.trim() || !input.deliveryCity.trim())
  ) {
    throw new Error("Delivery address and city are required for delivery orders.");
  }

  const settings = await getSiteSettings();

  const items = [];
  const leadInputs: { productMinPrepDays: number | null }[] = [];

  for (const item of input.items) {
    const product = await getProductForOrder(item.productId);
    if (!product) {
      throw new Error(
        "One of the items in your cart is no longer available. Please review your cart.",
      );
    }

    const allValues = product.option_groups.flatMap((g) => g.option_values);
    const selectedValues = item.selectedValueIds.map((id) => {
      const value = allValues.find((v) => v.id === id);
      if (!value) {
        throw new Error(
          `An option for "${product.name_i18n.en}" is no longer available. Please review your cart.`,
        );
      }
      return value;
    });

    const price = computeLinePrice({
      product: { id: product.id, basePriceCents: product.base_price_cents },
      selectedOptionValues: selectedValues.map((v) => ({
        id: v.id,
        priceDeltaCents: v.price_delta_cents,
      })),
      quantity: item.quantity,
    });

    const allergens = computeDisplayedAllergens(
      product.base_allergens,
      selectedValues.map((v) => ({ id: v.id, ingredient: v.ingredient })),
    );

    const groupByValueId = new Map(
      product.option_groups.flatMap((g) => g.option_values.map((v) => [v.id, g.name] as const)),
    );

    items.push({
      product_id: product.id,
      product_name_snapshot: product.name_i18n.en ?? "",
      unit_price_cents: price.unitPriceCents,
      unit_label_snapshot: product.unit.code,
      quantity: item.quantity,
      custom_note: item.customNote,
      cake_message: product.supports_message ? item.cakeMessage : "",
      allergen_snapshot: allergens.map((a) => a.code),
      line_total_cents: price.lineTotalCents,
      options: selectedValues.map((v) => ({
        option_group_name_snapshot: groupByValueId.get(v.id) ?? "",
        option_value_label_snapshot: v.label,
        price_delta_cents_snapshot: v.price_delta_cents,
      })),
    });

    leadInputs.push({
      productMinPrepDays: effectiveLeadDays(product.min_prep_days, settings.default_min_prep_days),
    });
  }

  const requiredLeadDays = cartLeadDays(leadInputs, settings.default_min_prep_days);
  const earliest = earliestRequestedDate(requiredLeadDays);
  if (input.requestedDate < earliest) {
    throw new Error(`The earliest available date for this order is ${earliest}.`);
  }

  const supabase = await createClient();
  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_customer_name: input.customerName.trim(),
    p_customer_phone: input.customerPhone.trim(),
    p_customer_email: input.customerEmail.trim() || null,
    p_fulfillment_type: input.fulfillmentType,
    p_delivery_address: input.fulfillmentType === "delivery" ? input.deliveryAddress.trim() : null,
    p_delivery_city: input.fulfillmentType === "delivery" ? input.deliveryCity.trim() : null,
    p_delivery_notes:
      input.fulfillmentType === "delivery" ? input.deliveryNotes.trim() || null : null,
    p_requested_date: input.requestedDate,
    p_customer_note: input.customerNote.trim() || null,
    p_dietary_allergen_ids: input.dietaryAllergenIds,
    p_items: items,
  });

  if (error || !orderId) {
    throw new Error(error?.message ?? "Could not submit your order. Please try again.");
  }

  return { orderId };
}
