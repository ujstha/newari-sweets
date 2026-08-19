import type { Category, Unit, Allergen } from "@/lib/content/catalog-master-data";
import type { ProductForEdit } from "@/lib/content/products";

export function ProductBasicFields({
  categories,
  units,
  allergens,
  product,
}: {
  categories: Category[];
  units: Unit[];
  allergens: Allergen[];
  product?: ProductForEdit;
}) {
  return (
    <>
      <div>
        <label htmlFor="name" className="field-label mb-1.5">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name_i18n.en ?? ""}
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="description" className="field-label mb-1.5">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description_i18n.en ?? ""}
          className="input-field"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="category_id" className="field-label mb-1.5">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={product?.category_id ?? ""}
            className="input-field"
          >
            <option value="" disabled>
              Select...
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name_i18n.en}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="unit_id" className="field-label mb-1.5">
            Unit
          </label>
          <select
            id="unit_id"
            name="unit_id"
            required
            defaultValue={product?.unit_id ?? ""}
            className="input-field"
          >
            <option value="" disabled>
              Select...
            </option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.label_i18n.en} ({unit.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="base_price_cents" className="field-label mb-1.5">
            Base price (cents, per unit)
          </label>
          <input
            id="base_price_cents"
            name="base_price_cents"
            type="number"
            min={0}
            required
            defaultValue={product?.base_price_cents ?? 0}
            className="input-field"
          />
        </div>
        <div>
          <label htmlFor="min_prep_days" className="field-label mb-1.5">
            Min prep days (blank = site default)
          </label>
          <input
            id="min_prep_days"
            name="min_prep_days"
            type="number"
            min={0}
            defaultValue={product?.min_prep_days ?? ""}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label htmlFor="highlight_note" className="field-label mb-1.5">
          Highlight note (optional, e.g. &quot;New -- first batch&quot;)
        </label>
        <input
          id="highlight_note"
          name="highlight_note"
          defaultValue={product?.highlight_note_i18n.en ?? ""}
          className="input-field"
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-ink-soft">
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Active
        </label>
        <label className="flex items-center gap-1.5">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} />
          Featured
        </label>
        <label className="flex items-center gap-1.5">
          <input
            type="checkbox"
            name="supports_message"
            defaultChecked={product?.supports_message}
          />
          Supports cake message
        </label>
      </div>

      <div>
        <p className="field-label mb-1.5">Base allergens</p>
        <div className="flex flex-wrap gap-3">
          {allergens.map((allergen) => (
            <label key={allergen.id} className="flex items-center gap-1.5 text-xs text-ink-soft">
              <input
                type="checkbox"
                name="allergen_ids"
                value={allergen.id}
                defaultChecked={product?.allergen_ids.includes(allergen.id)}
              />
              {allergen.label_i18n.en}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
