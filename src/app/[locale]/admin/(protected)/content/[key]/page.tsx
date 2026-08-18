import { notFound } from "next/navigation";
import { getPageContent, PAGE_CONTENT_KEYS, type PageContentKey } from "@/lib/content/page-content";
import { PAGE_CONTENT_LABELS } from "@/lib/content/page-content-labels";
import { updatePageContent } from "../actions";

function isPageContentKey(value: string): value is PageContentKey {
  return (PAGE_CONTENT_KEYS as readonly string[]).includes(value);
}

export default async function AdminContentEditPage(
  props: PageProps<"/[locale]/admin/content/[key]">,
) {
  const { key } = await props.params;

  if (!isPageContentKey(key)) {
    notFound();
  }

  const content = await getPageContent(key);
  const updateThisPage = updatePageContent.bind(null, key);

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">{PAGE_CONTENT_LABELS[key]}</h1>

      <form action={updateThisPage} className="mt-6 space-y-4">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={content.title_i18n.en ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="body" className="block text-sm font-medium">
            Body (markdown)
          </label>
          <textarea
            id="body"
            name="body"
            rows={16}
            defaultValue={content.body_i18n.en ?? ""}
            className="w-full rounded border px-3 py-2 font-mono text-sm"
          />
        </div>
        <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
          Save
        </button>
      </form>
    </main>
  );
}
