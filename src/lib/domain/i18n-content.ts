export type LocalizedText = Partial<Record<"en" | "fi", string>>;

/**
 * Picks the current locale's string out of an `{en, fi}` jsonb field,
 * falling back to English (the only locale guaranteed to be populated --
 * see PLAN.md's Localization note) and finally to an empty string.
 */
export function pickLocalized(value: LocalizedText | null | undefined, locale: string): string {
  if (!value) return "";
  return value[locale as "en" | "fi"] || value.en || "";
}
