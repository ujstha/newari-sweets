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
      <p className="mt-4 text-sm text-gray-600">
        Catalog, orders, and content management land here in later phases.
      </p>
    </main>
  );
}
