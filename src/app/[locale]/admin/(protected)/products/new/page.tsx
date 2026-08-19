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
    <div className="max-w-xl">
      <h1 className="font-display text-2xl font-semibold text-ink">New product</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Save first, then add options and photos on the next screen.
      </p>

      <form action={createProduct} className="mt-6 space-y-4">
        <ProductBasicFields categories={categories} units={units} allergens={allergens} />
        <button type="submit" className="btn-primary px-4 py-2 text-sm">
          Save and continue
        </button>
      </form>
    </div>
  );
}
