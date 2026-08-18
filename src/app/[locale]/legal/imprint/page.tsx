import type { Metadata } from "next";
import { PageContentBody } from "@/components/PageContentBody";

export const metadata: Metadata = { title: "Imprint" };

export default function ImprintPage() {
  return <PageContentBody contentKey="legal_imprint" />;
}
