import { getSiteSettings } from "@/lib/content/site-settings";
import { updateSiteSettings } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Site content</h1>
      <p className="mt-1 text-sm text-gray-600">
        Business info, homepage hero, and the announcement banner. English only for now.
      </p>

      <form action={updateSiteSettings} className="mt-6 space-y-6">
        <fieldset className="space-y-3">
          <legend className="font-medium">Business info</legend>
          <Field label="Business name" name="business_name" defaultValue={settings.business_name} />
          <Field
            label="Contact email"
            name="contact_email"
            type="email"
            defaultValue={settings.contact_email}
          />
          <Field label="Contact phone" name="contact_phone" defaultValue={settings.contact_phone} />
          <Field
            label="Service area"
            name="service_area_text"
            defaultValue={settings.service_area_text}
            placeholder="e.g. Pickup in Helsinki, delivery within 15 km"
          />
          <Field label="Hours" name="hours_text" defaultValue={settings.hours_text} />
          <Field
            label="Instagram URL"
            name="instagram_url"
            type="url"
            defaultValue={settings.instagram_url ?? ""}
          />
          <Field
            label="Facebook URL"
            name="facebook_url"
            type="url"
            defaultValue={settings.facebook_url ?? ""}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-medium">Homepage hero</legend>
          <Field
            label="Heading"
            name="hero_heading"
            defaultValue={settings.hero_heading_i18n.en ?? ""}
          />
          <Field
            label="Subtext"
            name="hero_subtext"
            defaultValue={settings.hero_subtext_i18n.en ?? ""}
          />
          <Field
            label="Image URL"
            name="hero_image_url"
            type="url"
            defaultValue={settings.hero_image_url ?? ""}
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-medium">Announcement banner</legend>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="announcement_active"
              defaultChecked={settings.announcement_active}
            />
            Show banner
          </label>
          <Field
            label="Banner text"
            name="announcement_text"
            defaultValue={settings.announcement_text_i18n.en ?? ""}
            placeholder="e.g. Not taking orders this week"
          />
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="font-medium">Ordering</legend>
          <Field
            label="Default minimum prep days"
            name="default_min_prep_days"
            type="number"
            min={0}
            defaultValue={String(settings.default_min_prep_days)}
          />
        </fieldset>

        <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
          Save
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  min?: number;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        className="w-full rounded border px-3 py-2 text-sm"
      />
    </div>
  );
}
