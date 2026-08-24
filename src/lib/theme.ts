// Fixed set of storefront color moods -- see globals.css for what each name
// maps to (a `[data-theme="..."]` override block redefining the --color-*
// tokens from the @theme block). Visitor-facing, via ThemeSwitcher (stored
// in the browser's localStorage) -- there is deliberately no admin/CMS
// control over this, it's a customer preference, not site content.
export const SITE_THEMES = [
  "jamun-syrup",
  "durbar-red",
  "sel-roti-gold",
  "gurans-bloom",
  "himalayan-mist",
] as const;

export type SiteTheme = (typeof SITE_THEMES)[number];

// What a first-time visitor (no stored preference yet) sees.
export const DEFAULT_THEME: SiteTheme = "durbar-red";

export const THEME_META: Record<SiteTheme, { label: string; swatch: string }> = {
  "jamun-syrup": { label: "Jamun Syrup", swatch: "#a6402f" },
  "durbar-red": { label: "Durbar Red", swatch: "#7a2e2e" },
  "sel-roti-gold": { label: "Sel Roti Gold", swatch: "#d69a3c" },
  "gurans-bloom": { label: "Gurans Bloom", swatch: "#d63d6e" },
  "himalayan-mist": { label: "Himalayan Mist", swatch: "#8a6a4f" },
};

export const THEME_STORAGE_KEY = "ns-theme";

export function isSiteTheme(value: string | null): value is SiteTheme {
  return !!value && (SITE_THEMES as readonly string[]).includes(value);
}
