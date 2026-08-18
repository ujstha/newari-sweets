/**
 * Effective minimum prep time (in days) for one product: its own override,
 * falling back to the site-wide default when unset. See PLAN.md's
 * Checkout row -- every product resolves to *some* lead time, none can
 * bypass this.
 */
export function effectiveLeadDays(
  productMinPrepDays: number | null,
  siteDefaultDays: number,
): number {
  return productMinPrepDays ?? siteDefaultDays;
}

/**
 * The checkout date floor for a whole cart is the MAXIMUM effective lead
 * time across every line -- the order can't be ready before its slowest
 * item.
 */
export function cartLeadDays(
  items: { productMinPrepDays: number | null }[],
  siteDefaultDays: number,
): number {
  if (items.length === 0) return siteDefaultDays;
  return Math.max(...items.map((i) => effectiveLeadDays(i.productMinPrepDays, siteDefaultDays)));
}

/** Earliest allowed requested_date, as a YYYY-MM-DD string, given "today". */
export function earliestRequestedDate(leadDays: number, today: Date = new Date()): string {
  const d = new Date(today);
  d.setDate(d.getDate() + leadDays);
  return d.toISOString().slice(0, 10);
}
