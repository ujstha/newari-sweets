import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

interface OrderStatusItem {
  product_name_snapshot: string;
  quantity: number;
  unit_label_snapshot: string;
  line_total_cents: number;
  custom_note: string | null;
  cake_message: string | null;
  options: { option_group_name_snapshot: string; option_value_label_snapshot: string }[];
}

interface OrderStatus {
  order_number: string;
  status: string;
  requested_date: string;
  fulfillment_type: "pickup" | "delivery";
  decision_reason: string | null;
  subtotal_cents: number;
  total_cents: number;
  created_at: string;
  items: OrderStatusItem[];
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: "Pending review -- we'll confirm soon",
  approved: "Approved -- we're preparing your order",
  declined: "Declined",
  ready: "Ready for pickup/delivery",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default async function OrderStatusPage(props: PageProps<"/[locale]/orders/[orderId]">) {
  const { orderId } = await props.params;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_order_status", { p_order_id: orderId });
  const order = data as OrderStatus | null;

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-xl font-semibold">Order {order.order_number}</h1>
      <p className="mt-2 text-lg font-medium">{STATUS_LABELS[order.status] ?? order.status}</p>

      {order.decision_reason ? (
        <p className="mt-2 rounded bg-gray-50 p-3 text-sm text-gray-700">{order.decision_reason}</p>
      ) : null}

      {order.status === "pending_review" ? (
        <p className="mt-2 text-sm text-gray-600">
          This is an order request, not a confirmed order. We&apos;ll be in touch to confirm and
          arrange cash or mobile-pay on pickup/delivery.
        </p>
      ) : null}

      <p className="mt-4 text-sm text-gray-600">
        {order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"} requested for{" "}
        {order.requested_date}
      </p>

      <ul className="mt-6 space-y-3">
        {order.items.map((item, i) => (
          <li key={i} className="rounded border p-3 text-sm">
            <p className="font-medium">
              {item.quantity} {item.unit_label_snapshot} &times; {item.product_name_snapshot}
            </p>
            {item.options.length > 0 ? (
              <p className="text-xs text-gray-500">
                {item.options.map((o) => o.option_value_label_snapshot).join(", ")}
              </p>
            ) : null}
            {item.cake_message ? (
              <p className="text-xs text-gray-500">Message: &quot;{item.cake_message}&quot;</p>
            ) : null}
            {item.custom_note ? (
              <p className="text-xs text-gray-500">Note: {item.custom_note}</p>
            ) : null}
            <p className="mt-1 text-right">{(item.line_total_cents / 100).toFixed(2)} €</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg font-semibold">
        Total: {(order.total_cents / 100).toFixed(2)} €
      </p>

      <p className="mt-6 text-xs text-gray-500">
        Bookmark this page to check your order status anytime.
      </p>
    </main>
  );
}
