import { createClient } from "@/lib/supabase/server";
import type { LocalizedText } from "@/lib/domain/i18n-content";

export interface ProductListItem {
  id: string;
  name_i18n: LocalizedText;
  slug: string;
  is_active: boolean;
  base_price_cents: number;
  category: { name_i18n: LocalizedText } | null;
}

export async function getAllProducts(): Promise<ProductListItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name_i18n, slug, is_active, base_price_cents, category:categories(name_i18n)")
    .order("sort_order");
  return (data as unknown as ProductListItem[]) ?? [];
}

export interface OptionValueRow {
  id: string;
  label: string;
  price_delta_cents: number;
  ingredient_id: string | null;
  is_default: boolean;
  is_active: boolean;
}

export interface OptionGroupRow {
  id: string;
  name: string;
  selection_type: "single" | "multiple";
  is_required: boolean;
  option_values: OptionValueRow[];
}

export interface ProductImageRow {
  id: string;
  storage_path: string;
  alt_text: string;
  is_primary: boolean;
}

export interface ProductForEdit {
  id: string;
  category_id: string;
  unit_id: string;
  name_i18n: LocalizedText;
  slug: string;
  description_i18n: LocalizedText;
  base_price_cents: number;
  is_active: boolean;
  is_featured: boolean;
  supports_message: boolean;
  min_prep_days: number | null;
  highlight_note_i18n: LocalizedText;
  allergen_ids: string[];
  option_groups: OptionGroupRow[];
  images: ProductImageRow[];
}

export async function getProductForEdit(id: string): Promise<ProductForEdit | null> {
  const supabase = await createClient();
  const { data: product } = await supabase
    .from("products")
    .select(
      "id, category_id, unit_id, name_i18n, slug, description_i18n, base_price_cents, is_active, is_featured, supports_message, min_prep_days, highlight_note_i18n, product_allergens(allergen_id)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!product) return null;

  const [{ data: groups }, { data: images }] = await Promise.all([
    supabase
      .from("option_groups")
      .select("id, name, selection_type, is_required, sort_order, option_values(*)")
      .eq("product_id", id)
      .order("sort_order"),
    supabase
      .from("product_images")
      .select("id, storage_path, alt_text, is_primary")
      .eq("product_id", id)
      .order("sort_order"),
  ]);

  return {
    ...product,
    allergen_ids: (product.product_allergens as { allergen_id: string }[]).map(
      (a) => a.allergen_id,
    ),
    option_groups: (groups as OptionGroupRow[]) ?? [],
    images: images ?? [],
  };
}
