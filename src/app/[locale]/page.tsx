import { getTranslations } from "next-intl/server";

export default async function HomePage() {
  const t = await getTranslations("HomePage");

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </main>
  );
}
