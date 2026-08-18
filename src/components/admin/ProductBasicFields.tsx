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
      <div className="space-y-1">
        <label htmlFor="name" className="block text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={product?.name_i18n.en ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="description" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={product?.description_i18n.en ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label htmlFor="category_id" className="block text-sm font-medium">
            Category
          </label>
          <select
            id="category_id"
            name="category_id"
            required
            defaultValue={product?.category_id ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
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
        <div className="space-y-1">
          <label htmlFor="unit_id" className="block text-sm font-medium">
            Unit
          </label>
          <select
            id="unit_id"
            name="unit_id"
            required
            defaultValue={product?.unit_id ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
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
        <div className="space-y-1">
          <label htmlFor="base_price_cents" className="block text-sm font-medium">
            Base price (cents, per unit)
          </label>
          <input
            id="base_price_cents"
            name="base_price_cents"
            type="number"
            min={0}
            required
            defaultValue={product?.base_price_cents ?? 0}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="min_prep_days" className="block text-sm font-medium">
            Min prep days (blank = site default)
          </label>
          <input
            id="min_prep_days"
            name="min_prep_days"
            type="number"
            min={0}
            defaultValue={product?.min_prep_days ?? ""}
            className="w-full rounded border px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="highlight_note" className="block text-sm font-medium">
          Highlight note (optional, e.g. &quot;New -- first batch&quot;)
        </label>
        <input
          id="highlight_note"
          name="highlight_note"
          defaultValue={product?.highlight_note_i18n.en ?? ""}
          className="w-full rounded border px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
          Active
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" name="is_featured" defaultChecked={product?.is_featured} />
          Featured
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            name="supports_message"
            defaultChecked={product?.supports_message}
          />
          Supports cake message
        </label>
      </div>

      <div>
        <p className="text-sm font-medium">Base allergens</p>
        <div className="mt-1 flex flex-wrap gap-3">
          {allergens.map((allergen) => (
            <label key={allergen.id} className="flex items-center gap-1 text-xs">
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
