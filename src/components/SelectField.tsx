// Drop-in replacement for a bare <select className="input-field">: strips
// native OS dropdown chrome (appearance-none) and overlays our own chevron.
// Same props as a native select, so call sites just swap the element name.
// The open dropdown panel itself still renders with native OS styling --
// unavoidable without a fully custom listbox, which the tradeoff (native
// keyboard/mobile/a11y behavior for free) isn't worth trading away for here.
export function SelectField({
  className = "",
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative inline-block w-full">
      <select {...props} className={`input-field appearance-none pr-9 ${className}`}>
        {children}
      </select>
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-ink-faint"
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
