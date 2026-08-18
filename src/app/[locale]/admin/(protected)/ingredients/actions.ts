"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function syncTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: "ingredient_categories" | "ingredient_allergens",
  column: "category_id" | "allergen_id",
  ingredientId: string,
  ids: string[],
) {
  await supabase.from(table).delete().eq("ingredient_id", ingredientId);
  if (ids.length > 0) {
    const rows = ids.map((id) => ({ ingredient_id: ingredientId, [column]: id }));
    const { error } = await supabase.from(table).insert(rows);
    if (error) throw new Error(error.message);
  }
}

async function saveIngredient(
  supabase: Awaited<ReturnType<typeof createClient>>,
  ingredientId: string,
  formData: FormData,
) {
  await syncTags(
    supabase,
    "ingredient_categories",
    "category_id",
    ingredientId,
    formData.getAll("category_ids") as string[],
  );
  await syncTags(
    supabase,
    "ingredient_allergens",
    "allergen_id",
    ingredientId,
    formData.getAll("allergen_ids") as string[],
  );
}

export async function createIngredient(formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string | null) ?? "").trim();
  if (!name) throw new Error("Name is required");
  const priceDelta = Math.round(Number(formData.get("default_price_delta_cents")) || 0);

  const { data, error } = await supabase
    .from("ingredients")
    .insert({ name_i18n: { en: name }, default_price_delta_cents: priceDelta })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await saveIngredient(supabase, data.id, formData);

  revalidatePath("/admin/ingredients");
}

export async function updateIngredient(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("ingredients")
    .select("name_i18n")
    .eq("id", id)
    .single();

  const name = ((formData.get("name") as string | null) ?? "").trim();
  const priceDelta = Math.round(Number(formData.get("default_price_delta_cents")) || 0);
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("ingredients")
    .update({
      name_i18n: { ...((current?.name_i18n as Record<string, string>) ?? {}), en: name },
      default_price_delta_cents: priceDelta,
      is_active: isActive,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await saveIngredient(supabase, id, formData);

  revalidatePath("/admin/ingredients");
}
