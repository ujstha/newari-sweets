import { getSiteSettings } from "@/lib/content/site-settings";
import { updateSiteSettings } from "./actions";

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Site content</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Business info, homepage hero, and the announcement banner. English only for now.
      </p>

      <form action={updateSiteSettings} className="mt-6 space-y-6">
        <fieldset className="space-y-3">
          <legend className="field-label mb-1">Business info</legend>
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
          <legend className="field-label mb-1">Homepage hero</legend>
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
          <legend className="field-label mb-1">Announcement banner</legend>
          <label className="flex items-center gap-2 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="announcement_active"
              defaultChecked={settings.announcement_active}
              className="checkbox-field"
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
          <legend className="field-label mb-1">Ordering</legend>
          <Field
            label="Default minimum prep days"
            name="default_min_prep_days"
            type="number"
            min={0}
            defaultValue={String(settings.default_min_prep_days)}
          />
        </fieldset>

        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Save
        </button>
      </form>
    </div>
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
    <div>
      <label htmlFor={name} className="field-label mb-1.5">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        min={min}
        className="input-field"
      />
    </div>
  );
}
