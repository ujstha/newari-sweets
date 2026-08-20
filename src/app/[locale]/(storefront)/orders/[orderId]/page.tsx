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

const STATUS_TONE: Record<string, string> = {
  pending_review: "bg-gold-soft text-ink-soft",
  approved: "bg-brand-soft text-brand-dark",
  declined: "bg-ink/5 text-ink-soft",
  ready: "bg-brand-soft text-brand-dark",
  completed: "bg-brand text-white",
  cancelled: "bg-ink/5 text-ink-soft",
};

// The happy-path workflow only -- declined/cancelled are terminal exits,
// not further steps on this line, so the stepper only renders for statuses
// that are actually progressing along it.
const STEPS = [
  { status: "pending_review", label: "Pending review" },
  { status: "approved", label: "Approved" },
  { status: "ready", label: "Ready" },
  { status: "completed", label: "Completed" },
] as const;

function StatusStepper({ status }: { status: string }) {
  const currentIndex = STEPS.findIndex((s) => s.status === status);
  if (currentIndex === -1) return null;

  return (
    <div className="mt-8 flex items-center">
      {STEPS.map((step, i) => (
        <div key={step.status} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                i < currentIndex
                  ? "bg-brand text-white"
                  : i === currentIndex
                    ? "border-2 border-gold bg-gold-soft text-ink"
                    : "border-2 border-border-warm bg-surface text-ink-faint"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`mt-1.5 text-center text-[11px] font-medium ${i <= currentIndex ? "text-ink" : "text-ink-faint"}`}
            >
              {step.label}
            </span>
          </div>
          {i < STEPS.length - 1 ? (
            <span
              className={`mb-4 h-0.5 flex-1 ${i < currentIndex ? "bg-gold" : "bg-border-warm"}`}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}

export default async function OrderStatusPage(props: PageProps<"/[locale]/orders/[orderId]">) {
  const { orderId } = await props.params;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_order_status", { p_order_id: orderId });
  const order = data as OrderStatus | null;

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10 sm:px-8 sm:py-14">
      <h1 className="font-display text-2xl font-semibold text-ink">Order {order.order_number}</h1>
      <span
        className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${STATUS_TONE[order.status] ?? "bg-ink/5 text-ink-soft"}`}
      >
        {STATUS_LABELS[order.status] ?? order.status}
      </span>

      <StatusStepper status={order.status} />

      {order.decision_reason ? (
        <p className="mt-4 rounded-xl bg-gold-soft p-4 text-sm text-ink-soft">
          {order.decision_reason}
        </p>
      ) : null}

      {order.status === "pending_review" ? (
        <p className="mt-4 text-sm text-ink-soft">
          This is an order request, not a confirmed order. We&apos;ll be in touch to confirm and
          arrange cash or mobile-pay on pickup/delivery.
        </p>
      ) : null}

      <p className="mt-5 text-sm text-ink-soft">
        {order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"} requested for{" "}
        <span className="font-medium text-ink">{order.requested_date}</span>
      </p>

      <ul className="mt-6 space-y-3">
        {order.items.map((item, i) => (
          <li key={i} className="card-surface p-4 text-sm">
            <p className="font-medium text-ink">
              {item.quantity} {item.unit_label_snapshot} &times; {item.product_name_snapshot}
            </p>
            {item.options.length > 0 ? (
              <p className="mt-0.5 text-xs text-ink-soft">
                {item.options.map((o) => o.option_value_label_snapshot).join(", ")}
              </p>
            ) : null}
            {item.cake_message ? (
              <p className="mt-0.5 text-xs text-ink-soft">
                Message: &quot;{item.cake_message}&quot;
              </p>
            ) : null}
            {item.custom_note ? (
              <p className="mt-0.5 text-xs text-ink-soft">Note: {item.custom_note}</p>
            ) : null}
            <p className="mt-2 text-right font-medium text-ink">
              {(item.line_total_cents / 100).toFixed(2)} €
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-right font-display text-xl font-semibold text-ink">
        Total: {(order.total_cents / 100).toFixed(2)} €
      </p>

      <p className="mt-8 text-center text-xs text-ink-faint">
        Bookmark this page to check your order status anytime.
      </p>
    </main>
  );
}
