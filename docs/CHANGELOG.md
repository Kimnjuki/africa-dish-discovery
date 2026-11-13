# Changelog

## 2026-11-14

### Added
- F08 provenance / Recipe JSON-LD / ratings depth: stronger schema.org `Recipe` on detail pages (nutrition, cuisine, keywords, image, `aggregateRating` only when real reviews exist); `RecipeProvenance` block (country/region, also-known-as, ethnic group, occasions, history teaser, suggest-a-correction → Contact); recipe detail “I made this” reviews with honest empty state (no fake ratings).
- Nullable columns `recipes.local_names` (text[]) + `recipes.ethnic_group` with soft backfill from linked dishes (`supabase/migrations/20261114030000_f08_recipe_provenance_columns.sql`).
- Contact form prefills `subject` / `message` query params for correction deep links.
- F09 offline / low-data chunk: `offlineStore` snapshots for pantry + last meal plan + capped saved recipes; offline pantry edit queue with reconnect flush; data-saver toggle (lighter images, no cultural video CTA); `/offline-recipes` hub; leaner Workbox recipe detail cache.
- Acceptance: `npm run test:offline`.
- F10 household sharing MVP: `households` + `household_members` (owner/member), invite-code create/join, share-pantry toggle, RLS so co-members can read shared pantry; UI at `/household` + pantry household strip.
- Migration `supabase/migrations/20261114020000_f10_household_sharing.sql` (RPCs: `create_household`, `join_household_by_code`, `leave_household`, `regenerate_household_invite_code`).
- F06 substitution graph bootstrap (`src/lib/substitutionGraph.ts`): Africa-first aliases + directed swaps with flavor/region notes (ugwu↔spinach/kale, sukuma wiki↔collard/kale, egusi↔pumpkin seeds, palm oil alternatives, scotch bonnet↔habanero, and more).
- Cook popover + pantry substitution modal resolve the local graph before DB/AI; pantry recipe matching uses the same graph.
- SQL seed migration `supabase/migrations/20261114010000_f06_substitution_graph_seed.sql` for `ingredients` + `ingredient_substitutions`.
- Acceptance script: `npm run test:substitutions` (`scripts/test-substitution-graph.ts`).
- Typo-tolerant / synonym-aware recipe search (`src/lib/recipeSearch.ts`): African dish aliases (e.g. jolof→jollof, nsima/sadza→ugali), light Levenshtein correction, ingredient alias expansion, and relevance ranking.
- Recipe Index (`/recipe-index`) uses expanded matching + “showing results for …” suggestion; ingredient facet uses aliases.
- Advanced Search passes `search_terms` to `ai-search`; edge fallback filters with synonym terms; client re-ranks when AI is off.
- Acceptance script: `node --experimental-strip-types scripts/test-recipe-search.ts`.

## 2026-11-13

### Fixed
- Homepage **Try Pantry Intelligence** now scrolls to `#pantry-intelligence` (same-page hash no longer a no-op via React Router `Link`).
- Homepage mood category cards no longer shake on mobile (no scale/float; fixed height; touch-safe hover).

### Added
- Grocery list engine (`src/lib/groceryEngine.ts`) with unit-aware merge, aisle grouping, manual edits, and copy/share text.
- Meal planner shopping tabs use `GroceryListPanel` instead of naive quantity concatenation.
