import { createClient } from "@/lib/supabase/server";
import type { LocalizedText } from "@/lib/domain/i18n-content";

export interface Category {
  id: string;
  name_i18n: LocalizedText;
  slug: string;
  sort_order: number;
  is_active: boolean;
}

export interface Unit {
  id: string;
  code: string;
  label_i18n: LocalizedText;
  default_step: number;
  is_active: boolean;
}

export interface Allergen {
  id: string;
  code: string;
  label_i18n: LocalizedText;
  sort_order: number;
  is_active: boolean;
}

export interface Ingredient {
  id: string;
  name_i18n: LocalizedText;
  default_price_delta_cents: number;
  is_active: boolean;
  category_ids: string[];
  allergen_ids: string[];
}

// Admin screens need every row (including inactive), which RLS allows for
// an authenticated admin -- see the "or is_admin()" clause in each table's
// SELECT policy from the Phase 2 migration.

export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name_i18n, slug, sort_order, is_active")
    .order("sort_order");
  return data ?? [];
}

export async function getAllUnits(): Promise<Unit[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("units")
    .select("id, code, label_i18n, default_step, is_active")
    .order("code");
  return data ?? [];
}

export async function getAllAllergens(): Promise<Allergen[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("allergens")
    .select("id, code, label_i18n, sort_order, is_active")
    .order("sort_order");
  return data ?? [];
}

export async function getAllIngredients(): Promise<Ingredient[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ingredients")
    .select(
      "id, name_i18n, default_price_delta_cents, is_active, ingredient_categories(category_id), ingredient_allergens(allergen_id)",
    )
    .order("name_i18n->>en");

  return (data ?? []).map((row) => ({
    id: row.id,
    name_i18n: row.name_i18n,
    default_price_delta_cents: row.default_price_delta_cents,
    is_active: row.is_active,
    category_ids: (row.ingredient_categories as { category_id: string }[]).map(
      (c) => c.category_id,
    ),
    allergen_ids: (row.ingredient_allergens as { allergen_id: string }[]).map((a) => a.allergen_id),
  }));
}
