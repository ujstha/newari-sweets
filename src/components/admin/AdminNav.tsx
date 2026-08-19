"use client";

import { Link, usePathname } from "@/i18n/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/ingredients", label: "Ingredients" },
  { href: "/admin/settings", label: "Site content" },
  { href: "/admin/content", label: "Pages" },
  { href: "/admin/security", label: "Security" },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto px-4 py-2 sm:flex-col sm:overflow-visible sm:px-3 sm:py-0">
      {LINKS.map((link) => {
        const active =
          link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:rounded-lg ${
              active
                ? "bg-brand text-white"
                : "text-ink-soft hover:bg-brand-soft hover:text-brand-dark"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
