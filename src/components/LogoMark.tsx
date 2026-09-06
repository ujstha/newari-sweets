// Real logo asset (public/brand-logo-high.png, transparent background).
// Size is entirely caller-controlled via className (no default h-/w- here)
// -- Header and Footer intentionally use different sizes, and
// string-concatenating a size class after a hardcoded default isn't a
// reliable override in Tailwind (equal-specificity utilities win by
// stylesheet order, not by position in the class attribute).
// alt defaults to the business name for call sites where this is the
// sole content of the link (Footer); pass alt="" where it's paired with
// a visible text wordmark instead (Header), so the link's accessible
// name isn't announced twice.
export function LogoMark({
  className = "",
  alt = "Newari Sweets",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- see PLAN.md's Deployment section (no optimizer on Cloudflare)
    <img src="/brand-logo-high.png" alt={alt} className={`shrink-0 object-contain ${className}`} />
  );
}
