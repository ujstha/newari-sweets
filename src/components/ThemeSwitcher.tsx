"use client";

import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_THEME,
  isSiteTheme,
  SITE_THEMES,
  THEME_META,
  THEME_STORAGE_KEY,
  type SiteTheme,
} from "@/lib/theme";

// Visitor-facing theme picker -- stores the choice in localStorage and
// flips the <html data-theme> attribute directly (see globals.css's
// [data-theme="..."] blocks). No server/admin involvement: this is a
// per-browser customer preference, not site content. The matching inline
// script in the root layout applies a stored preference before hydration
// so returning visitors don't see a flash of the default theme.
export function ThemeSwitcher() {
  const [current, setCurrent] = useState<SiteTheme>(DEFAULT_THEME);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      // localStorage is impossible to read during SSR; syncing the real
      // value right after mount (matching the beforeInteractive script's
      // DOM write) is the standard fix for the hydration mismatch, not
      // something to restructure away.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (isSiteTheme(stored)) setCurrent(stored);
    } catch {
      // localStorage unavailable (private mode, blocked) -- stay on default.
    }
  }, []);

  function selectTheme(theme: SiteTheme) {
    setCurrent(theme);
    document.documentElement.setAttribute("data-theme", theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore -- preference just won't persist across visits
    }
    if (detailsRef.current) detailsRef.current.open = false;
  }

  return (
    // Lives in the footer's dark bar -- glass treatment (translucent +
    // blurred) reads naturally there, and the dropdown opens upward since
    // this sits at the very bottom of the page.
    <details ref={detailsRef} className="relative">
      <summary
        aria-label="Choose a color theme"
        className="flex list-none items-center gap-2 rounded-full border border-cream/15 bg-cream/5 px-3 py-1.5 text-xs font-medium text-cream/70 backdrop-blur-md transition-colors hover:border-gold hover:text-cream [&::-webkit-details-marker]:hidden"
      >
        <span
          aria-hidden="true"
          className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-cream/40"
          style={{ background: THEME_META[current].swatch }}
        />
        Theme
      </summary>
      <div className="absolute right-0 bottom-full z-40 mb-2 w-44 rounded-xl border border-cream/10 bg-ink/80 p-1.5 shadow-xl backdrop-blur-xl">
        {SITE_THEMES.map((theme) => (
          <button
            key={theme}
            type="button"
            onClick={() => selectTheme(theme)}
            className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm transition-colors hover:bg-cream/10 ${
              theme === current ? "font-semibold text-gold" : "text-cream/80"
            }`}
          >
            <span
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-cream/30"
              style={{ background: THEME_META[theme].swatch }}
            />
            {THEME_META[theme].label}
          </button>
        ))}
      </div>
    </details>
  );
}
