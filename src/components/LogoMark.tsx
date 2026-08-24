// Real logo asset (public/brand-logo-high.png, transparent background) --
// carries its own colors, so it needs no bg/text-color props the way the
// old text-based placeholder did. It's the sole content of the Link at
// every call site (no separate business-name text span anymore -- the
// logo already carries "Newari Sweets" as part of its own artwork), so
// it needs a real alt, not alt="" -- otherwise the "go home" link would
// have no accessible name at all.
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare)
    <img
      src="/brand-logo-high.png"
      alt="Newari Sweets"
      className={`h-20 w-20 shrink-0 object-contain ${className}`}
    />
  );
}
