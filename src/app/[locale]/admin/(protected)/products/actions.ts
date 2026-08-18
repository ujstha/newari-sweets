"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "@/i18n/navigation";
import { getLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function syncAllergens(
  supabase: Awaited<ReturnType<typeof createClient>>,
  productId: string,
  allergenIds: string[],
) {
  await supabase.from("product_allergens").delete().eq("product_id", productId);
  if (allergenIds.length > 0) {
    const { error } = await supabase
      .from("product_allergens")
      .insert(allergenIds.map((allergen_id) => ({ product_id: productId, allergen_id })));
    if (error) throw new Error(error.message);
  }
}

function productFieldsFromForm(formData: FormData) {
  const name = ((formData.get("name") as string | null) ?? "").trim();
  const minPrepDaysRaw = (formData.get("min_prep_days") as string | null) ?? "";

  return {
    name,
    category_id: formData.get("category_id") as string,
    unit_id: formData.get("unit_id") as string,
    description: ((formData.get("description") as string | null) ?? "").trim(),
    base_price_cents: Math.round(Number(formData.get("base_price_cents")) || 0),
    is_active: formData.get("is_active") === "on",
    is_featured: formData.get("is_featured") === "on",
    supports_message: formData.get("supports_message") === "on",
    min_prep_days: minPrepDaysRaw === "" ? null : Number(minPrepDaysRaw),
    highlight_note: ((formData.get("highlight_note") as string | null) ?? "").trim(),
  };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const locale = await getLocale();
  const fields = productFieldsFromForm(formData);
  if (!fields.name) throw new Error("Name is required");

  const { data, error } = await supabase
    .from("products")
    .insert({
      category_id: fields.category_id,
      unit_id: fields.unit_id,
      name_i18n: { en: fields.name },
      slug: slugify(fields.name),
      description_i18n: fields.description ? { en: fields.description } : {},
      base_price_cents: fields.base_price_cents,
      is_active: fields.is_active,
      is_featured: fields.is_featured,
      supports_message: fields.supports_message,
      min_prep_days: fields.min_prep_days,
      highlight_note_i18n: fields.highlight_note ? { en: fields.highlight_note } : {},
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  await syncAllergens(supabase, data.id, formData.getAll("allergen_ids") as string[]);

  revalidatePath("/admin/products");
  return redirect({ href: `/admin/products/${data.id}/edit`, locale });
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("products")
    .select("name_i18n, description_i18n, highlight_note_i18n")
    .eq("id", id)
    .single();

  const fields = productFieldsFromForm(formData);
  if (!fields.name) throw new Error("Name is required");

  const { error } = await supabase
    .from("products")
    .update({
      category_id: fields.category_id,
      unit_id: fields.unit_id,
      name_i18n: { ...((current?.name_i18n as Record<string, string>) ?? {}), en: fields.name },
      description_i18n: {
        ...((current?.description_i18n as Record<string, string>) ?? {}),
        en: fields.description,
      },
      base_price_cents: fields.base_price_cents,
      is_active: fields.is_active,
      is_featured: fields.is_featured,
      supports_message: fields.supports_message,
      min_prep_days: fields.min_prep_days,
      highlight_note_i18n: {
        ...((current?.highlight_note_i18n as Record<string, string>) ?? {}),
        en: fields.highlight_note,
      },
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  await syncAllergens(supabase, id, formData.getAll("allergen_ids") as string[]);

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}/edit`);
  revalidatePath("/", "layout");
}

export async function duplicateProductAction(id: string) {
  const supabase = await createClient();
  const locale = await getLocale();

  const { data: newId, error } = await supabase.rpc("duplicate_product", { source_id: id });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  return redirect({ href: `/admin/products/${newId}/edit`, locale });
}

export async function addOptionGroup(productId: string, formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string | null) ?? "").trim();
  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from("option_groups").insert({
    product_id: productId,
    name,
    selection_type: formData.get("selection_type") as string,
    is_required: formData.get("is_required") === "on",
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function deleteOptionGroup(productId: string, groupId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("option_groups").delete().eq("id", groupId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function addOptionValue(productId: string, groupId: string, formData: FormData) {
  const supabase = await createClient();
  const label = ((formData.get("label") as string | null) ?? "").trim();
  if (!label) throw new Error("Label is required");
  const ingredientId = (formData.get("ingredient_id") as string | null) || null;

  const { error } = await supabase.from("option_values").insert({
    option_group_id: groupId,
    label,
    price_delta_cents: Math.round(Number(formData.get("price_delta_cents")) || 0),
    ingredient_id: ingredientId,
    is_default: formData.get("is_default") === "on",
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function deleteOptionValue(productId: string, valueId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("option_values").delete().eq("id", valueId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function addProductImage(
  productId: string,
  storagePath: string,
  altText: string,
  isPrimary: boolean,
) {
  const supabase = await createClient();

  if (isPrimary) {
    await supabase.from("product_images").update({ is_primary: false }).eq("product_id", productId);
  }

  const { error } = await supabase.from("product_images").insert({
    product_id: productId,
    storage_path: storagePath,
    alt_text: altText,
    is_primary: isPrimary,
  });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function deleteProductImage(productId: string, imageId: string, storagePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("product-images").remove([storagePath]);
  const { error } = await supabase.from("product_images").delete().eq("id", imageId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}/edit`);
}
