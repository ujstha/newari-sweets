import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductBySlug } from "@/lib/content/public-catalog";
import { ProductDetail } from "@/components/ProductDetail";

export async function generateMetadata(
  props: PageProps<"/[locale]/products/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name_i18n.en,
    description: product.description_i18n.en,
  };
}

export default async function ProductPage(props: PageProps<"/[locale]/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
