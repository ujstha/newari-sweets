import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces, Bricolage_Grotesque } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/content/site-settings";
import { CartProvider } from "@/lib/cart/CartContext";
import { FavoritesProvider } from "@/lib/favorites/FavoritesContext";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Warm, high-contrast serif for headings/branding -- the storefront's
// display face, paired with Geist Sans for body copy. See globals.css's
// --font-display token.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
});

// Bold accent face -- used ONLY for the homepage hero's bold-pop moments
// (the promo band, the OG/social-share image) and nowhere else. See
// globals.css's --font-pop token: this is a deliberately scoped exception
// to the Fraunces/Geist system, not a second general-purpose typeface.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["700", "800"],
});

// Site-wide OG/metadata defaults, sourced from admin-editable content so
// they stay correct without a redeploy -- individual pages (homepage,
// legal pages) can still override title/description via their own
// generateMetadata. See PLAN.md's Storefront "Social sharing" row.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const name = settings.business_name || "Newari Sweets";
  const description =
    settings.service_area_text || "Nepali sweets and custom cakes, made to order in Helsinki.";

  return {
    title: { default: name, template: `%s | ${name}` },
    description,
    openGraph: {
      siteName: name,
      title: name,
      description,
      images: settings.hero_image_url ? [settings.hero_image_url] : [],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} ${bricolage.variable} h-full scroll-smooth antialiased`}
    >
      <body id="top" className="flex min-h-full flex-col bg-cream text-ink">
        <NextIntlClientProvider>
          <FavoritesProvider>
            <CartProvider>{children}</CartProvider>
          </FavoritesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
