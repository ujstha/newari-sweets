import { getSiteSettings } from "@/lib/content/site-settings";
import { getAllAllergens } from "@/lib/content/catalog-master-data";
import { CheckoutForm } from "@/components/CheckoutForm";

export default async function CheckoutPage() {
  const [settings, allergens] = await Promise.all([getSiteSettings(), getAllAllergens()]);

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-xl font-semibold">Checkout</h1>
      <CheckoutForm
        siteDefaultLeadDays={settings.default_min_prep_days}
        allergens={allergens.filter((a) => a.is_active)}
      />
    </main>
  );
}
