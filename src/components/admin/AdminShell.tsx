"use client";

import { useState, type ReactNode } from "react";
import { AdminNav } from "./AdminNav";
import { signOut } from "@/app/[locale]/admin/actions";

function SignOutForm({ className = "" }: { className?: string }) {
  return (
    <form action={signOut} className={className}>
      <button
        type="submit"
        className="w-full rounded-lg px-3.5 py-2 text-left text-sm font-medium text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand-dark"
      >
        Sign out
      </button>
    </form>
  );
}

// Desktop keeps a fixed sidebar (unchanged from before). Mobile gets a real
// off-canvas drawer -- triggered by a hamburger in a sticky top bar --
// instead of the horizontal pill-scroll nav that was here previously. Off-
// canvas drawer is the established pattern for admin tools on small
// screens (a bottom nav bar is a consumer-app convention, not this).
export function AdminShell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-cream sm:h-screen sm:flex-row sm:overflow-hidden">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-border-warm bg-surface px-4 py-3 sm:hidden">
        <span className="font-display text-base font-semibold text-ink">Newari Sweets</span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand-dark"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 6h16M4 12h16M4 18h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-40 sm:hidden">
          <div
            className="absolute inset-0 bg-ink/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[80vw] flex-col overflow-y-auto bg-surface shadow-xl">
            <div className="flex items-center justify-between px-4 py-4">
              <span className="font-display text-base font-semibold text-ink">Newari Sweets</span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-brand-soft hover:text-brand-dark"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            <AdminNav onNavigate={() => setDrawerOpen(false)} />
            <SignOutForm className="mt-auto px-4 py-3" />
          </div>
        </div>
      ) : null}

      <aside className="hidden border-r border-border-warm bg-surface sm:flex sm:h-screen sm:w-56 sm:flex-shrink-0 sm:flex-col sm:overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4">
          <span className="font-display text-base font-semibold text-ink">Newari Sweets</span>
        </div>
        <AdminNav />
        <SignOutForm className="px-3 py-3" />
      </aside>

      <main className="flex-1 px-4 py-8 sm:overflow-y-auto sm:px-8 sm:py-10">{children}</main>
    </div>
  );
}
