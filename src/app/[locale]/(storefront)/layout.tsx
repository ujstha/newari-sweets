import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";

// Route group -- doesn't affect URLs. Scopes the public storefront chrome
// (header/footer/announcement banner) to customer-facing pages only, so
// /admin/* (a sibling segment under [locale]) renders its own admin shell
// instead of inheriting "Shop"/"Cart" nav meant for customers.
export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnnouncementBanner />
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
