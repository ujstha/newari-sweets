"use client";

// Last-resort boundary: only fires if the root layout itself throws (rare --
// e.g. a locale-loading failure). Must render its own <html>/<body> since it
// replaces the entire root layout, so it can't reuse the normal chrome.
export default function GlobalError() {
  return (
    <html lang="en">
      <body>
        <main style={{ padding: "2rem", textAlign: "center" }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page. If it keeps happening, contact us directly.</p>
        </main>
      </body>
    </html>
  );
}
