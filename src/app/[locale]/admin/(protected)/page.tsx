import { Link } from "@/i18n/navigation";
import { signOut } from "../actions";

export default function AdminDashboardPage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin</h1>
        <form action={signOut}>
          <button type="submit" className="text-sm underline">
            Sign out
          </button>
        </form>
      </div>
      <ul className="mt-6 space-y-2">
        <li>
          <Link href="/admin/settings" className="text-sm underline">
            Site content (business info, hero, banner)
          </Link>
        </li>
        <li>
          <Link href="/admin/content" className="text-sm underline">
            Pages (about, legal)
          </Link>
        </li>
      </ul>
      <p className="mt-6 text-sm text-gray-600">
        Catalog and order management land here in later phases.
      </p>
    </main>
  );
}
