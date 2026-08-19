import { getSiteSettings } from "@/lib/content/site-settings";
import { Link } from "@/i18n/navigation";
import { CartLink } from "./CartLink";

export async function Header() {
  const settings = await getSiteSettings();
  const name = settings.business_name || "Newari Sweets";

  return (
    <header className="sticky top-0 z-30 border-b border-border-warm bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-tight text-ink transition-colors hover:text-brand"
        >
          {name}
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/products"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-brand"
          >
            Shop
          </Link>
          <CartLink />
        </div>
      </nav>
    </header>
  );
}
