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
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">{PAGE_CONTENT_LABELS[key]}</h1>

      <form action={updateThisPage} className="mt-6 space-y-4">
        <div>
          <label htmlFor="title" className="field-label mb-1.5">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={content.title_i18n.en ?? ""}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="body" className="field-label mb-1.5">
            Body (markdown)
          </label>
          <textarea
            id="body"
            name="body"
            rows={16}
            defaultValue={content.body_i18n.en ?? ""}
            className="input-field font-mono"
          />
        </div>
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Save
        </button>
      </form>
    </div>
  );
}
