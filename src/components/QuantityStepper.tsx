"use client";

// Rounds to avoid floating-point drift on fractional steps (e.g. repeated
// 0.5 kg decrements landing on 1.4999999999999998).
function roundToStep(n: number, step: number) {
  const precision = step < 1 ? (String(step).split(".")[1]?.length ?? 0) : 0;
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  step = 1,
  ariaLabel,
  className = "",
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  step?: number;
  ariaLabel?: string;
  className?: string;
}) {
  function decrement() {
    onChange(Math.max(min, roundToStep(value - step, step)));
  }

  function increment() {
    onChange(roundToStep(value + step, step));
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    if (e.target.value === "" || Number.isNaN(next)) return;
    onChange(next);
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const next = Number(e.target.value);
    if (e.target.value === "" || Number.isNaN(next) || next < min) {
      onChange(min);
    }
  }

  return (
    <div
      className={`inline-flex items-center rounded-xl border border-border-warm bg-surface ${className}`}
    >
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        aria-label={ariaLabel ? `Decrease ${ariaLabel}` : "Decrease quantity"}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        aria-label={ariaLabel ? `${ariaLabel} quantity` : "Quantity"}
        className="w-10 flex-1 border-x border-border-warm bg-transparent py-1.5 text-center text-sm text-ink outline-none"
      />
      <button
        type="button"
        onClick={increment}
        aria-label={ariaLabel ? `Increase ${ariaLabel}` : "Increase quantity"}
        className="flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft transition-colors hover:text-brand"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
