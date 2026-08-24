"use client";

import { Link, usePathname } from "@/i18n/navigation";

type NavIcon = (props: { className?: string }) => React.ReactNode;

const DashboardIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect x="3" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="3" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const OrdersIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M6 3h12v16l-3-2-3 2-3-2-3 2V3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const ProductsIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M20 12.5 12.5 20 4 11.5V4h7.5L20 12.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    <circle cx="8" cy="8" r="1.4" fill="currentColor" />
  </svg>
);

const CategoriesIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const IngredientsIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M9 3h6M10 3v5.5L5.5 16a2 2 0 0 0 1.7 3h9.6a2 2 0 0 0 1.7-3L14 8.5V3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ContentIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M6 3h9l4 4v14H6V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PagesIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path d="M7 3h7l4 4v14H7V3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M5 7v14h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const SecurityIcon: NavIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6l-7-3Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  </svg>
);

const GROUPS: {
  heading: string | null;
  links: { href: string; label: string; icon: NavIcon }[];
}[] = [
  {
    heading: null,
    links: [{ href: "/admin", label: "Dashboard", icon: DashboardIcon }],
  },
  {
    heading: null,
    links: [{ href: "/admin/orders", label: "Orders", icon: OrdersIcon }],
  },
  {
    heading: "Catalog",
    links: [
      { href: "/admin/products", label: "Products", icon: ProductsIcon },
      { href: "/admin/categories", label: "Categories", icon: CategoriesIcon },
      { href: "/admin/ingredients", label: "Ingredients", icon: IngredientsIcon },
    ],
  },
  {
    heading: "Content",
    links: [
      { href: "/admin/settings", label: "Site content", icon: ContentIcon },
      { href: "/admin/content", label: "Pages", icon: PagesIcon },
    ],
  },
  {
    heading: null,
    links: [{ href: "/admin/security", label: "Security", icon: SecurityIcon }],
  },
];

export function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-4 px-3">
      {GROUPS.map((group, i) => (
        <div key={i} className="flex flex-col gap-1">
          {group.heading ? (
            <p className="px-3.5 pb-1 text-xs font-medium tracking-widest text-ink-faint uppercase">
              {group.heading}
            </p>
          ) : null}
          {group.links.map((link) => {
            const active =
              link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 rounded-lg px-3.5 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? "bg-brand text-white"
                    : "text-ink-soft hover:bg-brand-soft hover:text-brand-dark"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
