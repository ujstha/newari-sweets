import { getSiteSettings } from "@/lib/content/site-settings";
import { getActiveProducts } from "@/lib/content/public-catalog";
import { Link } from "@/i18n/navigation";
import { LogoMark } from "./LogoMark";
import { ThemeSwitcher } from "./ThemeSwitcher";

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-xs font-medium tracking-widest text-cream/40 uppercase">{children}</p>
  );
}

const footerLink = "text-cream/70 transition-colors hover:text-gold";

export async function Footer() {
  const [settings, products] = await Promise.all([getSiteSettings(), getActiveProducts()]);

  const categories = [...new Map(products.map((p) => [p.category.slug, p.category])).values()];

  const hasVisitInfo =
    settings.service_area_text ||
    settings.hours_text ||
    settings.contact_email ||
    settings.contact_phone;

  return (
    <footer className="mt-20 bg-ink text-cream/90">
      {/* Thin top seam with a centered diamond stitch -- a small, quiet
          nod to the site's warm palette rather than a flat straight line. */}
      <div className="relative border-t border-cream/10">
        <span className="absolute top-0 left-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-gold" />
      </div>

      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
        <div className="flex flex-col gap-10 text-sm sm:flex-row sm:flex-wrap sm:justify-between sm:gap-x-12 sm:gap-y-10">
          <div className="sm:max-w-64">
            <Link href="/" className="flex items-center">
              <LogoMark />
            </Link>
            <p className="mt-3 text-sm font-normal text-cream/50">
              Handmade Nepali sweets &amp; custom cakes, made to order in Helsinki.
            </p>
            {settings.instagram_url || settings.facebook_url ? (
              <div className="mt-5 flex gap-2.5">
                {settings.instagram_url ? (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <InstagramIcon />
                  </a>
                ) : null}
                {settings.facebook_url ? (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-cream/15 text-cream/70 transition-colors hover:border-gold hover:text-gold"
                  >
                    <FacebookIcon />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {categories.length > 0 ? (
            <div>
              <FooterHeading>Shop</FooterHeading>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.slug}>
                    <Link
                      href={{ pathname: "/products", hash: category.slug }}
                      className={footerLink}
                    >
                      {category.name_i18n.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div>
            <FooterHeading>Company</FooterHeading>
            <ul className="space-y-2">
              <li>
                <Link href="/legal/privacy" className={footerLink}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms-of-sale" className={footerLink}>
                  Terms of Sale
                </Link>
              </li>
              <li>
                <Link href="/legal/imprint" className={footerLink}>
                  Imprint
                </Link>
              </li>
            </ul>
          </div>

          {hasVisitInfo ? (
            <div>
              <FooterHeading>Visit</FooterHeading>
              <ul className="space-y-2 text-cream/70">
                {settings.service_area_text ? <li>{settings.service_area_text}</li> : null}
                {settings.hours_text ? <li>{settings.hours_text}</li> : null}
                {settings.contact_email ? (
                  <li>
                    <a href={`mailto:${settings.contact_email}`} className={footerLink}>
                      {settings.contact_email}
                    </a>
                  </li>
                ) : null}
                {settings.contact_phone ? (
                  <li>
                    <a href={`tel:${settings.contact_phone}`} className={footerLink}>
                      {settings.contact_phone}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-cream/40 sm:flex-row sm:px-8">
          <p>
            &copy; {new Date().getFullYear()} {settings.business_name || "Newari Sweets"}
          </p>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <a href="#top" className="transition-colors hover:text-gold">
              Back to top &uarr;
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
