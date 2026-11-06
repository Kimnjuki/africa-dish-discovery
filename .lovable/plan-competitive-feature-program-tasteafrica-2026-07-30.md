# Competitive feature program — TasteAfrica

A benchmarked checklist now lives at `docs/COMPETITIVE_FEATURE_CHECKLIST.md`, derived from research on TasteAtlas, The Foreign Fork, Immaculate Bites (African Bites), Swahili Food by Vanessa, and Drizzle and Dip.

## What each competitor does better today

- **Immaculate Bites** — the deepest recipe page in African food: sticky recipe card, jump links, process photos per step, tips/storage/freezer blocks, substitution tables, reader Q&A separate from ratings.
- **The Foreign Fork** — a *journey* framing: interactive world map, "every country we've cooked" progress, and a heavily faceted recipe index (country / region / ingredient).
- **TasteAtlas** — encyclopedia + rankings: a dish entry separate from any recipe, ingredient and drink atlases, ranked "best of" lists, and annual user-voted awards. This is the moat a recipe blog cannot copy.
- **Swahili Food by Vanessa** — creator voice, street-food and travel guides, short vertical video attached to every dish.
- **Drizzle and Dip** — editorial photography discipline and seasonal collections.

## Build plan

### Phase 1 — Recipe page depth
Upgrade the recipe view to the Immaculate Bites standard: sticky recipe card (yield, times, difficulty, nutrition), Jump to Recipe / Video anchors, checkable ingredients with a serving scaler that rewrites quantities, metric/US toggle, Tips · Make-Ahead · Storage · Freezer blocks, equipment list, cook mode (large-text stepper, screen awake), print layout.

### Phase 2 — Discovery: faceted index + country guides
One faceted recipe index (country, region, meal type, ingredient, diet, time, difficulty) with URL-synced filters. Upgrade country hubs into full guides: cuisine intro, staple pantry, meal structure, festive dishes, map inset, breadcrumbs with JSON-LD.

### Phase 3 — Atlas layer (the differentiator)
Dish encyclopedia entries distinct from recipes (native name, pronunciation, region, where to eat, related-dish graph), ingredient and drink atlas pages, ranked lists ("Top 50 African Dishes"), and user-voted **TasteAfrica Awards**.

### Phase 4 — Authority and video
Author profiles with credentials, short-form vertical video per recipe, street-food/market guides, seasonal collections, "I made this" photo reviews.

### Phase 5 — Retention and monetisation
Collections/cookbooks with public share URLs, a country "passport" of dishes cooked, recently viewed, then ad-slot and affiliate polish.

## Technical notes

- Recipe-card, cook mode, and scaler work is presentational and reuses existing `NutritionBadge`, `EnhancedRecipePreparation`, and `IngredientSubstitutionPopover`.
- Faceting reads from existing `recipes` / `dishes` columns; new fields (`popularity_score`, `authenticity_score`, `where_to_eat`, `video_url`, `author_id`) need a migration in Phase 3/4.
- Ranked lists and awards need `dish_votes` plus `curated_lists` tables with RLS and explicit grants.
- Structured data to add: HowTo, VideoObject, ItemList, BreadcrumbList, Person.
- Every photo gets a visible licence/attribution line, extending the existing image-authenticity work.

## Scope check

Phases are independent and reviewable. I recommend starting with Phase 1, since it lifts every one of the ~1,500 existing recipes at once.
