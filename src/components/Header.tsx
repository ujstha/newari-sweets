import { Link } from "@/i18n/navigation";
import { CartLink } from "./CartLink";
import { FavoritesLink } from "./FavoritesLink";
import { LogoMark } from "./LogoMark";

// No longer async / no longer fetches site settings -- the business name
// used to render as a text span next to the logo, but the logo artwork
// already carries "Newari Sweets" itself now, so there's nothing here
// left to source from the CMS.
export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border-warm bg-cream/90 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-8">
        <Link href="/" className="group flex items-center">
          <LogoMark className="transition-transform group-hover:scale-105" />
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <Link
            href="/products"
            className="text-sm font-semibold text-ink transition-colors hover:text-brand"
          >
            Shop
          </Link>
          {/* Utility cluster -- kept visually distinct from "Shop" (a
              primary nav destination) since these are quick actions, not
              navigation. Grouped tightly so they read as one unit instead
              of unrelated pills. Theme switcher lives in the footer, not
              here (a per-visitor preference, not core navigation). */}
          <div className="flex items-center gap-1">
            <FavoritesLink />
            <CartLink />
          </div>
        </div>
      </nav>
    </header>
  );
}
