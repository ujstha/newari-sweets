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
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">
        {order.order_number} -- {order.status.replace("_", " ")}
      </h1>

      {order.dietary_labels.length > 0 ? (
        <div className="mt-3 rounded bg-red-50 p-3 text-sm text-red-800">
          <strong>Dietary requests:</strong> {order.dietary_labels.join(", ")}
        </div>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="font-medium">Customer</p>
          <p>{order.customer_name}</p>
          <p>{order.customer_phone}</p>
          {order.customer_email ? <p>{order.customer_email}</p> : null}
        </div>
        <div>
          <p className="font-medium">Fulfillment</p>
          <p>
            {order.fulfillment_type} -- {order.requested_date}
          </p>
          {order.fulfillment_type === "delivery" ? (
            <p>
              {order.delivery_address}, {order.delivery_city}
              {order.delivery_notes ? ` (${order.delivery_notes})` : ""}
            </p>
          ) : null}
        </div>
      </div>

      {order.customer_note ? (
        <p className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-800">
          Order note: {order.customer_note}
        </p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {order.items.map((item) => (
          <li key={item.id} className="rounded border p-3 text-sm">
            <p className="font-medium">
              {item.quantity} {item.unit_label_snapshot} &times; {item.product_name_snapshot}
            </p>
            {item.options.length > 0 ? (
              <p className="text-xs text-gray-500">
                {item.options.map((o) => o.option_value_label_snapshot).join(", ")}
              </p>
            ) : null}
            {item.cake_message ? (
              <p className="text-xs font-medium text-amber-700">
                Message: &quot;{item.cake_message}&quot;
              </p>
            ) : null}
            {item.custom_note ? (
              <p className="text-xs font-medium text-amber-700">Note: {item.custom_note}</p>
            ) : null}
            {item.allergen_snapshot.length > 0 ? (
              <p className="text-xs text-red-600">Allergens: {item.allergen_snapshot.join(", ")}</p>
            ) : null}
            <p className="mt-1 text-right">{(item.line_total_cents / 100).toFixed(2)} €</p>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-right text-lg font-semibold">
        Total: {(order.total_cents / 100).toFixed(2)} € ({order.payment_method},{" "}
        {order.payment_status})
      </p>

      {order.decision_reason ? (
        <p className="mt-4 rounded bg-gray-50 p-3 text-sm">
          Decision note: {order.decision_reason}
        </p>
      ) : null}

      <div className="mt-6 space-y-3 border-t pt-6">
        {order.status === "pending_review" ? (
          <>
            <form action={approveThis} className="flex items-center gap-2">
              <input
                name="message"
                placeholder="Optional message to customer (e.g. ready by Friday 3pm)"
                className="flex-1 rounded border px-2 py-1 text-sm"
              />
              <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
                Approve
              </button>
            </form>
            <form action={declineThis} className="flex items-center gap-2">
              <input
                name="reason"
                required
                placeholder="Reason (required, shown to customer)"
                className="flex-1 rounded border px-2 py-1 text-sm"
              />
              <button
                type="submit"
                className="rounded border border-red-600 px-3 py-1 text-sm text-red-600"
              >
                Decline
              </button>
            </form>
          </>
        ) : null}

        {order.status === "approved" ? (
          <div className="flex gap-2">
            <form action={markReadyThis}>
              <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
                Mark ready
              </button>
            </form>
            <form action={cancelThis}>
              <button type="submit" className="rounded border px-3 py-1 text-sm">
                Cancel
              </button>
            </form>
          </div>
        ) : null}

        {order.status === "ready" ? (
          <form action={markCompletedThis}>
            <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
              Mark completed
            </button>
          </form>
        ) : null}

        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer">
            GDPR: anonymize this order&apos;s customer data
          </summary>
          <form action={anonymizeThis} className="mt-2">
            <button type="submit" className="rounded border border-red-600 px-2 py-1 text-red-600">
              Anonymize customer PII
            </button>
          </form>
        </details>
      </div>
    </main>
  );
}
