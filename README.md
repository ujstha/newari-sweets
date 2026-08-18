# Newari Sweets

Website for Newari Sweets, a Helsinki-based side business selling Nepali/Newari sweets and custom cakes. See [`../PLAN.md`](../PLAN.md) (one level up, in the workspace root) for the full build plan -- context, architecture decisions, data model, and phased build order.

## Stack

Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, Storage, RLS), deployed to Cloudflare Workers via `@opennextjs/cloudflare`. See PLAN.md's Architecture Decisions and Deployment sections.

## Local development

```bash
npm install
cp .env.example .env.local   # then fill in Supabase project values
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Script                            | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `npm run dev`                     | Local dev server                                  |
| `npm run build`                   | Standard Next.js production build                 |
| `npm run lint`                    | ESLint                                            |
| `npm run format` / `format:check` | Prettier write / check                            |
| `npm run typecheck`               | `tsc --noEmit`                                    |
| `npm run test` / `test:watch`     | Vitest (domain-layer unit tests)                  |
| `npm run cf:preview`              | OpenNext Cloudflare build + local Workers preview |
| `npm run cf:deploy`               | OpenNext Cloudflare build + deploy                |

All of the above (lint, typecheck, test) run automatically pre-commit via Husky + lint-staged, and again in CI on every PR -- see PLAN.md's Development Workflow section.

## Branching

`main` (production) ← `dev` (staging) ← `feat-*`/`fix-*` (one branch per feature/bugfix). Work happens on a `feat-*`/`fix-*` branch, PRs into `dev`, gets promoted to `main` once tested. Full detail in PLAN.md.

## Manual setup still needed (not automatable from here)

These require an interactive login/dashboard, so they're not done yet:

1. **Supabase**: create a production project (EU region) and a separate staging project for `dev`, then fill in `.env.local` and `wrangler.jsonc`'s `vars` (production) / `env.staging.vars` (staging) with each project's URL/anon key. Service-role keys go in via `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` (and `--env staging`), never in a committed file.
2. **Cloudflare**: `wrangler login`, then connect this repo in the Cloudflare dashboard for Workers Builds (git-based auto-deploy) -- map `main` → production Worker (`newari-sweets`), `dev` → the `staging` environment (`newari-sweets-staging`), and enable per-PR preview deploys for `feat-*`/`fix-*` branches.
3. **Resend** (Phase 8, not needed yet): create an account, get an API key, `wrangler secret put RESEND_API_KEY`.

## Known adapter constraint

`src/middleware.ts` intentionally stays on Next.js's deprecated `middleware` file convention rather than 16's `proxy` -- see the comment in that file. Next 16's `proxy.ts` dropped Edge runtime support (Node.js-only), but `@opennextjs/cloudflare` (as of 1.20.x) doesn't yet support Node.js-runtime middleware on Workers, so Edge (via the old convention) is required for now. Revisit when either side catches up.
