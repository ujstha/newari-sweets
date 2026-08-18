import { getSiteSettings } from "@/lib/content/site-settings";
import { Link } from "@/i18n/navigation";

export async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="border-t px-4 py-8 text-sm text-gray-600">
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="space-y-1">
          {settings.service_area_text ? <p>{settings.service_area_text}</p> : null}
          {settings.hours_text ? <p>{settings.hours_text}</p> : null}
          {settings.contact_email ? <p>{settings.contact_email}</p> : null}
          {settings.contact_phone ? <p>{settings.contact_phone}</p> : null}
        </div>
        <div className="flex flex-col gap-1">
          {settings.instagram_url ? (
            <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          ) : null}
          {settings.facebook_url ? (
            <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
          ) : null}
        </div>
        <div className="flex flex-col gap-1">
          <Link href="/legal/privacy">Privacy Policy</Link>
          <Link href="/legal/terms-of-sale">Terms of Sale</Link>
          <Link href="/legal/imprint">Imprint</Link>
        </div>
      </div>
    </footer>
  );
}
