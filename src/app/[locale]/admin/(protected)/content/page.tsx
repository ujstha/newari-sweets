import { Link } from "@/i18n/navigation";
import { PAGE_CONTENT_KEYS } from "@/lib/content/page-content";
import { PAGE_CONTENT_LABELS } from "@/lib/content/page-content-labels";

export default function AdminContentListPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Pages</h1>
      <p className="mt-1 text-sm text-gray-600">
        A fixed set of pages -- adding arbitrary new pages is a later phase.
      </p>
      <ul className="mt-6 space-y-2">
        {PAGE_CONTENT_KEYS.map((key) => (
          <li key={key}>
            <Link href={`/admin/content/${key}`} className="text-sm underline">
              {PAGE_CONTENT_LABELS[key]}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
