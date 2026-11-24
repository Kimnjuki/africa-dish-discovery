# LadhaQuest product audit checklist (30-day)

Use with a real web account and (when available) the installed PWA. Mark Pass / Fail / Partial. Capture screenshots and ingredient IDs for failures.

**Companion files:** `output/ladhaquest_implementation_audit.json`, `output/ladhaquest_codebase_verification.json`

## A. Discovery and recipe completeness

| # | Test | Pass? | Notes |
|---|---|---|---|
| A1 | Search `sukuma wiki`, `ugwu`, `egusi`, `jollof` — relevant hits | | |
| A2 | Typo `jolof` still finds jollof | | |
| A3 | Zero-result query returns empty state (not crash) | | |
| A4 | Country / diet / time / difficulty facets update URL + results | | |
| A5 | Recipe page shows ingredients, steps, times, image | | |
| A6 | Recipe JSON-LD present in view-source / prerender for African recipe | | |
| A7 | Nutrition badge only when calories/nutrition present | | |
| A8 | Allergen / diet tags visible when set | | |
| A9 | Provenance / verification block when sources exist | | |
| A10 | Local-name toggle shows country-relevant aliases | | |

## B. Substitutions (50 high-frequency ingredients)

For each ingredient: open popover, record candidates, confidence, warnings, diet filter behavior.

Priority set: ugwu, sukuma wiki, egusi, palm oil, scotch bonnet, groundnut, crayfish, stockfish, bitterleaf, morogo, molokhia, cassava, plantain, teff, fonio, millet, sorghum, suya spice, uziza, iru/dawadawa, palm wine, coconut milk, evaporated milk (vegan filter), smoked fish, dried shrimp, garden egg, okra, tomato paste, onions, garlic, ginger, cayenne, piri piri, goat, tilapia, mackerel, black-eyed peas, pigeon peas, maize meal, fufu flour, gari, yam, cocoyam, water leaves, utazi, alligator pepper, grains of paradise, baobab, hibiscus/zobo, peanut butter/groundnut paste.

| # | Test | Pass? | Notes |
|---|---|---|---|
| B1 | Curated candidates appear for known graph ingredients | | |
| B2 | No invented/hallucinated ingredient names | | |
| B3 | Vegan diet hard-filters dairy substitutes | | |
| B4 | Peanut allergy removes groundnut family | | |
| B5 | Confidence + verified labels visible | | |
| B6 | Cooking adjustment / warning text present when relevant | | |
| B7 | Market preference changes ranking or availability notes | | |
| B8 | Accept / reject (or “this worked”) feedback can be recorded | | |
| B9 | Empty state when no verified substitute (no LLM invent) | | |

## C. Meal planning and grocery

| # | Test | Pass? | Notes |
|---|---|---|---|
| C1 | Create weekly plan with household size | | |
| C2 | AI meal plan respects diet tags | | |
| C3 | Budget tracker constrains or flags overspend | | |
| C4 | Grocery list consolidates duplicate ingredients | | |
| C5 | Unit / quantity aggregation looks correct | | |
| C6 | Pantry exclusion removes owned items from list | | |
| C7 | Meal swap / portion scale updates list | | |
| C8 | Export / share list works | | |
| C9 | Active plan usable offline after visit | | |

## D. Pantry and privacy

| # | Test | Pass? | Notes |
|---|---|---|---|
| D1 | Manual add maps to known ingredient | | |
| D2 | Barcode / photo path requires confirmation before save | | |
| D3 | Expiry notifications fire for near-dated items | | |
| D4 | Smart match suggests recipes from pantry | | |
| D5 | “Use it up” prioritizes expiring items | | |
| D6 | Delete pantry / export personal data available | | |

## E. Offline cook mode

| # | Test | Pass? | Notes |
|---|---|---|---|
| E1 | Save recipe for offline | | |
| E2 | Airplane mode: open saved recipe + cook mode | | |
| E3 | Offline pack download shows size estimate | | |
| E4 | Images degrade gracefully on data-saver | | |
| E5 | Sync resumes when connectivity returns | | |

## F. Household and creator

| # | Test | Pass? | Notes |
|---|---|---|---|
| F1 | Invite / join household | | |
| F2 | Shared grocery list updates for both members | | |
| F3 | Submit recipe draft → editorial states | | |
| F4 | Creator profile public URL + attribution on recipe | | |
| F5 | Moderation reject / needs_revision path works | | |

## G. Commerce (current = link-out)

| # | Test | Pass? | Notes |
|---|---|---|---|
| G1 | Jumia / Glovo / WhatsApp deep links open with list context | | |
| G2 | Affiliate disclosure visible where links appear | | |
| G3 | No false claim of in-app checkout | | |

## H. Analytics smoke

| # | Test | Pass? | Notes |
|---|---|---|---|
| H1 | With analytics consent, `search_performed` / `recipe_viewed` fire | | |
| H2 | `substitution_requested` fires on popover open | | |
| H3 | `plan_created` / `shopping_list_exported` fire | | |
| H4 | `substitution_feedback` fires after accept/reject (once wired) | | |

## Sign-off

| Field | Value |
|---|---|
| Tester | |
| Date | |
| Web build / commit | |
| Mobile / PWA | |
| Blockers | |
| KPI snapshot | completeness / zero-result / sub acceptance |
