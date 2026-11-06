# Full recipe pages, personal saved lists, and a cuisine map

Three connected additions: every dish entry gets its own shareable recipe page, visitors get an account with a saved list, and a map ties dishes to their country, region and cultural story.

## 1. Full recipe page per dish

- New page at `/recipe/<dish-name>` showing: hero photo with credit, at-a-glance panel (servings, prep and cook time, difficulty, calories and macros), full ingredient list with checkboxes and the serving scaler, numbered steps, tips / storage notes, safety notes, cultural history with its sources, and related dishes from the same country.
- Reuses the existing cooking view, ingredient checklist, nutrition badge, notes and print button, so the page is consistent with what already exists.
- Each dish encyclopedia entry gets a clear "View full recipe" button linking to it; recipe cards across the site (recipes list, gallery, country pages, trending, map) link to the page instead of only opening a pop-up. The pop-up cooking mode stays available from the page.
- Search-friendly: recipe structured data, unique title and description, breadcrumbs.

## 2. Accounts and saved lists

- Sign up / sign in already exists; this adds one place to save and revisit things.
- A heart button on dishes, recipes and country pages saves any of the three to the visitor's list. Signed-out visitors get a prompt to sign in.
- New "My list" page, reachable from the top menu when signed in, with three tabs: Dishes, Recipes, Countries. Each entry links back to its page and can be removed.
- Saved data is private to each account.

## 3. Visual map of African cuisine

- New page at `/cuisine-map`: a map of Africa split into its five regions. Choosing a region shows its countries with dish counts; choosing a country lists its dishes with native name, region and a short cultural note, each linking to its dish page.
- Region and country selections are reflected in the address bar, so a view can be shared or bookmarked.
- Countries with few entries are visibly marked so gaps are obvious.
- Linked from the main menu and from the home page map section.

## Technical notes

- New table `saved_items` (`user_id`, `item_type` in recipe/dish/country, `item_id` uuid nullable, `item_slug` text, `label`), unique per user and item, RLS scoped to `auth.uid()`, explicit grants to `authenticated` and `service_role`. Existing `favorites` rows are read as saved recipes; no destructive change to them.
- New `useSavedItems` hook plus a `SaveButton` component used by dish, recipe, country and map views.
- New pages: `src/pages/RecipeDetail.tsx`, `src/pages/MyList.tsx`, `src/pages/CuisineMap.tsx`; routes added lazily in `App.tsx`.
- Map data comes from aggregate queries over `dishes` / `recipes` grouped by country and region — no new content seeding.
- Sitemap and navigation updated for the new routes.
