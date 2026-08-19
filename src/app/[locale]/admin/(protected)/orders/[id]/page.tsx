import { notFound } from "next/navigation";
import { getOrderForReview } from "@/lib/content/admin-orders";
import {
  approveOrder,
  cancelOrder,
  declineOrder,
  markCompleted,
  markReady,
  anonymizeOrder,
} from "../actions";

export default async function AdminOrderDetailPage(
  props: PageProps<"/[locale]/admin/orders/[id]">,
) {
  const { id } = await props.params;
  const order = await getOrderForReview(id);

  if (!order) {
    notFound();
  }

  const approveThis = approveOrder.bind(null, id);
  const declineThis = declineOrder.bind(null, id);
  const markReadyThis = markReady.bind(null, id);
  const markCompletedThis = markCompleted.bind(null, id);
  const cancelThis = cancelOrder.bind(null, id);
  const anonymizeThis = anonymizeOrder.bind(null, id);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink capitalize">
        {order.order_number} &mdash; {order.status.replace("_", " ")}
      </h1>

      {order.dietary_labels.length > 0 ? (
        <div className="mt-3 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">
          <strong>Dietary requests:</strong> {order.dietary_labels.join(", ")}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
        <div className="card-surface p-4">
          <p className="field-label mb-1.5">Customer</p>
          <p className="text-ink">{order.customer_name}</p>
          <p className="text-ink-soft">{order.customer_phone}</p>
          {order.customer_email ? <p className="text-ink-soft">{order.customer_email}</p> : null}
        </div>
        <div className="card-surface p-4">
          <p className="field-label mb-1.5">Fulfillment</p>
          <p className="text-ink capitalize">
            {order.fulfillment_type} &mdash; {order.requested_date}
          </p>
          {order.fulfillment_type === "delivery" ? (
            <p className="text-ink-soft">
              {order.delivery_address}, {order.delivery_city}
              {order.delivery_notes ? ` (${order.delivery_notes})` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {order.customer_note ? (
        <p className="mt-4 rounded-xl bg-gold-soft p-4 text-sm text-ink-soft">
          Order note: {order.customer_note}
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="card-surface p-4 text-sm">
            <p className="font-medium text-ink">
              {item.quantity} {item.unit_label_snapshot} &times; {item.product_name_snapshot}
            </p>
            {item.options.length > 0 ? (
              <p className="mt-0.5 text-xs text-ink-soft">
                {item.options.map((o) => o.option_value_label_snapshot).join(", ")}
              </p>
            ) : null}
            {item.cake_message ? (
              <p className="mt-0.5 text-xs font-medium text-ink-soft">
                Message: &quot;{item.cake_message}&quot;
              </p>
            ) : null}
            {item.custom_note ? (
              <p className="mt-0.5 text-xs font-medium text-ink-soft">Note: {item.custom_note}</p>
            ) : null}
            {item.allergen_snapshot.length > 0 ? (
              <p className="mt-0.5 text-xs text-brand-dark">
                Allergens: {item.allergen_snapshot.join(", ")}
              </p>
            ) : null}
            <p className="mt-2 text-right font-medium text-ink">
              {(item.line_total_cents / 100).toFixed(2)} €
            </p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-sm text-ink-soft">
        <span className="font-display text-lg font-semibold text-ink">
          Total: {(order.total_cents / 100).toFixed(2)} €
        </span>{" "}
        ({order.payment_method}, {order.payment_status})
      </p>

      {order.decision_reason ? (
        <p className="mt-4 rounded-xl bg-cream p-4 text-sm text-ink-soft">
          Decision note: {order.decision_reason}
        </p>
      ) : null}

      <div className="mt-6 space-y-3 border-t border-border-warm pt-6">
        {order.status === "pending_review" ? (
          <>
            <form action={approveThis} className="flex items-center gap-2">
              <input
                name="message"
                placeholder="Optional message to customer (e.g. ready by Friday 3pm)"
                className="input-field flex-1 py-1.5"
              />
              <button type="submit" className="btn-primary px-4 py-1.5 text-sm">
                Approve
              </button>
            </form>
            <form action={declineThis} className="flex items-center gap-2">
              <input
                name="reason"
                required
                placeholder="Reason (required, shown to customer)"
                className="input-field flex-1 py-1.5"
              />
              <button
                type="submit"
                className="rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
              >
                Decline
              </button>
            </form>
          </>
        ) : null}

        {order.status === "approved" ? (
          <div className="flex gap-2">
            <form action={markReadyThis}>
              <button type="submit" className="btn-primary px-4 py-1.5 text-sm">
                Mark ready
              </button>
            </form>
            <form action={cancelThis}>
              <button type="submit" className="btn-secondary px-4 py-1.5 text-sm">
                Cancel
              </button>
            </form>
          </div>
        ) : null}

        {order.status === "ready" ? (
          <form action={markCompletedThis}>
            <button type="submit" className="btn-primary px-4 py-1.5 text-sm">
              Mark completed
            </button>
          </form>
        ) : null}

        <details className="text-xs text-ink-faint">
          <summary className="cursor-pointer">
            GDPR: anonymize this order&apos;s customer data
          </summary>
          <form action={anonymizeThis} className="mt-2">
            <button
              type="submit"
              className="rounded-full border border-red-300 px-3 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50"
            >
              Anonymize customer PII
            </button>
          </form>
        </details>
      </div>
    </div>
  );
}
