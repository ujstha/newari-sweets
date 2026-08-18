-- Build-order Phase 4: Catalog authoring (admin-only).
-- See PLAN.md's "Catalog & Content" data model section.

-- ── products ─────────────────────────────────────────────────────────────
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references categories (id),
  unit_id uuid not null references units (id),
  quantity_step numeric,
  name_i18n jsonb not null default '{}'::jsonb
    check (name_i18n ? 'en' and length(name_i18n ->> 'en') > 0),
  slug text not null unique,
  description_i18n jsonb not null default '{}'::jsonb,
  base_price_cents integer not null check (base_price_cents >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  featured_sort_order integer not null default 0,
  supports_message boolean not null default false,
  min_prep_days integer check (min_prep_days >= 0),
  highlight_note_i18n jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at before update on products
  for each row execute function set_updated_at();

alter table products enable row level security;

create policy "public reads active products" on products
  for select using (is_active = true or is_admin());
create policy "admins insert products" on products
  for insert with check (is_admin());
create policy "admins update products" on products
  for update using (is_admin()) with check (is_admin());
create policy "admins delete products" on products
  for delete using (is_admin());

-- ── product_allergens (base allergens, independent of chosen options) ──
create table product_allergens (
  product_id uuid not null references products (id) on delete cascade,
  allergen_id uuid not null references allergens (id) on delete cascade,
  primary key (product_id, allergen_id)
);

alter table product_allergens enable row level security;

create policy "public reads product_allergens of active products" on product_allergens
  for select using (
    is_admin()
    or exists (select 1 from products p where p.id = product_allergens.product_id and p.is_active)
  );
create policy "admins insert product_allergens" on product_allergens
  for insert with check (is_admin());
create policy "admins update product_allergens" on product_allergens
  for update using (is_admin()) with check (is_admin());
create policy "admins delete product_allergens" on product_allergens
  for delete using (is_admin());

-- ── product_images ───────────────────────────────────────────────────────
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  storage_path text not null,
  sort_order integer not null default 0,
  alt_text text not null check (length(alt_text) > 0),
  is_primary boolean not null default false
);

alter table product_images enable row level security;

create policy "public reads images of active products" on product_images
  for select using (
    is_admin()
    or exists (select 1 from products p where p.id = product_images.product_id and p.is_active)
  );
create policy "admins insert product_images" on product_images
  for insert with check (is_admin());
create policy "admins update product_images" on product_images
  for update using (is_admin()) with check (is_admin());
create policy "admins delete product_images" on product_images
  for delete using (is_admin());

-- ── option_groups ────────────────────────────────────────────────────────
create table option_groups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  name text not null,
  selection_type text not null check (selection_type in ('single', 'multiple')),
  is_required boolean not null default true,
  sort_order integer not null default 0
);

alter table option_groups enable row level security;

create policy "public reads option_groups of active products" on option_groups
  for select using (
    is_admin()
    or exists (select 1 from products p where p.id = option_groups.product_id and p.is_active)
  );
create policy "admins insert option_groups" on option_groups
  for insert with check (is_admin());
create policy "admins update option_groups" on option_groups
  for update using (is_admin()) with check (is_admin());
create policy "admins delete option_groups" on option_groups
  for delete using (is_admin());

-- ── option_values ────────────────────────────────────────────────────────
create table option_values (
  id uuid primary key default gen_random_uuid(),
  option_group_id uuid not null references option_groups (id) on delete cascade,
  label text not null,
  price_delta_cents integer not null default 0,
  ingredient_id uuid references ingredients (id) on delete set null,
  custom_allergen_note text,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0
);

alter table option_values enable row level security;

create policy "public reads active option_values of active products" on option_values
  for select using (
    is_admin()
    or (
      is_active = true
      and exists (
        select 1
        from option_groups g
        join products p on p.id = g.product_id
        where g.id = option_values.option_group_id and p.is_active
      )
    )
  );
create policy "admins insert option_values" on option_values
  for insert with check (is_admin());
create policy "admins update option_values" on option_values
  for update using (is_admin()) with check (is_admin());
create policy "admins delete option_values" on option_values
  for delete using (is_admin());

-- ── duplicate_product ────────────────────────────────────────────────────
-- Atomically copies a product row plus its option_groups/option_values and
-- repoints (does not re-upload) images -- see PLAN.md's "Duplicate product"
-- note. Appends " (copy)" to every populated locale of name_i18n and
-- generates a guaranteed-unique slug; the admin renames both from the
-- resulting edit page.
create function duplicate_product(source_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_product_id uuid;
  copied_name jsonb;
  grp record;
  new_group_id uuid;
begin
  if not is_admin() then
    raise exception 'Only admins can duplicate products';
  end if;

  select jsonb_object_agg(key, value || ' (copy)')
    into copied_name
    from jsonb_each_text((select name_i18n from products where id = source_id));

  insert into products (
    category_id, unit_id, quantity_step, name_i18n, slug, description_i18n,
    base_price_cents, is_active, is_featured, featured_sort_order,
    supports_message, min_prep_days, highlight_note_i18n, sort_order
  )
  select
    category_id, unit_id, quantity_step, copied_name,
    slug || '-copy-' || substr(gen_random_uuid()::text, 1, 8),
    description_i18n, base_price_cents, false, false, featured_sort_order,
    supports_message, min_prep_days, highlight_note_i18n, sort_order
  from products
  where id = source_id
  returning id into new_product_id;

  insert into product_allergens (product_id, allergen_id)
  select new_product_id, allergen_id from product_allergens where product_id = source_id;

  insert into product_images (product_id, storage_path, sort_order, alt_text, is_primary)
  select new_product_id, storage_path, sort_order, alt_text, is_primary
  from product_images
  where product_id = source_id;

  for grp in select * from option_groups where product_id = source_id order by sort_order loop
    insert into option_groups (product_id, name, selection_type, is_required, sort_order)
    values (new_product_id, grp.name, grp.selection_type, grp.is_required, grp.sort_order)
    returning id into new_group_id;

    insert into option_values (
      option_group_id, label, price_delta_cents, ingredient_id,
      custom_allergen_note, is_default, is_active, sort_order
    )
    select
      new_group_id, label, price_delta_cents, ingredient_id,
      custom_allergen_note, is_default, is_active, sort_order
    from option_values
    where option_group_id = grp.id;
  end loop;

  return new_product_id;
end;
$$;

-- ── Storage: product-images bucket ──────────────────────────────────────
-- The bucket's public=true flag serves file *content* directly (anon GET
-- via the public URL) without touching storage.objects RLS at all -- but
-- the Storage API's management operations (list/delete/etc, used by admin
-- uploads) go through storage.objects like any other table and DO need
-- RLS. Confirmed by testing: without a SELECT policy here, admin deletes
-- silently no-op (Storage API returns success with an empty result, no
-- error) even though INSERT/DELETE policies exist and is_admin() is true
-- -- the delete needs to "see" the row via SELECT before it can act on it.
-- See PLAN.md's "Storage" note.
--
-- `is_admin()` is schema-qualified as `public.is_admin()` here (unlike its
-- unqualified use in `public` schema policies elsewhere in this file) --
-- policies on `storage.objects` live outside the `public` schema, so the
-- call needs to be unambiguous about where to find the function.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "admins list product images"
  on storage.objects for select
  using (bucket_id = 'product-images' and public.is_admin());
create policy "admins upload product images"
  on storage.objects for insert
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins update product images"
  on storage.objects for update
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());
create policy "admins delete product images"
  on storage.objects for delete
  using (bucket_id = 'product-images' and public.is_admin());
