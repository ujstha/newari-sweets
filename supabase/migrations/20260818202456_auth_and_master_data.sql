-- Build-order Phase 2: Auth + master data foundation.
-- See PLAN.md's "Data Model" and "RLS & Security" sections -- this migration
-- implements admin_users/is_admin() plus the units/categories/allergens/
-- ingredients master-data tables (products/option_groups/etc. come later).

-- ── Admin membership ────────────────────────────────────────────────────
-- A membership table, not a hardcoded UID, so real multi-admin/roles can be
-- added later (e.g. a `role` column) without an RLS rewrite.
create table admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

alter table admin_users enable row level security;

-- Security definer so RLS policies elsewhere can check admin membership
-- without needing their own grant on admin_users (which stays otherwise
-- locked down by the policy below). `search_path` is pinned to prevent the
-- classic security-definer search-path hijack.
create function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from admin_users where user_id = auth.uid()
  );
$$;

-- An admin can read their own membership row; a non-admin's auth.uid() has
-- no matching row, so this is equivalent to "no public access" without
-- needing a separate deny-all policy.
create policy "admins can read own membership row"
  on admin_users for select
  using (user_id = auth.uid());

-- ── Shared trigger for updated_at columns ───────────────────────────────
create function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── Units (piece/kg/g/etc.) ─────────────────────────────────────────────
create table units (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_i18n jsonb not null default '{}'::jsonb
    check (label_i18n ? 'en' and length(label_i18n ->> 'en') > 0),
  default_step numeric not null default 1 check (default_step > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on units
  for each row execute function set_updated_at();

-- ── Categories ───────────────────────────────────────────────────────────
create table categories (
  id uuid primary key default gen_random_uuid(),
  name_i18n jsonb not null default '{}'::jsonb
    check (name_i18n ? 'en' and length(name_i18n ->> 'en') > 0),
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on categories
  for each row execute function set_updated_at();

-- ── Allergens ────────────────────────────────────────────────────────────
create table allergens (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label_i18n jsonb not null default '{}'::jsonb
    check (label_i18n ? 'en' and length(label_i18n ->> 'en') > 0),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on allergens
  for each row execute function set_updated_at();

-- ── Ingredients (global master catalog) ─────────────────────────────────
create table ingredients (
  id uuid primary key default gen_random_uuid(),
  name_i18n jsonb not null default '{}'::jsonb
    check (name_i18n ? 'en' and length(name_i18n ->> 'en') > 0),
  default_price_delta_cents integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on ingredients
  for each row execute function set_updated_at();

-- Many-to-many: which categories an ingredient is relevant to (drives the
-- admin option-builder's ingredient-picker filtering).
create table ingredient_categories (
  ingredient_id uuid not null references ingredients (id) on delete cascade,
  category_id uuid not null references categories (id) on delete cascade,
  primary key (ingredient_id, category_id)
);

-- Many-to-many: which allergens an ingredient carries.
create table ingredient_allergens (
  ingredient_id uuid not null references ingredients (id) on delete cascade,
  allergen_id uuid not null references allergens (id) on delete cascade,
  primary key (ingredient_id, allergen_id)
);

-- ── RLS: public read (active rows) / admin full CRUD ────────────────────
-- Same shape for units, categories, allergens, ingredients.
alter table units enable row level security;
alter table categories enable row level security;
alter table allergens enable row level security;
alter table ingredients enable row level security;

create policy "public reads active units" on units
  for select using (is_active = true or is_admin());
create policy "admins insert units" on units
  for insert with check (is_admin());
create policy "admins update units" on units
  for update using (is_admin()) with check (is_admin());
create policy "admins delete units" on units
  for delete using (is_admin());

create policy "public reads active categories" on categories
  for select using (is_active = true or is_admin());
create policy "admins insert categories" on categories
  for insert with check (is_admin());
create policy "admins update categories" on categories
  for update using (is_admin()) with check (is_admin());
create policy "admins delete categories" on categories
  for delete using (is_admin());

create policy "public reads active allergens" on allergens
  for select using (is_active = true or is_admin());
create policy "admins insert allergens" on allergens
  for insert with check (is_admin());
create policy "admins update allergens" on allergens
  for update using (is_admin()) with check (is_admin());
create policy "admins delete allergens" on allergens
  for delete using (is_admin());

create policy "public reads active ingredients" on ingredients
  for select using (is_active = true or is_admin());
create policy "admins insert ingredients" on ingredients
  for insert with check (is_admin());
create policy "admins update ingredients" on ingredients
  for update using (is_admin()) with check (is_admin());
create policy "admins delete ingredients" on ingredients
  for delete using (is_admin());

-- Join tables have no is_active column -- read is unconditionally public,
-- write is admin-only, same pattern as everything else.
alter table ingredient_categories enable row level security;
alter table ingredient_allergens enable row level security;

create policy "public reads ingredient_categories" on ingredient_categories
  for select using (true);
create policy "admins insert ingredient_categories" on ingredient_categories
  for insert with check (is_admin());
create policy "admins update ingredient_categories" on ingredient_categories
  for update using (is_admin()) with check (is_admin());
create policy "admins delete ingredient_categories" on ingredient_categories
  for delete using (is_admin());

create policy "public reads ingredient_allergens" on ingredient_allergens
  for select using (true);
create policy "admins insert ingredient_allergens" on ingredient_allergens
  for insert with check (is_admin());
create policy "admins update ingredient_allergens" on ingredient_allergens
  for update using (is_admin()) with check (is_admin());
create policy "admins delete ingredient_allergens" on ingredient_allergens
  for delete using (is_admin());
