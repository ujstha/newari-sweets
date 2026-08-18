import { getAllCategories } from "@/lib/content/catalog-master-data";
import { createCategory, updateCategory } from "./actions";

export default async function AdminCategoriesPage() {
  const categories = await getAllCategories();

  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-xl font-semibold">Categories</h1>

      {categories.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">No categories yet -- add the first one below.</p>
      ) : null}

      <ul className="mt-6 space-y-3">
        {categories.map((category) => {
          const updateThis = updateCategory.bind(null, category.id);
          return (
            <li key={category.id} className="rounded border p-3">
              <form action={updateThis} className="flex flex-wrap items-center gap-3">
                <input
                  name="name"
                  defaultValue={category.name_i18n.en ?? ""}
                  className="rounded border px-2 py-1 text-sm"
                />
                <span className="text-xs text-gray-500">/{category.slug}</span>
                <label className="flex items-center gap-1 text-xs">
                  Sort
                  <input
                    name="sort_order"
                    type="number"
                    defaultValue={category.sort_order}
                    className="w-16 rounded border px-2 py-1 text-sm"
                  />
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" name="is_active" defaultChecked={category.is_active} />
                  Active
                </label>
                <button type="submit" className="rounded bg-black px-3 py-1 text-xs text-white">
                  Save
                </button>
              </form>
            </li>
          );
        })}
      </ul>

      <form action={createCategory} className="mt-6 flex items-center gap-2 border-t pt-6">
        <input
          name="name"
          placeholder="New category name"
          required
          className="rounded border px-2 py-1 text-sm"
        />
        <button type="submit" className="rounded bg-black px-3 py-1 text-xs text-white">
          Add
        </button>
      </form>
    </main>
  );
}
