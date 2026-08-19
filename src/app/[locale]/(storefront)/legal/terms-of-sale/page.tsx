import type { Metadata } from "next";
import { PageContentBody } from "@/components/PageContentBody";

export const metadata: Metadata = { title: "Terms of Sale" };

export default function TermsOfSalePage() {
  return <PageContentBody contentKey="legal_terms" />;
}
