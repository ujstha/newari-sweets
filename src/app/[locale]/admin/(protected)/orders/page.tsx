import { Link } from "@/i18n/navigation";
import { getOrderQueue } from "@/lib/content/admin-orders";
import { SelectField } from "@/components/SelectField";

const STATUS_ORDER = ["pending_review", "approved", "ready", "completed", "declined", "cancelled"];

const STATUS_TONE: Record<string, string> = {
  pending_review: "bg-gold-soft text-ink-soft",
  approved: "bg-brand-soft text-brand-dark",
  ready: "bg-brand-soft text-brand-dark",
  completed: "bg-brand text-white",
  declined: "bg-ink/5 text-ink-soft",
  cancelled: "bg-ink/5 text-ink-soft",
};

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
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Orders</h1>

      <form className="mt-4 flex flex-wrap gap-2" method="get">
        <SelectField name="status" defaultValue={statusFilter} className="w-auto py-1.5">
          <option value="">All statuses</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ")}
            </option>
          ))}
        </SelectField>
        <input
          name="q"
          defaultValue={query}
          placeholder="Search name, phone, or order #"
          className="input-field flex-1 py-1.5"
        />
        <button type="submit" className="btn-secondary px-4 py-1.5 text-sm">
          Filter
        </button>
        {statusFilter || query ? (
          <Link href="/admin/orders" className="btn-ghost px-3 py-1.5 text-sm">
            Clear
          </Link>
        ) : null}
      </form>

      <ul className="mt-6 space-y-2">
        {sorted.map((order) => (
          <li key={order.id}>
            <Link
              href={`/admin/orders/${order.id}`}
              className="card-surface flex items-center justify-between p-4 text-sm transition-shadow hover:shadow-md"
            >
              <div>
                <span className="font-medium text-ink">{order.order_number}</span>{" "}
                <span className="text-ink-soft">{order.customer_name}</span>
                {order.has_dietary_requests ? (
                  <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand-dark">
                    dietary
                  </span>
                ) : null}
                {order.has_notes ? (
                  <span className="ml-1 rounded-full bg-gold-soft px-2 py-0.5 text-xs font-medium text-ink-soft">
                    note
                  </span>
                ) : null}
                <p className="mt-0.5 text-xs text-ink-faint">
                  {order.fulfillment_type} &middot; requested {order.requested_date}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_TONE[order.status] ?? "bg-ink/5 text-ink-soft"}`}
                >
                  {order.status.replace("_", " ")}
                </span>
                <p className="mt-1 font-medium text-ink">
                  {(order.total_cents / 100).toFixed(2)} €
                </p>
              </div>
            </Link>
          </li>
        ))}
        {sorted.length === 0 ? (
          <p className="text-sm text-ink-soft">
            {allOrders.length === 0 ? "No orders yet." : "No orders match this filter."}
          </p>
        ) : null}
      </ul>
    </div>
  );
}
