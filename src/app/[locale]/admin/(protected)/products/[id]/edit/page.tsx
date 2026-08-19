import { notFound } from "next/navigation";
import {
  getAllAllergens,
  getAllCategories,
  getAllIngredients,
  getAllUnits,
} from "@/lib/content/catalog-master-data";
import { getProductForEdit } from "@/lib/content/products";
import { ProductBasicFields } from "@/components/admin/ProductBasicFields";
import { OptionGroupEditor } from "@/components/admin/OptionGroupEditor";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { updateProduct } from "../../actions";

export default async function EditProductPage(
  props: PageProps<"/[locale]/admin/products/[id]/edit">,
) {
  const { id } = await props.params;

  const [product, categories, units, allergens, ingredients] = await Promise.all([
    getProductForEdit(id),
    getAllCategories(),
    getAllUnits(),
    getAllAllergens(),
    getAllIngredients(),
  ]);

  if (!product) {
    notFound();
  }

  const updateThis = updateProduct.bind(null, id);

  return (
    <div className="max-w-2xl space-y-10">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Edit product</h1>
        <form action={updateThis} className="mt-6 space-y-4">
          <ProductBasicFields
            categories={categories}
            units={units}
            allergens={allergens}
            product={product}
          />
          <button type="submit" className="btn-primary px-4 py-2 text-sm">
            Save
          </button>
        </form>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Photos</h2>
        <div className="mt-4">
          <ImageUploader productId={id} images={product.images} />
        </div>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">Options</h2>
        <div className="mt-4">
          <OptionGroupEditor
            productId={id}
            optionGroups={product.option_groups}
            ingredients={ingredients}
            productCategoryId={product.category_id}
          />
        </div>
      </div>
    </div>
  );
}
