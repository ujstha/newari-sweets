import { getAllCategories } from "@/lib/content/catalog-master-data";
import { createCategory, updateCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-semibold text-ink">Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-ink-soft">No categories yet -- add the first one below.</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {categories.map((category) => {
          const updateThis = updateCategory.bind(null, category.id);
          return (
            <li key={category.id} className="card-surface p-4">
              <form action={updateThis} className="flex flex-wrap items-center gap-3">
                <input
                  name="name"
                  defaultValue={category.name_i18n.en ?? ""}
                  className="input-field w-auto flex-1 py-1.5"
                />
                <span className="text-xs text-ink-faint">/{category.slug}</span>
                <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                  Sort
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={category.sort_order}
                    className="input-field w-16 py-1.5"
                  />
                </label>
                <label className="flex items-center gap-1.5 text-xs text-ink-soft">
                  <input type="checkbox" name="is_active" defaultChecked={category.is_active} />
                  Active
                </label>
                <button type="submit" className="btn-secondary px-3 py-1.5 text-xs">
                  Save
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      <form
        action={createCategory}
        className="mt-6 flex items-center gap-2 border-t border-border-warm pt-6"
      >
        <input
          name="name"
          placeholder="New category name"
          required
          className="input-field flex-1 py-1.5"
        />
        <button type="submit" className="btn-primary px-4 py-1.5 text-xs">
          Add
        </button>
      </form>
    </div>
  );
}
