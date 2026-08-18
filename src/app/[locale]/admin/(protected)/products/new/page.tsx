import { getAllAllergens, getAllCategories, getAllUnits } from "@/lib/content/catalog-master-data";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";
import { createProduct } from "../actions";

export default async function NewProductPage() {
  const [categories, units, allergens] = await Promise.all([
    getAllCategories(),
    getAllUnits(),
    getAllAllergens(),
  ]);

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-xl font-semibold">New product</h1>
      <p className="mt-1 text-sm text-gray-600">
        Save first, then add options and photos on the next screen.
      </p>

      <form action={createProduct} className="mt-6 space-y-4">
        <ProductBasicFields categories={categories} units={units} allergens={allergens} />
        <button type="submit" className="rounded bg-black px-4 py-2 text-sm text-white">
          Save and continue
        </button>
      </form>
    </main>
  );
}
