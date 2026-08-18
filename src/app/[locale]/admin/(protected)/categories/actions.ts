"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const name = ((formData.get("name") as string | null) ?? "").trim();
  if (!name) throw new Error("Name is required");

  const { error } = await supabase.from("categories").insert({
    name_i18n: { en: name },
    slug: slugify(name),
  });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

export async function updateCategory(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: current } = await supabase
    .from("categories")
    .select("name_i18n")
    .eq("id", id)
    .single();

  const name = ((formData.get("name") as string | null) ?? "").trim();
  const sortOrder = Number(formData.get("sort_order")) || 0;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("categories")
    .update({
      name_i18n: { ...((current?.name_i18n as Record<string, string>) ?? {}), en: name },
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}
