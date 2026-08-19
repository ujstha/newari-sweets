import { Link } from "@/i18n/navigation";

// Catches every notFound() call within the [locale] segment (missing
// product slug, order id, admin content key, ...) plus any truly unmatched
// route under a locale prefix. Nested inside [locale]/layout.tsx, so the
// normal header/footer still render around it -- no bare Next.js default page.
export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-14 text-center">
      <h1 className="font-display text-3xl font-semibold text-ink">Page not found</h1>
      <p className="mt-2 text-sm text-ink-soft">
        We couldn&apos;t find what you were looking for. It may have been removed or the link may be
        incorrect.
      </p>
      <Link href="/" className="btn-primary mt-6">
        Back to home
      </Link>
    </main>
  );
}
