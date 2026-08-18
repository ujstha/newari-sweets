import { defineRouting } from "next-intl/routing";

// Phase 1: English only. The `{en, fi}` content-field mechanism exists
// throughout the data model and this routing config, but Finnish stays
// inactive until real Finnish copy is written -- add "fi" here (and
// populate messages/fi.json) to switch it on. See PLAN.md's Localization
// note.
export const routing = defineRouting({
  locales: ["en"],
  defaultLocale: "en",
});
