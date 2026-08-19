import { Link } from "@/i18n/navigation";

const QUICK_LINKS = [
  { href: "/admin/orders", label: "Orders", desc: "Review and approve incoming order requests" },
  { href: "/admin/products", label: "Products", desc: "Manage the catalog, options, and images" },
  {
    href: "/admin/settings",
    label: "Site content",
    desc: "Business info, hero, announcement banner",
  },
] as const;

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Admin</h1>
      <p className="mt-1 text-sm text-ink-soft">Manage orders, catalog, and site content.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="card-surface p-5 transition-shadow hover:shadow-md"
          >
            <p className="font-display text-base font-medium text-ink">{link.label}</p>
            <p className="mt-1 text-sm text-ink-soft">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
