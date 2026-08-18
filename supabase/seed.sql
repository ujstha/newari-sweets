-- Local/dev seed data, applied by `supabase db reset`. Safe to run against a
-- fresh production project too (idempotent via ON CONFLICT), since this is
-- exactly the starter master data an admin would otherwise have to type in
-- by hand through the admin panel once it exists.
--
-- Not seeded here: admin_users (needs a real auth.users row -- create your
-- account via Supabase Auth first, then see README's "Creating the first
-- admin user" section) and products/option_groups (admin-authored, no
-- sensible defaults).

insert into units (code, label_i18n, default_step) values
  ('pcs', '{"en": "piece"}', 1),
  ('kg', '{"en": "kilogram"}', 0.5),
  ('g', '{"en": "gram"}', 50)
on conflict (code) do nothing;

insert into categories (name_i18n, slug, sort_order) values
  ('{"en": "Sweets"}', 'sweets', 1),
  ('{"en": "Cakes"}', 'cakes', 2),
  ('{"en": "Other"}', 'other', 3)
on conflict (slug) do nothing;

-- The 14 allergens the EU requires disclosure for (Regulation 1169/2011,
-- Annex II) -- see PLAN.md's Ingredient/Allergen System section.
insert into allergens (code, label_i18n, sort_order) values
  ('gluten', '{"en": "Cereals containing gluten"}', 1),
  ('crustaceans', '{"en": "Crustaceans"}', 2),
  ('eggs', '{"en": "Eggs"}', 3),
  ('fish', '{"en": "Fish"}', 4),
  ('peanuts', '{"en": "Peanuts"}', 5),
  ('soybeans', '{"en": "Soybeans"}', 6),
  ('milk', '{"en": "Milk"}', 7),
  ('tree_nuts', '{"en": "Tree nuts"}', 8),
  ('celery', '{"en": "Celery"}', 9),
  ('mustard', '{"en": "Mustard"}', 10),
  ('sesame', '{"en": "Sesame seeds"}', 11),
  ('sulphites', '{"en": "Sulphur dioxide and sulphites"}', 12),
  ('lupin', '{"en": "Lupin"}', 13),
  ('molluscs', '{"en": "Molluscs"}', 14)
on conflict (code) do nothing;
