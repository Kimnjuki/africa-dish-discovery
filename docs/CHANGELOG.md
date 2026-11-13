# Changelog

## 2026-11-14

### Added
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
