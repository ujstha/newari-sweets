import { getSiteSettings } from "@/lib/content/site-settings";
import { Link } from "@/i18n/navigation";
import { CartLink } from "./CartLink";
import { FavoritesLink } from "./FavoritesLink";
import { LogoMark } from "./LogoMark";

export async function Header() {
  const settings = await getSiteSettings();
  const name = settings.business_name || "Newari Sweets";

  return (
    <header className="sticky top-0 z-30 border-b border-border-warm bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <LogoMark className="transition-transform group-hover:scale-105" />
          <span className="hidden font-display text-xl font-semibold tracking-tight text-ink transition-colors group-hover:text-brand sm:inline">
            {name}
          </span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-6">
          <Link
            href="/products"
            className="text-sm font-medium text-ink-soft transition-colors hover:text-brand"
          >
            Shop
          </Link>
          <FavoritesLink />
          <CartLink />
        </div>
      </nav>
    </header>
  );
}
