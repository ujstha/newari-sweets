import { getSiteSettings } from "@/lib/content/site-settings";
import { Link } from "@/i18n/navigation";

export async function Header() {
  const settings = await getSiteSettings();
  const name = settings.business_name || "Newari Sweets";

  return (
    <header className="border-b px-4 py-4">
      <nav className="mx-auto flex max-w-4xl items-center justify-between">
        <Link href="/" className="text-lg font-semibold">
          {name}
        </Link>
      </nav>
    </header>
  );
}
