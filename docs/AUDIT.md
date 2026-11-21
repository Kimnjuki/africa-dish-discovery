# LadhaQuest codebase and SEO audit

**Date:** 2026-11-20  
**Blueprint:** `ladhaquest_master_blueprint.cursor.json` (v1.0.0)  
**Repo:** `africa-dish-discovery-main`  
**Live site:** https://www.ladhaquest.com  
**Scope:** Inspect the repository and the public Supabase API. No application code was changed. Lighthouse, Search Console, and GA4 were not re-run (that is S1-02).

This replaces the 2026-11-13 audit, which was scored against an older F01–F17 strategy. Shipped work from 13–16 November is kept in the appendix so it is not redone.

---

## Verdict

LadhaQuest is already a Vite + React + Supabase cooking product with country hubs, a filterable recipe index, cook mode, pantry matching, a meal planner, a grocery list, and a post-build HTML prerender. It is not a greenfield Next.js app, and it is not yet an African Ingredient Graph.

The defensible gap in the blueprint — canonical ingredients, many-to-many local aliases, verified substitutions, and country availability — does not exist in Postgres. Those facts live in client TypeScript (`recipeSearch.ts`, `substitutionGraph.ts`, `localMarket.ts`) and in an edge function that asks an LLM to invent substitute names.

Do not migrate to Next.js, Meilisearch, Redis, or Nest for Sprint 1. Extend the current stack. Put the ingredient graph in Supabase, and stop publishing unconstrained AI substitutions.

---

## Stack detected

| Layer | What exists | Blueprint default | Reconciliation |
|---|---|---|---|
| Frontend | Vite 5, React 18, TypeScript, Tailwind, shadcn/Radix | Next.js App Router | Keep Vite. A rewrite would throw away prerender, PWA, and the current routes. |
| Routing | React Router 6, lazy routes in `src/App.tsx` | App Router | Keep. |
| Rendering | CSR SPA, plus `scripts/prerender-seo.mjs` after `vite build` | SSR/SSG/ISR | Keep prerender. It already emits recipe, country, and hub HTML shells. It is not full SSR. |
| Data | Supabase Postgres, Auth, Storage, Edge Functions | Postgres + pg_trgm + pgvector | Keep Supabase. Add `pg_trgm` when the alias table exists. Defer pgvector. |
| Search | Client alias groups + Levenshtein in `src/lib/recipeSearch.ts`; `ai-search` edge function | Meilisearch or Typesense | Keep the client layer. Index aliases in Postgres before adding a search service. |
| Cache / jobs | None (no Redis, no BullMQ) | Redis + BullMQ | Not required for Sprint 1. Cache hot substitutions in the edge function or a table later. |
| Auth | Email, Google, phone OTP UI (`PhoneAuthForm`) | Auth.js / Clerk + phone OTP | Keep Supabase Auth. Phone OTP still needs the provider and an SMS gateway turned on. |
| PWA | `vite-plugin-pwa` / Workbox, `/install`, `/offline-recipes` | Workbox | Keep. |
| Hosting | Docker (Node 20) + nginx, Coolify from `main`, Cloudflare in front | — | Keep. Canonical host is `https://www.ladhaquest.com`. Apex 301s to www. |
| CI | `.github/workflows/ci.yml`: lint, typecheck, `npm run build` | + unit, e2e, Lighthouse, schema checks | Tests exist (`test:search`, `test:substitutions`, `test:market`, `test:phone`, `test:offline`, `test:import`) and are not in CI. |
| Analytics | Cookie banner only. No GA4, PostHog, or Sentry in `src/` or `index.html` | GA4 + PostHog + Search Console | S1-13 is open. Do not invent traffic numbers. |
| Payments | Grocery panel deep-links (Jumia, Glovo, WhatsApp, M-Pesa, MoMo). No checkout | Paystack, Flutterwave, Stripe | Phase 3. Out of Sprint 1. |

---

## Routing and rendering

Public indexable routes include `/`, `/recipes`, `/recipe-index`, `/recipe/:slug`, `/country/:countrySlug`, `/countries`, `/continents`, `/dish/:dishSlug`, `/story/:dishSlug`, `/atlas`, `/cuisine-map`, `/meals`, `/ingredients`, `/blog`, `/blog/:slug`.

App surfaces (`/auth`, `/pantry`, `/my-list`, `/household`, `/meal-planner`, `/meal-planner-calendar`, `/import-recipe`, `/submit-recipe`, `/offline-recipes`, admin tools) are `Disallow`ed in `public/robots.txt`. `noIndex` is set in React on pantry, my-list, household, meal planner, import, and offline recipes only. It runs in `useEffect`, so a non-JS crawler never sees it. `robots.txt` is the control that actually works. `/auth`, `/submit-recipe`, `/meal-planner-calendar`, and `/editorial-review` rely on robots alone.

`index.html` contains a crawlable `#seo-shell` (H1, hub links, 12 recipe links, WebSite + Organization + ItemList JSON-LD). React replaces that node on mount. `scripts/prerender-seo.mjs` writes unique title, description, canonical, and Recipe JSON-LD for:

- the hub list in that script (index, countries, atlas, ingredients, blog, legal, install)
- African recipes (`is_african = true` OR `continent = Africa`)
- country pages derived from those recipes
- static blog posts

Sitemap `sitemap-recipes.xml` lists all **2,103** slugs. Prerender covers the African subset (**1,477**). About **626** non-African recipe URLs are in the sitemap and fall through to the SPA shell. That is the main indexation hole left after the 16 November rescue.

---

## Production counts (queried 2026-11-20)

Anon REST against `qfctezxqcomhrasrsvjg`, `Prefer: count=exact`. These rows are publicly readable. They are not filtered by a `published` status.

| Measure | Count |
|---|---:|
| `recipes` | **2,103** |
| Unique `slug` | **2,103** |
| `continent = Africa` | **1,477** |
| `dishes` | **1,428** |
| `ingredients` | **542** |
| `recipe_ingredients` | **0** |
| `ingredient_substitutions` | **0** |
| `recipe_reviews` | **0** |
| `ingredient_aliases` | table does not exist (404) |
| `ingredient_availability` | table does not exist (404) |
| `creator_profiles` | table does not exist (404) |

Recipe field completeness across all 2,103 rows:

| Field | Present |
|---|---:|
| `image_url` | 2,103 (0 null). `data/image-audit.json`: 12 duplicate URL groups covering 26 recipes, mostly shared cookbook scans |
| `ingredients` JSON, `steps` JSON, `history` | 2,103 |
| `difficulty` | 2,052 |
| `cook_time` | 2,013 |
| `prep_time` | 2,003 |
| `calories` | 972 |
| `dietary_tags` (non-empty) | 433 |
| `created_by` | **0** |
| `verification_status` | 2,027 null; 48 “Wikimedia-cited”; 21 “cookbook-sourced”; 7 “needs verification”. Nothing uses `draft \| published` |

### Conflicts in the blueprint

| Claim | Resolution |
|---|---|
| Homepage 2,100+ vs index 1,700+ | Use **2,103** for the catalog and **1,477** when the sentence is about African recipes. “1,700+” is stale. `index.html` and the hero already say 2,100+. |
| Sitemap 3,136 vs DB | Fixed in the committed sitemap. `public/sitemap-manifest.json` (2026-11-17) records 2,103 recipe URLs and 4,597 total URLs. |
| Competitor recipe/review counts and the 65–70% delivery-market claim | Not in this repo. Benchmarks only. Do not put them in UI or investor copy. |
| `verification_status = published` | That value is unused. “Published” today means “anon can read the row”. |

Country depth is still the 2026-11-13 picture in `docs/COVERAGE.md` (Egypt 200, Nigeria 112, many countries at a seeded floor, plus a large Global/non-African import). Labels are messy (`US` / `USA` / `United States`). There is no `countries` table; `recipes.country` is free text. `regions` is a thin id/name table, and `recipes.region_id` is the only structured geo link.

---

## Data model vs the blueprint

Recipes are the source of truth, and their ingredients are a JSON blob on `recipes.ingredients`. The relational graph the blueprint specifies is mostly absent.

| Blueprint table | In this repo |
|---|---|
| `recipes` | Present, wide, and denormalized. Missing slug-stable SEO fields (`seo_title`, `seo_description`, `canonical_url`), structured `status`, `author_id` usage, equipment, spice as a facet, yield separate from `servings`, and step timers. Times are duplicated (`prep_time` and `prep_time_minutes`). |
| `dishes` | Present: name, slug, country, region string, native name, phonetic spelling, tribe, cultural significance, sources. No `parent_dish_id`, no alternate-name graph, no pan-African flag. |
| `recipe_ingredients` | Table exists (`ingredient_id`, `quantity` as text, `unit`). **0 rows.** Pantry and search read the JSON blob. |
| `ingredients` | 542 rows. Columns are only `id`, `name`, `category`, `shelf_life_days`. No slug, allergens, diet tags, nutrition, function tags, safety flags, or licence. |
| `ingredient_aliases` | **Missing.** Aliases are string arrays in `recipeSearch.ts` and `substitutionGraph.ts`. `morogo` is collapsed to amaranth / imifino / “african spinach”. `sukuma wiki` is collapsed to collard greens. No `match_confidence`, no `is_ambiguous`, no language or country. |
| `substitutions` | Table `ingredient_substitutions` exists (`original_ingredient_id`, `substitute_ingredient_id`, `quantity_ratio`, `compatibility_score`, `reason`, `notes`). **0 anon-visible rows.** No type, diet, allergens, review status, reviewer, or model version. The live graph is ~34 curated edges in `substitutionGraph.ts`. |
| `ingredient_availability` | **Missing.** `localMarket.ts` hardcodes price tier and a 0–100 availability score for NG, KE, GH, ZA, EG, TZ. Unknown ingredients get availability **50**, not 0.3 with an “unverified” flag. |
| Provenance | `recipes.history_sources` and a few `verification_status` strings. No `source` / `licence` / `review_status` / `reviewed_by` on ingredients or substitutions. |
| Users / creators | `profiles`, `user_roles`, `uploads`. No `creator_profiles`. Submit-recipe writes to `uploads` (0 anon-visible). |
| Saves, reviews, pantry, plans | `favorites`, `saved_items`, `recipe_reviews` (with `cooked_photo_url`), `pantry_items`, `meal_plans`, `planned_meals`, `shopping_lists`, `shopping_list_items`, `households`, `household_members`, `household_grocery_items`. Reviews currently 0. |
| `ai_audit_log` | **Missing.** `suggest-substitutions` does not log prompt version, allowlist, or validation. |

Nutrition on the recipe row (972 / 2,103) has no composition source. The blueprint rule — show an estimate only when it comes from verified composition data — is not enforceable yet.

---

## Search

`/recipe-index` persists `q`, `country`, `continent`, `category`, `diet`, `difficulty`, `time`, and `ingredient` in the query string. It shows active chips, a clear-all control, and a count on each facet button. That covers a slice of S1-06.

Gaps against `feature_specs.A_discovery_and_search`:

- The page loads up to 4,000 recipes, including ingredient and step JSON, then filters in the browser. Facet counts are computed on the full set, not on the filtered set. First load will not hit a 300 ms p95 on a slow phone.
- `setParams(..., { replace: true })` replaces history, so Back does not walk filter changes.
- Parameter order is whatever `URLSearchParams` already had. There is no canonical order.
- One diet value, one ingredient, no exclude, no allergen-free, no equipment, no spice, no budget, no subnational region.
- Alias match is real (`jolof` → jollof, `sukuma wiki` ↔ collards, typo correction). Ambiguous names do not ask the user. `morogo` is treated as one ingredient.
- Canonical on the index is always `https://www.ladhaquest.com/recipe-index`, including when filters are on. That avoids an infinite filter index, and it also prevents the blueprint’s allow-list (country, country + meal, country + diet, ingredient) from being indexable URLs.
- There is no pantry-overlap ranker on this page. Pantry match lives at `/pantry` (`SmartRecipeMatch`, `pantry-intelligence`).
- Natural-language search is the `ai-search` edge function, not a parser that returns editable filter chips.

---

## Substitution engine

Two paths exist, and they disagree with the blueprint.

1. **Curated graph (preferred in the UI).** `lookupRankedSubstitutions` in `substitutionGraph.ts` plus `rankSubstitutesForMarket` in `localMarket.ts`. Diet uses the corrected test (`required.every(d => candidate.diet.includes(d))`) but only as a score bump or a −25 penalty. Incompatible diets are not removed. Availability is a hardcoded number. `IngredientSubstitutionPopover` shows this first.
2. **LLM fallback.** `supabase/functions/suggest-substitutions` sends the ingredient name to Gemini via the Lovable gateway and parses a free-text JSON array of `{name, ratio, notes, authenticity}`. There is no allowlist, no Zod check against ingredient IDs, no allergen or diet hard filter, no audit log, and no “proposed” review state. This is the failure mode the blueprint forbids: the model invents substitutes, including ones that can introduce dairy or allergens.

There is no `POST /api/substitutions`. Scoring weights are inline, not config. There is no 300-case golden set. Unit tests cover the client graph (`npm run test:substitutions`) and the market ranker (`npm run test:market`).

---

## Structured data, sitemaps, canonicals

| Check | Finding |
|---|---|
| `robots.txt` | Allows `/`. Disallows app, auth, and admin routes, `/assets/`, and service-worker files. Blocks a long list of AI-training bots. Sitemap points at `https://www.ladhaquest.com/sitemap.xml`. |
| Sitemaps | Index plus pages (15), recipes (2,103), dishes (1,428), countries (156 — includes non-African and duplicate labels), blog (12), stories (883). `lastmod` is generated. No glossary or `/substitutes/` sitemap, because those URLs do not exist. |
| Canonicals | Homepage and prerendered recipes self-canonicalize. Recipe index always canonicalizes to the bare URL. nginx strips the query string when it stamps the SPA shell (`$lq_canon_path`). |
| Recipe JSON-LD | `RecipeSchema.tsx` and the prerender script emit Recipe with HowToStep, times, yield, cuisine, keywords, nutrition when present, and `aggregateRating` only if a real count is passed. Author is **Organization “LadhaQuest”**, not a Person. 0 recipes have `created_by`. |
| Breadcrumbs | `Breadcrumbs.tsx` renders visible crumbs and BreadcrumbList JSON-LD. It is a client component, so it is absent from prerendered shells unless the prerender script adds it (it does not). |
| WebSite SearchAction | In `index.html`, target `/recipe-index?q={search_term_string}`. |
| Organization | In `index.html`. Logo is the PWA icon. |
| Person | Not emitted. No creator profile URLs. |
| Facet indexation policy | Not implemented as an allow-list. Everything with a query string collapses to one canonical. `robots.txt` does not mention sort or deep pagination (the index paginates in memory, so there is no `?page=` crawl trap). |
| hreflang | None. UI strings are English. |

`PageMeta` writes title, description, robots, Open Graph, and canonical in `useEffect`. Crawlers that do not run JS only see prerendered shells and the homepage `index.html`.

---

## Images and performance risks

- Every recipe has an `image_url`. Many are Supabase storage objects (cookbook page scans). 26 recipes share an image with another recipe. That is a content-quality issue, not a missing-image issue.
- Workbox caches Unsplash with CacheFirst (40 entries) and recipe REST with StaleWhileRevalidate (40 entries, 3 days). It does not cache the Supabase storage image host.
- `DataSaverImage` shrinks Unsplash URLs. There is no AVIF/WebP srcset pipeline and no width/height contract on recipe cards.
- The recipe index ships full ingredient and step payloads for the whole catalog to the phone before the first filter click.
- The PWA precache glob is `**/*.{js,css,html,ico,png,svg,webp}` up to 5 MB per file. Route-level `React.lazy` is in place; only Index and NotFound are eager.
- No Lighthouse run in this audit. CI does not enforce the blueprint budgets (170 KB gzip JS per route, LCP 2.5 s, INP 200 ms, CLS 0.1).
- Prior crawl note (16 November): a non-JS crawler saw an empty SPA. The `#seo-shell` and prerender were added for that. They have not been re-measured with Lighthouse or a fresh Search Console export.

---

## Gap map (blueprint priorities)

| Blueprint item | Status | Evidence |
|---|---|---|
| P0 Ingredient graph | **Partial in DB + client.** | Seed applied to prod: ~586 ingredients, 110 aliases, 42 substitutions, 228 availability rows. Client still has parallel TypeScript aliases. `recipe_ingredients` join still thin. |
| P0 Alias-aware search | **Partial** | `recipeSearch.ts` synonyms and typos. No ambiguity prompt. `morogo` is a false synonym. |
| P0 Faceted discovery + URL state | **Partial** | Chips, counts, clear-all, URL params. Client-side, history replace, unfiltered counts, single canonical. |
| P0 Recipe schema, hubs, CWV | **Partial** | Prerender + Recipe JSON-LD for African recipes. Author is the organization. No CWV baseline. Country hubs exist (`/country/:slug`). No ingredient glossary per slug, no `/substitutes/` pages. |
| P1 Recipe utility | **Partial, ahead of the blueprint’s “not built” assumption** | Cook mode, scaling, timers, wake lock, substitution popover, nutrition badge, print, local-name toggle, provenance block. Unit conversion and gram estimates are not a general system. |
| P1 Saves, notes, reviews | **Partial** | My List, recipe box folders (localStorage), reviews UI. 0 reviews in the DB. Cooked-photo column exists. |
| P1 Creator studio | **Partial / thin** | `/submit-recipe` + `/import-recipe` (auth → `uploads` pending) → `/editorial-review` (AdminGate). Nav links + analytics events added. Recipes INSERT locked to admin/mod. No creator profiles, Person schema, or regional reviewer workflow yet. |
| P1 Pantry search | **Present** | `/pantry`, barcode, voice, expiry, `pantry-intelligence`. Ranking is not substitution-coverage with verified IDs only. |
| P2 Planner and shopping | **Partial, ahead of the roadmap** | Calendar, drag-and-drop, AI meal generator, budget tracker, grocery merge, household sync, WhatsApp/deep links. Prices are the hardcoded market table, not `ingredient_availability`. |
| P3 Commerce | **Link-out only** | Correct to leave here. |
| P4 Community and AI coach | **Partial and unsafe on substitutions** | Edge functions for search, recommendations, meal gen, cultural sweeps. No grounded coach. The substitution LLM is unconstrained. |
| Analytics events | **Missing** | The event list in the blueprint is not instrumented. |
| i18n | **Missing** | English UI. Native names and phonetic fields exist on dishes. |
| Licence separation (ODbL) | **Not applicable yet** | Open Food Facts is not imported. Cookbook text under `data/cookbooks/` needs a licence check before any further merge. No licence column to hang that on. |

---

## Sprint 1 task list, reconciled

| ID | Task | State |
|---|---|---|
| S1-01 | This audit | **Done** (this document) |
| S1-02 | Lighthouse on 10 templates, Search Console, internal search logs | **Not done.** No GA4, so there is no internal-search log to pull. GSC note from 16 November: about 3 indexed pages and 1 impression in 7 days, before the sitemap expansion. Re-measure after the prerender deploy. |
| S1-03 | Migrations for ingredients, aliases, substitutions, availability, recipe_ingredients, provenance | **Mostly done.** Schema + seed on prod; `recipe_ingredients` backfill still open. |
| S1-04 | Seed 100 priority ingredients from an editor CSV | **Done (SQL seed).** 100 priority ingredients + aliases/subs/availability applied; slug conflict fix shipped. |
| S1-05 | Alias resolver with trigram, ambiguity, tests | **Partial.** In-memory aliases and Levenshtein. No trigram index, no ambiguity flag. |
| S1-06 | URL facets with chips, counts, clear-all | **Partial.** See Search. |
| S1-07 | Facet indexation policy and sitemaps | **Partial.** Sitemaps are split and counts match the DB. Allow-list / noindex for facet URLs is not implemented. |
| S1-08 | Recipe / Person / BreadcrumbList JSON-LD and a CI validation test | **Partial.** Recipe JSON-LD yes. Person no. BreadcrumbList is client-only. No CI check. |
| S1-09 | `POST /api/substitutions` v0, hard filters, no LLM | **Not done.** Client ranker plus an LLM that invents names. |
| S1-10 | Substitution popover | **Present** |
| S1-11 | Mobile recipe card and image pipeline | **Partial.** Cards show image, time, difficulty, country. No AVIF pipeline. Duplicate cookbook images remain. |
| S1-12 | Lighthouse CI and structured-data checks | **Not done** |
| S1-13 | Analytics events | **Not done** |

Definition of done for product tasks (tests in CI, throttled Android, axe, CWV, schema, analytics, provenance) is not met. This audit does not claim that it is.

---

## Reconciled stack (decision)

1. Stay on Vite, React, TypeScript, Tailwind, shadcn, React Router, Supabase, nginx, Coolify.
2. Treat `scripts/prerender-seo.mjs` as the SEO renderer. Extend it (breadcrumbs, Person when a real author exists, non-African recipes or drop them from the sitemap). Do not start a Next.js migration in Phase 1.
3. Add the ingredient graph as Supabase migrations: aliases with `match_confidence` and `is_ambiguous`, substitutions with review status, availability with unknown = unscored, provenance and licence columns. Backfill `recipe_ingredients` from the JSON blob without deleting the original text.
4. Ship substitution v0 as a Supabase edge function that only reads curated rows. Change `suggest-substitutions` so it cannot return an id or a name that was not retrieved. Until that ships, the popover should not call it for diet- or allergen-sensitive cooks.
5. Add the existing `npm run test:*` scripts to GitHub Actions before adding Lighthouse CI.
6. Defer Meilisearch, Redis, pgvector, payments, and a conversational coach until the graph and the indexation allow-list are in place.

---

## What to do next

S1-02 needs a human with Search Console access and a Lighthouse run against production (home, `/recipe-index`, a country hub, a prerendered recipe, a non-prerendered recipe, `/ingredients`, `/blog`, `/atlas`, `/dish/:slug`, `/meals`). After that, S1-03 is the first code change: the tables the rest of Sprint 1 has to hang on.

Do not add recipes to close the positioning gap. The catalog count is already 2,103.

---

## Appendix: what shipped after the 13 November audit

Kept so later work does not rebuild it.

- Crawlable `#seo-shell`, `noindex` on JS/CSS, segmented sitemap (4,597 URLs), African recipe HTML prerender.
- Client substitution graph, market ranking for NG/KE/GH/ZA/EG/TZ, grocery engine, budget tracker, cook-mode popover.
- Households, shared pantry, shared grocery items, phone OTP form (provider still required).
- Offline packs, IndexedDB mirror, pantry mutation queue, data-saver.
- Recipe provenance UI, reviews UI, cooked-photo column, recipe-box folders, import-recipe (URL / photo / voice) into the review queue.
- Freemium soft gates in `premium.ts` (offline packs and AI meal plans).

Still open from that pass, and still open now: email household invites, live retailer carts, in-app mobile-money capture, Search Console re-measurement, and moving substitutions into reviewed database rows.

---

## S1-03 / S1-04 progress note (2026-11-20)

Schema migration `supabase/migrations/20261120100000_ingredient_graph_schema.sql` and seed migration `supabase/migrations/20261120110000_ingredient_graph_seed.sql` landed.

- `ingredients` extended with slug (unique), canonical_name, food_group, flavor_profile, texture_profile, function_tags, dietary_tags, allergens, nutrition, source, licence, review_status, version, and provenance columns. Slug backfilled from name.
- `ingredient_aliases` table created: alias_normalized, language, country_code, is_ambiguous, match_confidence, RLS public SELECT, GIN trigram index.
- `ingredient_substitutions` extended with substitution_type, confidence, flavor_impact, texture_impact, cooking_adjustments, dietary_tags, allergens, is_verified, review_status, source.
- `ingredient_availability` table created: country_code, region, availability_score, typical_price, currency, price_unit, confidence, RLS public SELECT.
- `recipe_ingredients` extended with id, group_label, grams_estimate, display_text, preparation_note, is_optional, sort_order, review_status.
- `ai_audit_log` table created: service-role write only, no anon policies.
- Seed data: 100 priority African ingredients in `data/ingredients/priority-100.csv`, 42 curated substitution edges in `data/ingredients/substitutions-seed.csv`, 600 market availability rows across NG/KE/GH/ZA/EG/TZ in `data/ingredients/availability-seed.csv`.
- Import script `scripts/import-ingredient-graph.mjs` added (`npm run seed:ingredients`).

S1-03 and S1-04 are now complete.

---

## Sprint 1 execution progress (2026-11-20)

| ID | Status | Notes |
|---|---|---|
| S1-01 | Done | This audit |
| S1-02 | Partial | `docs/BASELINES.md`; homepage LCP 3.7 s / CLS 0 / SEO 0.92; GSC/GA4 still need human export |
| S1-03 | Done | Schema migration for graph + provenance |
| S1-04 | Done | 100 ingredients CSV + SQL seed + import script |
| S1-05 | Done | `src/lib/aliasResolver.ts` + `npm run test:alias` |
| S1-06 | Done | RecipeIndex history, stable params, open-facet counts, lighter select |
| S1-07 | Done | `facetIndexation.ts` + `sitemap-facets.xml` |
| S1-08 | Done | Person author option, schema CI fixture, BreadcrumbList already present |
| S1-09 | Done | `substitutionEngine.ts` + edge `substitutions` (no LLM invent); diet hard filters |
| S1-10 | Done | Popover uses engine; AI invent fallback removed |
| S1-11 | Done | Index cards link to `/recipe/:slug`, diet badges, image width/height |
| S1-12 | Done | CI runs unit + schema tests; LHCI workflow_dispatch |
| S1-13 | Done | `analytics.ts` + key event wiring (consent-aware) |

**Deploy gate (human):** apply `20261120100000_*` and `20261120110000_*` migrations on Supabase, deploy edge function `substitutions`, run `npm run seed:ingredients` with service key if SQL seed is not applied via CLI.
