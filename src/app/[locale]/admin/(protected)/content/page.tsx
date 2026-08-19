import { Link } from "@/i18n/navigation";
import { PAGE_CONTENT_KEYS } from "@/lib/content/page-content";
import { PAGE_CONTENT_LABELS } from "@/lib/content/page-content-labels";

export default function AdminContentListPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Pages</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A fixed set of pages -- adding arbitrary new pages is a later phase.
      </p>
      <ul className="mt-6 space-y-2">
        {PAGE_CONTENT_KEYS.map((key) => (
          <li key={key}>
            <Link
              href={`/admin/content/${key}`}
              className="card-surface block p-4 text-sm font-medium text-ink transition-shadow hover:shadow-md"
            >
              {PAGE_CONTENT_LABELS[key]}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
