-- Build-order Phase 3: Site content CMS.
-- See PLAN.md's "Site Content (CMS)" data model section.

-- ── site_settings (singleton row) ───────────────────────────────────────
-- A fixed set of labeled fields, deliberately not a generic page-builder
-- (see PLAN.md's Admin/CMS feature table). i18n fields are NOT required to
-- have "en" populated (unlike catalog master data) -- an empty/default row
-- is a valid state before the admin has customized anything.
create table site_settings (
  id integer primary key default 1 check (id = 1),
  business_name text not null default '',
  contact_email text not null default '',
  contact_phone text not null default '',
  service_area_text text not null default '',
  instagram_url text,
  facebook_url text,
  hours_text text not null default '',
  announcement_text_i18n jsonb not null default '{}'::jsonb,
  announcement_active boolean not null default false,
  hero_heading_i18n jsonb not null default '{}'::jsonb,
  hero_subtext_i18n jsonb not null default '{}'::jsonb,
  hero_image_url text,
  -- Site-wide fallback lead time (days) for products without their own
  -- min_prep_days override -- see PLAN.md's Storefront checkout row.
  default_min_prep_days integer not null default 2 check (default_min_prep_days >= 0),
  -- Which locales are live on the public site. Starts English-only; "fi" is
  -- added once real Finnish copy exists -- see PLAN.md's Localization note.
  active_locales text[] not null default array['en'] check (active_locales <@ array['en', 'fi']),
  updated_at timestamptz not null default now(),
  updated_by uuid references admin_users (user_id)
);

alter table site_settings enable row level security;

create trigger set_updated_at before update on site_settings
  for each row execute function set_updated_at();

create policy "public reads site_settings" on site_settings
  for select using (true);
create policy "admins update site_settings" on site_settings
  for update using (is_admin()) with check (is_admin());
-- No insert/delete policies -- the singleton row is seeded once below and
-- never replaced.

insert into site_settings (id) values (1);

-- ── page_content (fixed set of known keys) ──────────────────────────────
create table page_content (
  key text primary key,
  title_i18n jsonb not null default '{}'::jsonb,
  body_i18n jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references admin_users (user_id)
);

alter table page_content enable row level security;

create trigger set_updated_at before update on page_content
  for each row execute function set_updated_at();

create policy "public reads page_content" on page_content
  for select using (true);
create policy "admins update page_content" on page_content
  for update using (is_admin()) with check (is_admin());
-- No insert/delete policies -- the fixed keys are seeded once below.
-- Arbitrary admin-created pages are deferred to a later phase (see
-- PLAN.md's Admin/CMS feature table).

insert into page_content (key) values
  ('about'),
  ('legal_privacy'),
  ('legal_terms'),
  ('legal_imprint');
