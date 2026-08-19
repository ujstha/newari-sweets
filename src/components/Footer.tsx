import { getSiteSettings } from "@/lib/content/site-settings";
import { Link } from "@/i18n/navigation";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 3h-2a5 5 0 0 0-5 5v2H6v4h2v7h4v-7h3l1-4h-4V8a1 1 0 0 1 1-1h3V3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 bg-ink text-cream/90">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-8">
        <div className="space-y-1.5">
          <p className="font-display text-base text-cream">
            {settings.business_name || "Newari Sweets"}
          </p>
          {settings.service_area_text ? (
            <p className="text-cream/70">{settings.service_area_text}</p>
          ) : null}
          {settings.hours_text ? <p className="text-cream/70">{settings.hours_text}</p> : null}
          {settings.contact_email ? (
            <p className="text-cream/70">{settings.contact_email}</p>
          ) : null}
          {settings.contact_phone ? (
            <p className="text-cream/70">{settings.contact_phone}</p>
          ) : null}
        </div>

        <div className="flex gap-4 sm:justify-center">
          {settings.instagram_url ? (
            <a
              href={settings.instagram_url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-cream/70 transition-colors hover:text-gold"
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
              className="text-cream/70 transition-colors hover:text-gold"
            >
              <FacebookIcon />
            </a>
          ) : null}
        </div>

        <div className="flex flex-col gap-1.5 sm:items-end">
          <Link href="/legal/privacy" className="text-cream/70 transition-colors hover:text-gold">
            Privacy Policy
          </Link>
          <Link
            href="/legal/terms-of-sale"
            className="text-cream/70 transition-colors hover:text-gold"
          >
            Terms of Sale
          </Link>
          <Link href="/legal/imprint" className="text-cream/70 transition-colors hover:text-gold">
            Imprint
          </Link>
        </div>
      </div>
    </footer>
  );
}
