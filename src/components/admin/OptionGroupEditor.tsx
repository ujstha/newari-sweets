import type { OptionGroupRow } from "@/lib/content/products";
import type { Ingredient } from "@/lib/content/catalog-master-data";
import {
  addOptionGroup,
  addOptionValue,
  deleteOptionGroup,
  deleteOptionValue,
} from "@/app/[locale]/admin/(protected)/products/actions";

export function OptionGroupEditor({
  productId,
  optionGroups,
  ingredients,
  productCategoryId,
}: {
  productId: string;
  optionGroups: OptionGroupRow[];
  ingredients: Ingredient[];
  productCategoryId: string;
}) {
  // Defaults to ingredients tagged for this product's category, with the
  // full catalog still one scroll away -- see PLAN.md's Ingredient/Allergen
  // System section.
  const suggested = ingredients.filter((i) => i.category_ids.includes(productCategoryId));
  const others = ingredients.filter((i) => !i.category_ids.includes(productCategoryId));

  const addGroupThis = addOptionGroup.bind(null, productId);

  return (
    <div className="space-y-4">
      {optionGroups.map((group) => {
        const addValueThis = addOptionValue.bind(null, productId, group.id);
        const deleteGroupThis = deleteOptionGroup.bind(null, productId, group.id);
        return (
          <div key={group.id} className="card-surface p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink">
                {group.name}{" "}
                <span className="text-xs text-ink-faint">
                  ({group.selection_type}
                  {group.is_required ? ", required" : ""})
                </span>
              </p>
              <form action={deleteGroupThis}>
                <button
                  type="submit"
                  className="text-xs font-medium text-brand hover:text-brand-dark"
                >
                  Delete group
                </button>
              </form>
            </div>

            <ul className="mt-2 space-y-1.5">
              {group.option_values.map((value) => {
                const deleteValueThis = deleteOptionValue.bind(null, productId, value.id);
                return (
                  <li
                    key={value.id}
                    className="flex items-center justify-between text-sm text-ink-soft"
                  >
                    <span>
                      {value.label} ({value.price_delta_cents >= 0 ? "+" : ""}
                      {(value.price_delta_cents / 100).toFixed(2)} €)
                      {value.is_default ? " · default" : ""}
                    </span>
                    <form action={deleteValueThis}>
                      <button
                        type="submit"
                        className="text-xs font-medium text-brand hover:text-brand-dark"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>

            <form action={addValueThis} className="mt-3 flex flex-wrap items-end gap-2">
              <input
                name="label"
                placeholder="Label"
                required
                className="input-field w-auto py-1 text-xs"
              />
              <input
                name="price_delta_cents"
                type="number"
                placeholder="Price delta (cents)"
                defaultValue={0}
                className="input-field w-28 py-1 text-xs"
              />
              <select name="ingredient_id" className="input-field w-auto py-1 text-xs">
                <option value="">(no linked ingredient)</option>
                {suggested.length > 0 ? (
                  <optgroup label="Suggested for this category">
                    {suggested.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name_i18n.en}
                      </option>
                    ))}
                  </optgroup>
                ) : null}
                <optgroup label="All ingredients">
                  {others.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name_i18n.en}
                    </option>
                  ))}
                </optgroup>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                <input type="checkbox" name="is_default" /> Default
              </label>
              <button type="submit" className="btn-secondary px-3 py-1 text-xs">
                Add value
              </button>
            </form>
          </div>
        );
      })}

      <form action={addGroupThis} className="card-surface flex flex-wrap items-end gap-2 p-4">
        <input
          name="name"
          placeholder="Group name (e.g. Size)"
          required
          className="input-field w-auto py-1 text-xs"
        />
        <select name="selection_type" className="input-field w-auto py-1 text-xs">
          <option value="single">Single-select</option>
          <option value="multiple">Multi-select</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-ink-soft">
          <input type="checkbox" name="is_required" defaultChecked /> Required
        </label>
        <button type="submit" className="btn-primary px-3 py-1 text-xs">
          Add group
        </button>
      </form>
    </div>
  );
}
