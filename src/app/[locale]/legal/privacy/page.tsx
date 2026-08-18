import type { Metadata } from "next";
import { PageContentBody } from "@/components/PageContentBody";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return <PageContentBody contentKey="legal_privacy" />;
}
