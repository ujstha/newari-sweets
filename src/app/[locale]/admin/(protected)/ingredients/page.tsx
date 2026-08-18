import {
  getAllAllergens,
  getAllCategories,
  getAllIngredients,
} from "@/lib/content/catalog-master-data";
import { createIngredient, updateIngredient } from "./actions";

export default async function AdminIngredientsPage() {
  const [ingredients, categories, allergens] = await Promise.all([
    getAllIngredients(),
    getAllCategories(),
    getAllAllergens(),
  ]);

  return (
    <main className="mx-auto max-w-3xl p-8">
      <h1 className="text-xl font-semibold">Ingredients</h1>
      <p className="mt-1 text-sm text-gray-600">
        A shared catalog reused across products. Category tags drive which ingredients the product
        option builder suggests by default.
      </p>

      {ingredients.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">No ingredients yet -- add the first one below.</p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {ingredients.map((ingredient) => {
          const updateThis = updateIngredient.bind(null, ingredient.id);
          return (
            <li key={ingredient.id} className="rounded border p-4">
              <form action={updateThis} className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    name="name"
                    defaultValue={ingredient.name_i18n.en ?? ""}
                    className="rounded border px-2 py-1 text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs">
                    Price delta (cents)
                    <input
                      name="default_price_delta_cents"
                      type="number"
                      defaultValue={ingredient.default_price_delta_cents}
                      className="w-20 rounded border px-2 py-1 text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <input type="checkbox" name="is_active" defaultChecked={ingredient.is_active} />
                    Active
                  </label>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Categories</p>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <label key={category.id} className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          name="category_ids"
                          value={category.id}
                          defaultChecked={ingredient.category_ids.includes(category.id)}
                        />
                        {category.name_i18n.en}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500">Allergens</p>
                  <div className="mt-1 flex flex-wrap gap-3">
                    {allergens.map((allergen) => (
                      <label key={allergen.id} className="flex items-center gap-1 text-xs">
                        <input
                          type="checkbox"
                          name="allergen_ids"
                          value={allergen.id}
                          defaultChecked={ingredient.allergen_ids.includes(allergen.id)}
                        />
                        {allergen.label_i18n.en}
                      </label>
                    ))}
                  </div>
                </div>
                <button type="submit" className="rounded bg-black px-3 py-1 text-xs text-white">
                  Save
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      <form action={createIngredient} className="mt-8 space-y-3 border-t pt-6">
        <p className="font-medium">Add ingredient</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            name="name"
            placeholder="Name"
            required
            className="rounded border px-2 py-1 text-sm"
          />
          <label className="flex items-center gap-1 text-xs">
            Price delta (cents)
            <input
              name="default_price_delta_cents"
              type="number"
              defaultValue={0}
              className="w-20 rounded border px-2 py-1 text-sm"
            />
          </label>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Categories</p>
          <div className="mt-1 flex flex-wrap gap-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="category_ids" value={category.id} />
                {category.name_i18n.en}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-500">Allergens</p>
          <div className="mt-1 flex flex-wrap gap-3">
            {allergens.map((allergen) => (
              <label key={allergen.id} className="flex items-center gap-1 text-xs">
                <input type="checkbox" name="allergen_ids" value={allergen.id} />
                {allergen.label_i18n.en}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="rounded bg-black px-3 py-1 text-xs text-white">
          Add
        </button>
      </form>
    </main>
  );
}
