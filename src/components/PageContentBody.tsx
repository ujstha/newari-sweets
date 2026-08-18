import Markdown from "react-markdown";
import { getLocale } from "next-intl/server";
import { getPageContent, type PageContentKey } from "@/lib/content/page-content";
import { pickLocalized } from "@/lib/domain/i18n-content";

// Shared renderer for the fixed-key admin-editable pages (about, the three
// legal pages) -- title + markdown body from page_content. react-markdown
// renders plain markdown only (no raw HTML passthrough), so this is safe
// against script injection even though the content is admin-writable.
export async function PageContentBody({ contentKey }: { contentKey: PageContentKey }) {
  const locale = await getLocale();
  const content = await getPageContent(contentKey);
  const title = pickLocalized(content.title_i18n, locale);
  const body = pickLocalized(content.body_i18n, locale);

  return (
    <main className="mx-auto max-w-2xl p-8">
      {title ? <h1 className="text-2xl font-semibold">{title}</h1> : null}
      {body ? (
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-gray-800">
          <Markdown>{body}</Markdown>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-600">This page hasn&apos;t been written yet.</p>
      )}
    </main>
  );
}
