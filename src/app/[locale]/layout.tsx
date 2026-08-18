import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getSiteSettings } from "@/lib/content/site-settings";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <NextIntlClientProvider>
          <AnnouncementBanner />
          <Header />
          <div className="flex-1">{children}</div>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
