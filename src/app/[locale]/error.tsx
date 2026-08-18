"use client";

import { useEffect } from "react";

// Catches unhandled render/data errors anywhere under the [locale] segment,
// so a real crash shows this instead of Next's raw stack-trace overlay (dev)
// or a blank page (prod). Must be a Client Component -- Next.js requirement
// for error.tsx boundaries.
export default function LocaleError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-sm text-gray-600">
        Sorry about that -- please try again. If it keeps happening, contact us directly.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-black px-4 py-2 text-sm text-white"
      >
        Try again
      </button>
    </main>
  );
}
