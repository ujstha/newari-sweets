import { getSiteSettings } from "@/lib/content/site-settings";
import { Link } from "@/i18n/navigation";
import { CartLink } from "./CartLink";

export async function Header() {
  const settings = await getSiteSettings();
  const name = settings.business_name || "Newari Sweets";

  return (
    <header className="border-b px-4 py-4">
      <nav className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          {name}
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/products" className="text-sm">
            Shop
          </Link>
          <CartLink />
        </div>
      </nav>
    </header>
  );
}
