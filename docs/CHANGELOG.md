# Changelog

## 2026-11-13

### Fixed
- Homepage **Try Pantry Intelligence** now scrolls to `#pantry-intelligence` (same-page hash no longer a no-op via React Router `Link`).
- Homepage mood category cards no longer shake on mobile (no scale/float; fixed height; touch-safe hover).

### Added
- Grocery list engine (`src/lib/groceryEngine.ts`) with unit-aware merge, aisle grouping, manual edits, and copy/share text.
- Meal planner shopping tabs use `GroceryListPanel` instead of naive quantity concatenation.
