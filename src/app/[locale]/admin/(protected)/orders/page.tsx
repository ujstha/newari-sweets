import { Link } from "@/i18n/navigation";
import { getOrderQueue } from "@/lib/content/admin-orders";

const STATUS_ORDER = ["pending_review", "approved", "ready", "completed", "declined", "cancelled"];

export default async function AdminOrdersPage(props: PageProps<"/[locale]/admin/orders">) {
  const searchParams = await props.searchParams;
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "";
  const query = (typeof searchParams.q === "string" ? searchParams.q : "").trim().toLowerCase();

  const allOrders = await getOrderQueue();

  const filtered = allOrders.filter((order) => {
    if (statusFilter && order.status !== statusFilter) return false;
    if (
      query &&
      !order.customer_name.toLowerCase().includes(query) &&
      !order.customer_phone.toLowerCase().includes(query) &&
      !order.order_number.toLowerCase().includes(query)
    ) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered].sort(
    (a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status),
  );

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-xl font-semibold">Orders</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <select
          name="status"
          defaultValue={statusFilter}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </select>
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name, phone, or order #"
          className="flex-1 rounded border px-2 py-1 text-sm"
        />
        <button type="submit" className="rounded bg-black px-3 py-1 text-sm text-white">
          Filter
        </button>
        {statusFilter || query ? (
          <Link href="/admin/orders" className="text-sm underline">
            Clear
          </Link>
        ) : null}
      </form>

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
        {sorted.length === 0 ? (
          <p className="text-sm text-gray-600">
            {allOrders.length === 0 ? "No orders yet." : "No orders match this filter."}
          </p>
        ) : null}
      </ul>
    </main>
  );
}
