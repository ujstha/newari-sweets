// Text-based logo mark: a circular badge with an italic display-font
// initial, paired with the wordmark wherever it's used (Header, Footer).
// No brand asset exists yet -- this is a deliberate wordmark lockup rather
// than a plain text link, easy to swap for a real logo file later (just
// replace this component's contents, call sites don't change).
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand font-display text-base text-white italic ${className}`}
    >
      N
    </span>
  );
}
