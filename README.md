# Newari Sweets

Website for Newari Sweets, a Helsinki-based side business selling Nepali/Newari sweets and custom cakes — replacing the current Instagram-DM ordering flow with a real storefront, an admin panel/CMS, and an order-approval workflow.

**Start here:** [`../PLAN.md`](../PLAN.md) (one level up, in the workspace root) is the source of truth for _why_ things are built the way they are — context, architecture decisions, the full data model, and the phased build order. This README is the _how do I get this running_ doc. If something here and PLAN.md ever disagree, PLAN.md wins; open an issue/PR to reconcile.

## Current status

**Build-order Phases 1–4 are done and merged to `dev`.** Repo/tooling/i18n/domain layer (Phase 1); auth + master data (Phase 2); site content CMS (Phase 3); and catalog authoring (Phase 4) — `products`/`option_groups`/`option_values`/`product_allergens`/`product_images` + RLS, the `product-images` Storage bucket, `duplicate_product()`, and admin screens for categories/ingredients/products (including the option-group/value builder and image upload). All tested against the real Supabase project (schema, RLS, storage, and the full admin UI flow).

See PLAN.md's "Phased Build Order" for what phases 5–10 cover next (Phase 5, Public storefront catalog, is up next). This is being built autonomously, phase by phase, without stopping for review between phases — see the note at the bottom of this file for what to check when you're back.

Note PLAN.md uses "Phase" in two unrelated ways — don't confuse them:

- **The numbered build order** (Phase 1 Scaffolding, Phase 2 Auth + master data, … Phase 10 Launch readiness) — this is "what phase are we building."
- **The "Payment Gateway Seam" section**, which is deferred work with no fixed phase number — it only starts once the business registers a Finnish business ID (Y-tunnus). It is _not_ "Phase 2."

## Prerequisites

- Node.js 20.9+ and npm (developed against Node 22 / npm 11)
- Git
- A [Supabase](https://supabase.com) account (free tier is enough for now) — for the database, auth, and storage
- A [Cloudflare](https://cloudflare.com) account (free tier) — for hosting
- (Later, Phase 8 only) A [Resend](https://resend.com) account for transactional email — not needed yet

## Getting started

```bash
git clone git@github.com:ujstha/newari-sweets.git
cd newari-sweets/newari-sweets   # the actual app lives in this nested folder, see "Repo layout" below
npm install
cp .env.example .env.local           # public vars, see "Environment variables" below
cp .dev.vars.example .dev.vars       # local secrets (not needed until Phase 2+)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Repo layout

This Git repository is the **inner** `newari-sweets/` folder. The **outer** `newari-sweets/` folder (one level up, containing `PLAN.md`) is just a workspace root and isn't part of the repo — that's deliberate, so planning docs can live outside the app's own git history if desired. If you only have this inner folder (e.g. you cloned just this repo), you won't have `../PLAN.md` locally; grab it from the repo history/wherever it's shared, or ask whoever set up the project.

### Setting up Supabase

1. Create a project at [supabase.com](https://supabase.com/dashboard) in an **EU region** (the business is Finland-based; GDPR data-residency reasons — see PLAN.md's Context section). Create a **second** project the same way for staging (used by the `dev` branch — see "Branching" below).
2. From each project's dashboard → Settings → API, copy the **Project URL** and **anon/public key**.
3. For local dev, put the production project's values in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
4. The **service role key** (Settings → API → service_role secret) goes in `.dev.vars` for local dev (never `.env.local`, and never committed) — see "Environment variables" below for why these use different files.
5. Apply the schema: `npx supabase link --project-ref <your-project-ref>` then `npx supabase db push` (or, for local dev with Docker running, `npx supabase start` + `npx supabase db reset`, which also runs `supabase/seed.sql`). Repeat against the staging project too.

### Creating the first admin user

`admin_users` isn't seeded (it needs a real `auth.users` row, which only exists once someone signs up):

1. In the Supabase dashboard → Authentication → Users → Add user, create an account with an email/password (this is the shared admin login — see PLAN.md's Architecture Decisions for why it's a single shared account for now).
2. Copy that user's UUID, then in the SQL editor: `insert into admin_users (user_id) values ('<uuid>');`
3. Sign in at `/admin/login` with that email/password.

### Setting up Cloudflare

1. `npx wrangler login` (opens a browser to authenticate).
2. In the [Cloudflare dashboard](https://dash.cloudflare.com), connect this GitHub repo under Workers → your worker → Settings → Builds, so pushes trigger deploys automatically (Workers Builds). Map `main` → the production Worker (`newari-sweets`), and `dev` → the `staging` environment (`newari-sweets-staging`, see `wrangler.jsonc`'s `env.staging`). Enable preview deploys for other branches (`feat-*`/`fix-*`) if you want per-PR previews.
3. Fill in the **production** Supabase URL/anon key in `wrangler.jsonc`'s top-level `vars`, and the **staging** project's values in `env.staging.vars`. These are safe to commit (see "Environment variables" below for why).
4. Set secrets (not committed anywhere):
   ```bash
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY --env staging
   ```
   (Repeat for `RESEND_API_KEY` once you reach build-order Phase 8 — not needed before then.)

## Environment variables

This stack needs **two different access patterns**, and mixing them up fails silently — it works in `next dev` but breaks on the deployed Cloudflare Worker. Always go through `src/lib/env.ts` rather than reading `process.env`/Cloudflare bindings directly elsewhere in the app, so this distinction only has to be understood in one place:

|                                                         | Examples                                  | Local dev file                                                                                                             | Deployed                                       | How it's read                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Public vars** (`NEXT_PUBLIC_*`)                       | Supabase URL, Supabase anon key           | `.env.local` (Next.js's own dotenv loading)                                                                                | `wrangler.jsonc`'s `vars` / `env.staging.vars` | `process.env.NEXT_PUBLIC_X` — safe anywhere (client or server), because Next.js inlines these into the JS bundle at **build** time. `publicEnv` in `src/lib/env.ts`.                                                                                                                                                                                                                                                                                     |
| **Server-only secrets** (never `NEXT_PUBLIC_`-prefixed) | Supabase service role key, Resend API key | `.dev.vars` (wrangler's own local-secrets convention — **not** `.env.local`, Cloudflare bindings don't read `.env*` files) | `wrangler secret put <NAME>` (never committed) | **Not** `process.env` in either case — these are Cloudflare Worker bindings, read via `getCloudflareContext().env.X` from `@opennextjs/cloudflare`. Works in both `next dev` (via `initOpenNextCloudflareForDev()` in `next.config.ts`, which is what makes it pick up `.dev.vars`) and the deployed Worker. `getServerEnv()` in `src/lib/env.ts`, server-side code only (Server Components, Server Actions, Route Handlers — never a Client Component). |

Because `wrangler.jsonc`'s `vars` only ever hold public values, it's safe to commit — the actual secrets live only in Cloudflare (via `wrangler secret put`) and in your own uncommitted `.dev.vars`.

**Adding a new env var** — checklist:

1. Public var: add to `.env.example`, and to `wrangler.jsonc`'s `vars` (and `env.staging.vars`). Secret: add to `.dev.vars.example`, and `wrangler secret put <NAME>` for both the production and `--env staging` Workers.
2. Add it to the `CloudflareEnv` interface in `src/types/cloudflare-env.d.ts` (this is hand-written, not generated — see the comment at the top of that file for why).
3. Expose it through `publicEnv` or `getServerEnv()` in `src/lib/env.ts`, and consume it from there elsewhere in the app — never read `process.env`/`getCloudflareContext()` directly outside that file.

`npm run cf:typegen` (`wrangler types`) generates `worker-configuration.d.ts` from `wrangler.jsonc`, useful for editor intellisense on raw Worker bindings — it's gitignored (huge, and regenerable) and isn't what `src/lib/env.ts`/`CloudflareEnv` actually rely on, since it infers `""`-literal types from today's placeholder values rather than `string`.

## Scripts

| Script                            | Purpose                                                                                        |
| --------------------------------- | ---------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Local dev server                                                                               |
| `npm run build`                   | Standard Next.js production build                                                              |
| `npm run lint`                    | ESLint                                                                                         |
| `npm run format` / `format:check` | Prettier write / check                                                                         |
| `npm run typecheck`               | `tsc --noEmit` (regenerates Next's route types first, so it works on a fresh clone)            |
| `npm run test` / `test:watch`     | Vitest (domain-layer unit tests)                                                               |
| `npm run cf:preview`              | OpenNext Cloudflare build + local Workers preview                                              |
| `npm run cf:deploy`               | OpenNext Cloudflare build + deploy (normally you'd let Workers Builds do this on push instead) |
| `npm run cf:typegen`              | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc`                                   |

`lint`, `typecheck`, and `test` all run automatically pre-commit via Husky + lint-staged, and should also run in CI on every PR (GitHub Actions isn't wired up yet — add it before relying on that half of the Development Workflow described in PLAN.md).

## Branching

`main` (production) ← `dev` (staging) ← `feat-*`/`fix-*` (one branch per feature/bugfix, branched from `dev`).

1. Branch off `dev`: `git checkout dev && git checkout -b feat-short-description` (or `fix-...` for a bugfix).
2. Commit as you go — Husky will block a commit that fails lint/typecheck/tests.
3. Open a PR into `dev`. Once merged and `dev` as a whole has been exercised, `dev` gets merged/promoted into `main`.
4. Never commit directly to `main`.

Full reasoning in PLAN.md's "Development Workflow" section.

## Project structure

```
src/
  app/[locale]/
    admin/
      login/page.tsx        # public sign-in form, outside the auth gate
      (protected)/           # route group -- layout.tsx gates everything
        layout.tsx            # here on session + admin_users membership,
                               # force-dynamic (admin data must never cache)
        page.tsx               # dashboard, links to settings/content
        settings/               # site_settings form (business info, hero,
                                 # announcement banner, min prep days)
        content/[key]/          # page_content editor (about, 3 legal pages)
      actions.ts              # signIn/signOut Server Actions
    legal/{privacy,terms-of-sale,imprint}/page.tsx  # render page_content
  components/
    Header.tsx, Footer.tsx, AnnouncementBanner.tsx  # site chrome, all
                                                      # sourced from DB
    PageContentBody.tsx    # shared title+markdown renderer for the fixed
                            # CMS pages (react-markdown, no raw HTML)
  i18n/                # next-intl routing/request/navigation config
  lib/
    content/
      site-settings.ts   # getSiteSettings() -- React cache()-wrapped
      page-content.ts     # getPageContent(key) -- same
    domain/            # framework-agnostic business logic (pricing, order
                        # workflow, ingredient/allergen union, i18n content
                        # picking) -- pure, unit-tested, see PLAN.md's
                        # Architecture Decisions
    supabase/
      client.ts         # browser client (anon key)
      server.ts          # server client (anon key, cookie-based session)
      admin.ts            # service-role client -- server-only, bypasses
                           # RLS, see the comment at the top of the file
    env.ts             # centralized env access, see "Environment variables"
  types/
    cloudflare-env.d.ts # hand-written CloudflareEnv augmentation
  middleware.ts          # deliberately NOT proxy.ts (see the comment in the
                          # file) -- also refreshes the Supabase session
                          # cookie alongside next-intl's locale routing
supabase/
  migrations/          # schema starts here (build-order Phase 2)
  functions/           # empty -- starts later (order creation, payment
                        # webhook, notifications), RLS handles the rest
  seed.sql              # local/dev reference master data (units,
                         # categories, the 14 EU allergens) -- NOT
                         # admin_users/products/site_settings, see the
                         # comment at its top
messages/
  en.json              # UI chrome strings (next-intl) -- NOT where product
                        # content translation lives, that's DB `*_i18n`
                        # columns once the schema exists
wrangler.jsonc          # Cloudflare Worker config, production + staging
open-next.config.ts      # OpenNext Cloudflare adapter config
```

## Testing

`npm run test` runs Vitest against `src/**/*.test.ts`. Right now that's the three domain-layer modules (`pricing`, `order-workflow`, `ingredients`) — these are the money/state-machine logic PLAN.md calls out as needing real coverage, so keep them pure and fully tested as they grow. UI/integration testing isn't set up yet; add it when there's a storefront/admin UI worth testing (build-order Phase 5+).

## Known adapter constraint

`src/middleware.ts` intentionally stays on Next.js's deprecated `middleware` file convention rather than 16's `proxy.ts` — see the comment in that file. Next 16's `proxy.ts` dropped Edge runtime support (Node.js-only), but `@opennextjs/cloudflare` (as of 1.20.x) doesn't yet support Node.js-runtime middleware on Workers, so Edge (via the old convention) is required for now. Revisit when either side catches up.

## Picking up work

Check PLAN.md's "Phased Build Order" for what's next. Phase 5 (Public storefront catalog) is next — listing/detail pages, live allergen badges, Featured/Best-Sellers sections, quick-order vs. customize UI, per-page OG tags. Each phase is scoped to end in something concretely testable end-to-end, per PLAN.md's Verification section — don't skip ahead to later phases' UI/features before their data model exists.

### Notes from autonomous building (Phases 2-4, unattended session)

**Real bug found and fixed (Phase 4): Supabase Storage RLS needs a SELECT policy, not just INSERT/UPDATE/DELETE.** The `product-images` bucket's `public: true` flag only affects anonymous _content_ serving via the public URL — it does nothing for the Storage API's authenticated management operations (list/delete/etc., which admin uploads/deletes go through). Without an explicit `for select` policy on `storage.objects`, an admin's `remove()` call silently no-ops: **no error, `data: []`**, file still there. Cost real debugging time because it looks identical to "nothing happened" rather than an authorization failure. Fixed by adding a `for select` policy alongside the existing insert/update/delete ones (see the migration's Storage section) — if you add another Storage bucket later, remember the SELECT policy up front. Also note: policies on `storage.objects` need `is_admin()` schema-qualified as `public.is_admin()` (unlike its bare use in `public`-schema table policies) since `storage` isn't in that role's default search path for policy evaluation.

**Known dev-only quirk (Phase 3), still unresolved**: a Playwright/Chromium `page.reload()`, and occasionally the in-place client update right after a Server Action submit on list-style admin pages (categories/ingredients), can lag or show a stale value for longer than expected — even though the database, a fresh navigation (`page.goto()`), and plain `curl` were _always_ immediately correct in every case tested (dozens of times, across direct DB checks, RLS checks, and the full product/option/image flow). Tried and ruled out as fixes: `force-dynamic` on the admin layout, `redirect()` back to the same page after mutating, redirecting to a cache-busted URL, disabling the browser's HTTP cache entirely via CDP, and swapping `next-intl`'s `redirect()` for plain `next/navigation`. None of it changed the behavior, and in the one case tracked all the way through, the correct content did eventually render without any navigation at all — just slower than expected. Current best guess: Turbopack dev-server compilation/HMR overhead under rapid repeated automated test runs (each spinning up a fresh browser + login + cold route hits), not a real defect — but genuinely unconfirmed. Re-test with a real browser (not Playwright) doing normal-paced clicking, and separately once deployed to the actual Cloudflare Worker (a completely different rendering pipeline than `next dev`'s Turbopack, so this may simply not exist there) before spending more time on it.

**Testing approach that worked well**: verify RLS/data logic directly via `curl`/the Supabase REST API and a signed-in admin's JWT (fast, deterministic, no browser timing issues) — reserve Playwright for the handful of flows that genuinely need a real DOM (login redirect gating, file upload, multi-step forms). Mixing the two caught real bugs (the Storage RLS issue above) without burning excessive time on browser-automation flakiness.
