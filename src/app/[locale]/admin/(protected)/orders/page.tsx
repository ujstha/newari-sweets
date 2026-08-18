import { Link } from "@/i18n/navigation";
import { getOrderQueue } from "@/lib/content/admin-orders";

const STATUS_ORDER = ["pending_review", "approved", "ready", "completed", "declined", "cancelled"];

export default async function AdminOrdersPage() {
  const orders = await getOrderQueue();
  const sorted = [...orders].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-xl font-semibold">Orders</h1>

      <ul className="mt-6 space-y-2">
        {sorted.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/orders/${order.id}`}
              className="flex items-center justify-between rounded border p-3 text-sm hover:shadow"
            >
              <div>
                <span className="font-medium">{order.order_number}</span>{" "}
                <span className="text-gray-600">{order.customer_name}</span>
                {order.has_dietary_requests ? (
                  <span className="ml-2 rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700">
                    dietary
                  </span>
                ) : null}
                {order.has_notes ? (
                  <span className="ml-1 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                    note
                  </span>
                ) : null}
                <p className="text-xs text-gray-500">
                  {order.fulfillment_type} &middot; requested {order.requested_date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase text-gray-500">{order.status.replace("_", " ")}</p>
                <p className="font-medium">{(order.total_cents / 100).toFixed(2)} €</p>
              </div>
            </Link>
          </li>
        ))}
        {orders.length === 0 ? <p className="text-sm text-gray-600">No orders yet.</p> : null}
      </ul>
    </main>
  );
}
