import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { LocalizedText } from "@/lib/domain/i18n-content";
import type { AllergenRef, IngredientRef } from "@/lib/domain/ingredients";

export interface CatalogCategory {
  id: string;
  name_i18n: LocalizedText;
  slug: string;
  sort_order: number;
}

export interface CatalogProductListItem {
  id: string;
  slug: string;
  name_i18n: LocalizedText;
  base_price_cents: number;
  unit: { code: string; label_i18n: LocalizedText; default_step: number };
  category: { slug: string; name_i18n: LocalizedText };
  primary_image_path: string | null;
  is_featured: boolean;
  min_prep_days: number | null;
  // True when any option group demands a choice before the item is
  // actually orderable (e.g. cake size/flavor) -- the grid card's quick
  // "Add to cart" only makes sense when this is false, since there's no
  // UI on the card itself to make that choice. Only the group-level flag
  // is needed here, not the full option data the PDP fetches separately.
  has_required_options: boolean;
}

// Public read (RLS: active products only for anon). Grouped by category for
// the /products listing -- see PLAN.md's "Category browsing" row.
export const getActiveProducts = cache(async (): Promise<CatalogProductListItem[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(
      "id, slug, name_i18n, base_price_cents, is_featured, min_prep_days, unit:units(code, label_i18n, default_step), category:categories(slug, name_i18n), product_images(storage_path, is_primary), option_groups(is_required)",
    )
    .eq("is_active", true)
    .order("sort_order");

  return (data ?? []).map((p) => {
    const images = p.product_images as { storage_path: string; is_primary: boolean }[];
    const primary = images.find((i) => i.is_primary) ?? images[0];
    const optionGroups = p.option_groups as { is_required: boolean }[];
    return {
      id: p.id,
      slug: p.slug,
      name_i18n: p.name_i18n,
      base_price_cents: p.base_price_cents,
      is_featured: p.is_featured,
      min_prep_days: p.min_prep_days,
      unit: p.unit as unknown as { code: string; label_i18n: LocalizedText; default_step: number },
      category: p.category as unknown as { slug: string; name_i18n: LocalizedText },
      primary_image_path: primary?.storage_path ?? null,
      has_required_options: optionGroups.some((g) => g.is_required),
    };
  });
});

export const getFeaturedProducts = cache(async (): Promise<CatalogProductListItem[]> => {
  const all = await getActiveProducts();
  return all.filter((p) => p.is_featured);
});

// Live aggregate over completed-order quantities in a trailing window (see
// PLAN.md's "Homepage highlights" row). orders/order_items have no public
// SELECT policy, so this goes through get_best_selling_products() -- a
// narrow RPC exposing only (product_id, quantity), never order/customer
// data -- then joins the resulting ids back onto the normal active-product
// list here (so an out-of-stock/deactivated product silently drops out).
export const getBestSellingProducts = cache(
  async (days = 90, limit = 6): Promise<CatalogProductListItem[]> => {
    const supabase = await createClient();
    const { data: ranked } = await supabase.rpc("get_best_selling_products", {
      p_days: days,
      p_limit: limit,
    });
    if (!ranked || ranked.length === 0) return [];

    const all = await getActiveProducts();
    const byId = new Map(all.map((p) => [p.id, p]));
    return ranked
      .map((r: { product_id: string }) => byId.get(r.product_id))
      .filter((p: CatalogProductListItem | undefined): p is CatalogProductListItem => p != null);
  },
);

export interface CatalogOptionValue {
  id: string;
  label: string;
  price_delta_cents: number;
  is_default: boolean;
  ingredient: IngredientRef | null;
}

export interface CatalogOptionGroup {
  id: string;
  name: string;
  selection_type: "single" | "multiple";
  is_required: boolean;
  option_values: CatalogOptionValue[];
}

export interface CatalogProductDetail {
  id: string;
  slug: string;
  name_i18n: LocalizedText;
  description_i18n: LocalizedText;
  base_price_cents: number;
  supports_message: boolean;
  min_prep_days: number | null;
  highlight_note_i18n: LocalizedText;
  unit: { id: string; code: string; label_i18n: LocalizedText; default_step: number };
  category_id: string;
  base_allergens: AllergenRef[];
  images: { storage_path: string; alt_text: string; is_primary: boolean }[];
  option_groups: CatalogOptionGroup[];
}

const PRODUCT_DETAIL_SELECT = `id, slug, name_i18n, description_i18n, base_price_cents, supports_message, min_prep_days,
       highlight_note_i18n, category_id,
       unit:units(id, code, label_i18n, default_step),
       product_allergens(allergen:allergens(id, code, label_i18n)),
       product_images(storage_path, alt_text, is_primary, sort_order),
       option_groups(id, name, selection_type, is_required, sort_order,
         option_values(id, label, price_delta_cents, is_default, is_active, sort_order,
           ingredient:ingredients(id, ingredient_allergens(allergen:allergens(id, code, label_i18n)))))`;

async function fetchProductDetail(
  filter: { slug: string } | { id: string },
): Promise<CatalogProductDetail | null> {
  const supabase = await createClient();
  let query = supabase.from("products").select(PRODUCT_DETAIL_SELECT).eq("is_active", true);
  query = "slug" in filter ? query.eq("slug", filter.slug) : query.eq("id", filter.id);
  const { data } = await query.maybeSingle();

  if (!data) return null;

  const baseAllergens = (
    data.product_allergens as unknown as { allergen: { id: string; code: string } }[]
  ).map((pa) => ({ id: pa.allergen.id, code: pa.allergen.code }));

  const images = (
    data.product_images as {
      storage_path: string;
      alt_text: string;
      is_primary: boolean;
      sort_order: number;
    }[]
  )
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order);

  const optionGroups = (
    data.option_groups as unknown as {
      id: string;
      name: string;
      selection_type: "single" | "multiple";
      is_required: boolean;
      sort_order: number;
      option_values: {
        id: string;
        label: string;
        price_delta_cents: number;
        is_default: boolean;
        is_active: boolean;
        sort_order: number;
        ingredient: {
          id: string;
          ingredient_allergens: { allergen: { id: string; code: string } }[];
        } | null;
      }[];
    }[]
  )
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((g) => ({
      id: g.id,
      name: g.name,
      selection_type: g.selection_type,
      is_required: g.is_required,
      option_values: g.option_values
        .filter((v) => v.is_active)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((v) => ({
          id: v.id,
          label: v.label,
          price_delta_cents: v.price_delta_cents,
          is_default: v.is_default,
          ingredient: v.ingredient
            ? {
                id: v.ingredient.id,
                allergens: v.ingredient.ingredient_allergens.map((ia) => ({
                  id: ia.allergen.id,
                  code: ia.allergen.code,
                })),
              }
            : null,
        })),
    }));

  return {
    id: data.id,
    slug: data.slug,
    name_i18n: data.name_i18n,
    description_i18n: data.description_i18n,
    base_price_cents: data.base_price_cents,
    supports_message: data.supports_message,
    min_prep_days: data.min_prep_days,
    highlight_note_i18n: data.highlight_note_i18n,
    category_id: data.category_id,
    unit: data.unit as unknown as CatalogProductDetail["unit"],
    base_allergens: baseAllergens,
    images,
    option_groups: optionGroups,
  };
}

export const getProductBySlug = cache((slug: string) => fetchProductDetail({ slug }));

// Used by checkout's server-side re-pricing (see [locale]/checkout/actions.ts)
// -- never trusts the client's cart prices, always re-fetches live data by
// product id.
export const getProductForOrder = cache((id: string) => fetchProductDetail({ id }));
