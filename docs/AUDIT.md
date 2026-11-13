# LadhaQuest Phase 0 Audit

**Date:** 2026-11-13  
**Repo:** `africa-dish-discovery-main`  
**Live site:** https://www.ladhaquest.com  
**Strategy source:** `ladhaquest_product_strategy.json` (no pre-existing `feature_gap_matrix` / `phase_0_audit` keys — matrix derived from MVP/growth F01–F17)

---

## Stack detected (A1)

| Layer | Technology | Evidence |
|-------|------------|----------|
| Frontend | **Vite 5 + React 18 + TypeScript** | `package.json`, `vite.config.ts` — **not Next.js** |
| Routing | React Router DOM v6 | `src/App.tsx` |
| UI | Tailwind CSS + shadcn/Radix | `src/components/ui/*`, `tailwind.config.ts` |
| Data / Auth | **Supabase** (Postgres + Auth + Storage + Edge Functions) | `src/integrations/supabase/client.ts`, `supabase/` |
| Client state | TanStack React Query | `App.tsx` |
| PWA | `vite-plugin-pwa` + Workbox | `vite.config.ts`, `/install`, `/offline-recipes` |
| Drag-and-drop | `@dnd-kit/*` | `MealPlannerCalendar.tsx` |
| Barcode | `@zxing/library` | `BarcodeScanner` |
| Hosting signals | Cloudflare-managed `robots.txt` on live | Live fetch |

**Architecture note:** Strategy JSON proposes Next.js/Nest/Meilisearch. Live product is a SPA + Supabase BaaS. Adapt all Phase 1+ work to Vite/React/Supabase.

---

## A1 — Inventory

### Public / app routes (`src/App.tsx`)

| Path | Page | Auth |
|------|------|------|
| `/` | Index (hero, trending, pantry promo, regions) | Public |
| `/continents`, `/countries`, `/country/:countrySlug` | Geography browse | Public |
| `/atlas`, `/cuisine-map`, `/dish/:dishSlug`, `/story/:dishSlug` | Dish encyclopedia / cultural story | Public |
| `/recipes`, `/recipe-index`, `/recipe/:slug` | Discovery + detail | Public |
| `/meals`, `/ingredients` | Meal / ingredient browse | Public |
| `/blog`, `/blog/:slug` | Blog | Public |
| `/auth` | Email/password + Google OAuth | Public |
| `/meal-planner`, `/meal-planner-calendar` | Meal planning | RequireAuth |
| `/pantry`, `/my-list`, `/household`, `/recipe-comparison` | Pantry, saves, household, compare | RequireAuth |
| `/submit-recipe` | Creator upload → `uploads` | RequireAuth |
| `/shared-meal-plan/:shareToken` | Shared plan view | Public token |
| `/offline-recipes`, `/install` | Offline cache / PWA install | Public |
| `/about`, `/contact`, `/privacy-policy`, `/terms-of-service` | Static/legal | Public |
| `/recipe-uploader`, `/recipe-gallery`, `/image-verification`, `/image-scraper`, `/admin/dish-qa` | Admin tooling | AdminGate |
| `/editorial-review` | Moderation of user uploads | Public route (role-gated in page) |

### Key components (product surface)

- Discovery: `AdvancedSearch`, `FeaturedRecipes`, `WorldMapRecipes`, continent maps, `QuickCategoryCards`
- Recipe UX: `RecipeDetail`, `EnhancedRecipePreparation`, `CookMode`, `RecipeCardPanel`, `RecipeNotes`, `RecipeReviews`, `IngredientSubstitutionPopover`, `NutritionBadge`, `PrintRecipeButton`
- Planning / shop: `MealPlanner`, `MealPlannerCalendar`, `AIMealGenerator`, `BudgetTracker`, `MealPlanShare`, `SmartShoppingList`
- Pantry: `PantryDashboard`, `SmartRecipeMatch`, `BarcodeScanner`, `VoiceInput`, `PantryAnalytics`, `ExpirationNotifications`
- SEO: `PageMeta`, `RecipeSchema`, `Breadcrumbs`, `BlogSchema`
- PWA: `OfflineIndicator`, `usePWA`

### Data models (Supabase `public` tables — from `types.ts`)

**Core content:** `recipes`, `dishes`, `ingredients`, `recipe_ingredients`, `ingredient_substitutions`, `regions`, `cultural_stories`, `media_assets`, `pronunciation_guides`, `recipe_translations`, `trends`, `discover_filters`

**User / social:** `profiles`, `user_roles`, `favorites`, `saved_items`, `recipe_reviews`, `user_recipe_interactions`, `user_taste_profiles`, `personalized_recommendations`, `badges`, `user_badges`, `user_challenges`, `user_passport_stamps`

**Planning / commerce scaffolding:** `meal_plans`, `planned_meals`, `meal_plan_templates`, `pantry_items`, `shopping_lists`, `shopping_list_items`, `affiliate_suppliers`, `venues`, `venue_offerings`

**Publishing:** `uploads`, `blog_posts`, `newsletter_subscribers`, `contact_submissions`

**Views:** `recipe_ratings_summary`, `discover_africa`, leaderboards

### APIs / Edge Functions (`supabase/functions/`)

| Function | Role |
|----------|------|
| `ai-search` | AI-enhanced recipe search |
| `ai-recommendations` | Personalized recommendations |
| `ai-meal-generator` | Weekly plan generation |
| `pantry-intelligence` | Pantry ↔ recipe matching |
| `suggest-substitutions` | Substitution suggestions |
| `identify-ingredients` | Ingredient ID (image/scan path) |
| `pantry-expiry-email` | Expiry notifications |
| `authenticity-sweep`, `cultural-context-sweep`, `citation-backfill` | Content QA / enrichment |

Client access pattern: `@supabase/supabase-js` REST + `functions.invoke` (no separate Nest/FastAPI).

### Third-party scripts / outbound integrations

| Integration | Status |
|-------------|--------|
| Supabase Auth (email + Google OAuth) | Present |
| Outbound grocery search (Google Shopping, Amazon, Jumia) | Link-out only in `SmartShoppingList` |
| Cloudflare (live robots / CDN) | Present on live |
| Client analytics (GA/GTM/PostHog/Sentry) | **Not found** in `src/` or `index.html` |
| Cookie consent UI | Present (`CookieConsent`) — analytics toggles without wired SDK |

---

## A2 — Feature gap matrix (F01–F17)

Statuses: **present** | **partial** | **missing** | **unknown** — based on **code + anon Supabase reads**, not marketing copy.

| ID | Feature | Priority | Status | Evidence summary | Gaps vs strategy detail |
|----|---------|----------|--------|------------------|-------------------------|
| F01 | Recipe discovery | P0 | **partial** | `/recipes`, `/recipe-index`, `AdvancedSearch` (country, difficulty, time, dietary, ingredients + AI search), maps, categories, homepage trending/seasonal; **`recipeSearch` synonym/typo expansion** (jolof→jollof, ugali aliases) on index + AI-search fallback | No Meilisearch; no first-class budget/skill/kid-friendly/one-pot/low-cost filters; feeds are UI tabs more than ranked personalization |
| F02 | Structured recipe pages | P0 | **partial** | `/recipe/:slug` + encyclopedia; ingredients/steps JSON; prep/cook/servings/difficulty; macros; allergens; cook mode; timers; serving scale; photos; notes | No video player; no recipe version history; equipment not a first-class structured field; offline is localStorage list not full page cache |
| F03 | Save and organize | P0 | **partial** | `favorites`, `saved_items` → `/my-list`; `RecipeNotes` | No cookbooks/folders; limited meal-history UX; collection sharing weak |
| F04 | Meal planner | P0 | **partial** | `/meal-planner`, `/meal-planner-calendar` with `@dnd-kit`; planned meal servings; AI generator; share link | No household entity/size prefs; dietary prefs not a durable household profile |
| F05 | Smart grocery list | P0 | **partial** | `shopping_list_items`; pantry + recipe add; **`groceryEngine` + `GroceryListPanel`** on meal planners (unit merge, aisle groups, copy/share, manual edit); store/affiliate fields; Jumia/Amazon links | Persisted shared lists / household sync still missing; aisle heuristics are keyword-based not DB-backed |
| F06 | Local substitution engine | P0 | **partial** | `substitutionGraph` client seed (aliases + flavor/region notes); wired into popover, pantry modal, `recipeMatching`; SQL seed migration for `ingredient_substitutions`; AI fallback retained | Country/price/diet ranking not productized; DB seed applies only after migration deploy; graph is curated bootstrap not full market graph |
| F07 | Creator publishing | P1 | **partial** | `/submit-recipe` → `uploads`; `/editorial-review`; admin uploader | No creator profiles/analytics/payouts; limited moderation workflow |
| F08 | Community proof | P1 | **partial** | Detail-page `RecipeReviews` (“I made this”), honest empty state, `recipe_ratings_summary` → JSON-LD `aggregateRating` only when count &gt; 0; `RecipeProvenance` + correction deep-link | Still few real reviews; no cooked-photo uploads or Q&A threads |
| F09 | Offline / low-data | P0 | **partial** | PWA + Workbox (detail cache capped); `/offline-recipes` hub; localStorage snapshots for pantry + last meal plan + opened recipes; pantry mutation queue + reconnect flush; data-saver toggle | No IndexedDB; no full Background Sync API; meal-plan edits still online-only; grocery list snapshot not yet cached |
| F10 | Accounts & household sharing | P0 | **partial** | Email/password + Google OAuth; profiles; meal-plan share token; **`households` + `household_members`** (invite code, share-pantry RLS); `/household` create/join/members | **No phone auth**; **no email invites**; no shared shopping-list write-sync; one household per user MVP |
| F11 | Pantry-aware recommendations | P1 | **present** | `/pantry`, `SmartRecipeMatch`, `pantry-intelligence`, barcode + voice add | Waste/expiry UX exists; depth of ranking can improve |
| F12 | Budget meal planner | P1 | **partial** | `BudgetTracker`, AI meal gen `budgetPerDay` | Hardcoded/demo budgets; no live local prices or promo optimization |
| F13 | Grocery integrations | P1 | **partial** | Link-outs + `affiliate_suppliers` table | No partner APIs, cart push, pickup/delivery checkout |
| F14 | AI cooking assistant | P1 | **partial** | Edge AI search/recs/meal gen/subs; cook-mode voice commands; unit helpers | No conversational troubleshoot chat |
| F15 | Voice & multilingual UX | P1 | **partial** | Pantry voice input; cook voice; phonetic fields; `recipe_translations` / `pronunciation_guides` tables | No i18n UI; tables largely unused in UX; no productized read-aloud |
| F16 | Live cooking & classes | P2 | **missing** | No livestream/class routes or components found | Entire feature absent |
| F17 | Restaurant / packaged discovery | P2 | **partial** | `venues` / `venue_offerings` + DishEncyclopedia venue UI | Anon venues count empty/`*/0`; not a working discovery product |

### P0 rollup

| Already meaningfully present | Partial / incomplete | Missing |
|------------------------------|----------------------|---------|
| Core discovery browse, structured recipe pages with cook mode, meal planner calendar, pantry matching (F11), auth email/Google; F06 client substitution graph bootstrap; F10 household create/join + shared pantry read | F01–F06, F09–F10 (most P0) | Phone auth, email household invites, shared grocery write-sync, price/diet-ranked subs, live market inventory |

---

## A3 — Performance

**Skipped: Lighthouse / axe / WebPageTest** — tooling not run (heavy / environment); prefer code evidence.

Code-based notes:

- Route-level `React.lazy` + `Suspense` for most pages (`App.tsx`) — good code-splitting.
- Eager load only `Index` + `NotFound`.
- PWA caches static assets + Supabase recipes REST (`StaleWhileRevalidate`, max 40 entries) + navigateFallback.
- App snapshots (pantry/meal plan/opened recipes) live in localStorage via `offlineStore`, not SW precache.
- Image cache for Unsplash only — many recipe images may miss SW optimization; data-saver shrinks Unsplash URLs.
- Client-injected meta/JSON-LD (`PageMeta`, `RecipeSchema`) means crawlers that do not execute JS see mainly `index.html` defaults — SPA SEO risk.
- Homepage live content shows non-African “Featured African Recipes” soup titles — content quality / curation issue impacting perceived performance of discovery.

---

## A4 — SEO check

| Check | Live / code | Finding |
|-------|-------------|---------|
| `robots.txt` | Live | Allow `/` for Googlebot/Bing; AI training bots disallowed (Cloudflare); Sitemap lines present |
| `sitemap.xml` | Live + `public/` | Static hub URLs (~17) |
| `sitemap-recipes.xml` | Live | **3136** `<loc>` recipe URLs (larger than DB recipe count 2103 — possible duplicates/legacy slugs) |
| Canonical | `index.html` + `PageMeta` | Homepage canonical set; per-route via client JS |
| Open Graph / Twitter | `index.html` + `PageMeta` | Present; default OG image is `placeholder.svg` (weak social preview) |
| Recipe JSON-LD | `RecipeSchema.tsx` + `/recipe/:slug` | Stronger `Recipe` (nutrition, cuisine, keywords, image, real `aggregateRating`); still client-injected SPA |
| WebSite JSON-LD | `index.html` | Present; SearchAction → `/recipe-index?q=` |
| Copy drift | Live + `index.html` | Meta still says “50+ recipes” while product claims 1,700+ / DB has 2103 |

---

## A5 — Coverage

See **[docs/COVERAGE.md](./COVERAGE.md)** — anon Supabase query of `recipes` (2103 rows), grouped by `country` / `continent`.

Highlights: **1477** Africa-continent recipes; **54/54** named African countries have ≥1 recipe; Egypt (200) and Nigeria (112) dominate; heavy **Global (303)** non-African import load.

---

## A6 — Mobile / accessibility (code patterns)

**Strengths**

- Viewport + PWA meta; cook mode designed for phone (large type, swipe, Wake Lock).
- Frequent `aria-label` on icon buttons (servings, cook mode, share, voice).
- Breadcrumb `nav aria-label`; some `sr-only` close labels in shadcn primitives.
- Portrait PWA orientation; Install guidance page.

**Gaps / risks**

- No automated a11y run (axe skipped).
- No `prefers-reduced-motion` policy found.
- Map-heavy pages may be weak for keyboard/screen-reader users.
- Auth is email/Google only — phone-first African mobile UX incomplete (ties to F10).
- Cookie banner + overlays need manual focus-trap verification.

---

## Competitive gap summary

| Competitor pattern | LadhaQuest today |
|--------------------|------------------|
| Allrecipes community ratings/reviews at scale | Schema + UI exist; **~1 review** in DB |
| NYT cooking mode / recipe box | Cook mode **strong**; organization **weak** (no cookbooks) |
| Mealime planning → grocery | Planner **strong**; grocery merge/aisles/commerce **weak** |
| Paprika import/scale/offline | Serving scale + partial offline; **no URL import** product |
| SuperCook pantry match | **Strong** differentiator already (F11 present) |
| Africa-local subs / market pricing | **Core differentiator incomplete** (F06/F12/F13 partial) |

---

## Recommended next implementation prompt

After F08 provenance + Recipe JSON-LD + ratings depth, prefer one of:

> Wire phone auth or email household invites (F10 remaining) so multi-cook households can share pantry without invite-code-only friction.

Alternates: offline grocery-list snapshot / IndexedDB (F09 remaining); dish-page JSON-LD + ItemList for atlas rankings; cooked-photo “I made this” uploads (F08 depth).

Do **not** start with Next.js migration or F16/F17.

---

## Progress

**2026-11-14 — Phase 1 F08 provenance / JSON-LD / ratings (chunk 6)**

- `RecipeSchema`: nutrition, cuisine, keywords, image, `suitableForDiet`; `aggregateRating` only when real reviews exist.
- `RecipeProvenance` on recipe detail: country/region, also-known-as, ethnic group, occasions, history teaser, suggest-a-correction → Contact prefill.
- Recipe detail hosts reviews + “I made this” CTA; empty state does not invent ratings.
- Migration `20261114030000_f08_recipe_provenance_columns.sql`: nullable `local_names` + `ethnic_group` (+ soft dish backfill).
- Remaining: cooked-photo uploads, Q&A, dish/atlas ItemList JSON-LD, SSR/prerender for crawlers.

**2026-11-14 — Phase 1 F09 offline / low-data (chunk 5)**

- `src/lib/offlineStore.ts`: capped recipe cache, pantry + meal-plan snapshots, pantry op queue, data-saver preference.
- Pantry loads/edits offline via snapshot + queue; `OfflinePantrySyncHost` flushes on reconnect.
- Meal planner pages cache last plan for offline open; `/offline-recipes` shows pantry/plan/recipes + data-saver.
- Data-saver: lighter Unsplash URLs, `DataSaverImage`, cultural video CTA hidden; Install page toggle.
- Workbox: navigateFallback; recipe runtime cache narrowed (max 40 detail entries); no full catalog precache.
- Remaining: IndexedDB, Background Sync registration, offline grocery-list snapshot, meal-plan write queue.

**2026-11-14 — Phase 1 F10 household sharing MVP (chunk 4)**

- Schema: `households`, `household_members` (owner/member), invite codes, `share_pantry`; SECURITY DEFINER RPCs for create/join/leave/regenerate.
- RLS: members see own household + roster; co-members can SELECT pantry when sharing on; co-member profile read for display names.
- UI: `/household` (create/join by code, members, share toggle, shared pantry list); nav Account → Household; pantry tab household strip.
- Remaining: email invites, phone auth, shared shopping-list sync, multi-household, collaborative meal plans.

**2026-11-14 — Phase 1 F06 substitution graph bootstrap (chunk 3)**

- Added `src/lib/substitutionGraph.ts`: curated African ingredient aliases + substitution edges with flavor role, region tags, authenticity, and compatibility scores (ugwu, sukuma wiki, egusi, palm oil, scotch bonnet, ogbono, crayfish, irú, etc.).
- Wired into `IngredientSubstitutionPopover` (graph → DB → AI), pantry `SubstitutionModal` (graph → AI), and `recipeMatching` pantry substitute detection.
- Expanded search ingredient aliases (`ugwu`, `sukuma wiki`, `morogo`, `molokhia`, `piri piri`, `ogbono`).
- SQL seed: `supabase/migrations/20261114010000_f06_substitution_graph_seed.sql`.
- Acceptance: `npm run test:substitutions` — 23/23 pass.

**2026-11-14 — Phase 1 F01 search synonyms / typo tolerance (chunk 2)**

- Added `src/lib/recipeSearch.ts`: African dish alias groups, ingredient aliases, Levenshtein typo correction, word-boundary-safe matching, relevance scoring.
- Wired into `/recipe-index` (facet search + “showing results for …” suggestion) and `AdvancedSearch` (`search_terms` to edge function + local re-rank when AI off).
- Updated `supabase/functions/ai-search` fallback to match any expanded term (not raw `includes` on full query).
- Acceptance: `scripts/test-recipe-search.ts` — 17/17 pass (`jolof`→jollof, `ugalii`→ugali, `nshima`/`sadza`, no `pap`/`paprika` false positive).

**2026-11-13 — Homepage fixes + Phase 1 F05 grocery engine (chunk 1)**

- Fixed homepage “Try Pantry Intelligence” (`PantryShowcase`): React Router `Link` to `/#pantry-intelligence` did not scroll when already on `/`. Now uses explicit scroll with fixed-nav offset + hash sync; Index also handles deep-link hash on load.
- Stabilized “What are you in the mood for?” cards (`QuickCategoryCards` + `index.css`): removed Card/hover-scale transforms on touch; fixed height; fine-pointer-only hover shadow; hard `transform: none` for `.category-mood-card` on phones.
- Phase 1 / F05: added `src/lib/groceryEngine.ts` (normalize + unit convert/merge + aisle groups + share text) and `GroceryListPanel` wired into `/meal-planner` and `/meal-planner-calendar` shopping tabs (replaces naive name-key quantity concatenation).

## Skipped work

| Item | Reason |
|------|--------|
| Lighthouse | Tooling heavy; not required for Phase 0 |
| axe / full a11y audit | Same |
| Service-role / `.env` secrets | Intentionally unused; anon key only |
| Full F05 share persistence / aisle DB | Deferred — client merge + copy/share shipped first |
| Meilisearch / dedicated search service | Deferred — client + edge synonym/typo layer shipped first |
| Full F06 country/price/diet ranking | Deferred — curated graph + UI wiring shipped; ranking/productization next |
| Household email invites / shared grocery write-sync (F10 remaining) | After F10 schema+code join MVP |
| Phone auth (F10) | Deferred — email/Google + household code invite first |
| F05 aisle DB / persisted shared lists | Still open after client grocery engine |
| IndexedDB + Background Sync API (F09 remaining) | Deferred — localStorage snapshots + pantry queue shipped first |
| Offline grocery-list / meal-plan write queue | Deferred — read snapshots + pantry queue first |

---

## Deliverable paths

- `docs/AUDIT.md` (this file)
- `docs/COVERAGE.md`
- `docs/ladhaquest_product_strategy.json` (strategy copy + filled `feature_gap_matrix`)
