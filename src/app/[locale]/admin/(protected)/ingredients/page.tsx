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
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Ingredients</h1>
      <p className="mt-1 text-sm text-ink-soft">
        A shared catalog reused across products. Category tags drive which ingredients the product
        option builder suggests by default.
      </p>

      {ingredients.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No ingredients yet -- add the first one below.</p>
      ) : null}

      <ul className="mt-6 space-y-4">
        {ingredients.map((ingredient) => {
          const updateThis = updateIngredient.bind(null, ingredient.id);
          return (
            <li key={ingredient.id} className="card-surface p-4">
              <form action={updateThis} className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    name="name"
                    defaultValue={ingredient.name_i18n.en ?? ""}
                    className="input-field w-auto flex-1 py-1.5"
                  />
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    Price delta (cents)
                    <input
                      name="default_price_delta_cents"
                      type="number"
                      defaultValue={ingredient.default_price_delta_cents}
                      className="input-field w-20 py-1.5"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <input type="checkbox" name="is_active" defaultChecked={ingredient.is_active} />
                    Active
                  </label>
                </div>
                <div>
                  <p className="field-label mb-1.5">Categories</p>
                  <div className="flex flex-wrap gap-3">
                    {categories.map((category) => (
                      <label
                        key={category.id}
                        className="flex items-center gap-1.5 text-xs text-ink-soft"
                      >
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
                  <p className="field-label mb-1.5">Allergens</p>
                  <div className="flex flex-wrap gap-3">
                    {allergens.map((allergen) => (
                      <label
                        key={allergen.id}
                        className="flex items-center gap-1.5 text-xs text-ink-soft"
                      >
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
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                  Save
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      <form action={createIngredient} className="mt-8 space-y-3 border-t border-border-warm pt-6">
        <p className="font-display text-base font-medium text-ink">Add ingredient</p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            name="name"
            placeholder="Name"
            required
            className="input-field w-auto flex-1 py-1.5"
          />
          <label className="flex items-center gap-1.5 text-xs text-ink-soft">
            Price delta (cents)
            <input
              name="default_price_delta_cents"
              type="number"
              defaultValue={0}
              className="input-field w-20 py-1.5"
            />
          </label>
        </div>
        <div>
          <p className="field-label mb-1.5">Categories</p>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-1.5 text-xs text-ink-soft">
                <input type="checkbox" name="category_ids" value={category.id} />
                {category.name_i18n.en}
              </label>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label mb-1.5">Allergens</p>
          <div className="flex flex-wrap gap-3">
            {allergens.map((allergen) => (
              <label key={allergen.id} className="flex items-center gap-1.5 text-xs text-ink-soft">
                <input type="checkbox" name="allergen_ids" value={allergen.id} />
                {allergen.label_i18n.en}
              </label>
            ))}
          </div>
        </div>
        <button type="submit" className="btn-primary px-4 py-1.5 text-xs">
          Add
        </button>
      </form>
    </div>
  );
}
