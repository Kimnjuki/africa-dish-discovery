# Changelog

## 2026-11-14

### Added
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
