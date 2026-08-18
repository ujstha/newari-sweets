import { createClient } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/domain/order-workflow";

export interface OrderQueueItem {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  fulfillment_type: "pickup" | "delivery";
  requested_date: string;
  total_cents: number;
  created_at: string;
  has_dietary_requests: boolean;
  has_notes: boolean;
}

export async function getOrderQueue(): Promise<OrderQueueItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      "id, order_number, status, customer_name, fulfillment_type, requested_date, total_cents, created_at, customer_note, order_dietary_requests(order_id), order_items(custom_note, cake_message)",
    )
    .order("requested_date");

  return (data ?? []).map((o) => {
    const items = o.order_items as { custom_note: string | null; cake_message: string | null }[];
    return {
      id: o.id,
      order_number: o.order_number,
      status: o.status as OrderStatus,
      customer_name: o.customer_name,
      fulfillment_type: o.fulfillment_type,
      requested_date: o.requested_date,
      total_cents: o.total_cents,
      created_at: o.created_at,
      has_dietary_requests: (o.order_dietary_requests as unknown[]).length > 0,
      has_notes: !!o.customer_note || items.some((i) => i.custom_note || i.cake_message),
    };
  });
}

export interface OrderDetailItem {
  id: string;
  product_name_snapshot: string;
  quantity: number;
  unit_label_snapshot: string;
  unit_price_cents: number;
  line_total_cents: number;
  custom_note: string | null;
  cake_message: string | null;
  allergen_snapshot: string[];
  options: { option_group_name_snapshot: string; option_value_label_snapshot: string }[];
}

export interface OrderDetail {
  id: string;
  order_number: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  fulfillment_type: "pickup" | "delivery";
  delivery_address: string | null;
  delivery_city: string | null;
  delivery_notes: string | null;
  requested_date: string;
  customer_note: string | null;
  decision_reason: string | null;
  payment_status: string;
  payment_method: string;
  subtotal_cents: number;
  total_cents: number;
  admin_notes: string | null;
  created_at: string;
  dietary_labels: string[];
  items: OrderDetailItem[];
}

export async function getOrderForReview(id: string): Promise<OrderDetail | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select(
      `id, order_number, status, customer_name, customer_phone, customer_email,
       fulfillment_type, delivery_address, delivery_city, delivery_notes,
       requested_date, customer_note, decision_reason, payment_status,
       payment_method, subtotal_cents, total_cents, admin_notes, created_at,
       order_dietary_requests(allergen:allergens(label_i18n)),
       order_items(id, product_name_snapshot, quantity, unit_label_snapshot,
         unit_price_cents, line_total_cents, custom_note, cake_message, allergen_snapshot,
         order_item_options(option_group_name_snapshot, option_value_label_snapshot))`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!data) return null;

  const dietary = data.order_dietary_requests as unknown as {
    allergen: { label_i18n: Record<string, string> };
  }[];
  const items = data.order_items as unknown as (OrderDetailItem & {
    order_item_options: OrderDetailItem["options"];
  })[];

  return {
    ...data,
    status: data.status as OrderStatus,
    dietary_labels: dietary.map((d) => d.allergen.label_i18n.en ?? ""),
    items: items.map((i) => ({ ...i, options: i.order_item_options })),
  };
}
