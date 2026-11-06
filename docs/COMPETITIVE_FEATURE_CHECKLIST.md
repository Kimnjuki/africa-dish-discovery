# TasteAfrica — Competitive Feature Checklist

Benchmarked against: **TasteAtlas** (world food atlas, rankings/awards), **The Foreign Fork** (country-by-country cooking journey, interactive map, recipe index facets), **Immaculate Bites / African Bites** (best-in-class African recipe cards, video, substitutions, reader Q&A), **Swahili Food by Vanessa** (creator voice, street-food & travel guides, short-form video), **Drizzle and Dip** (editorial food photography, seasonal collections).

Legend: `[ ]` to do · `[~]` partial in platform · `[x]` done

---

## 1. Recipe page depth (Immaculate Bites standard)
- [x] Sticky recipe card: yield, prep/cook/total time, difficulty, nutrition (NutritionBadge exists — needs sticky card wrapper)
- [x] "Jump to Recipe" / Steps / Tips anchors (video slot pending) at top of every recipe
- [x] Ingredient checkboxes + serving scaler that rewrites quantities inline
- [ ] Step-by-step process photos (numbered, one per key step)
- [x] Tips & Tricks / Make-Ahead / Storage & Reheating / Freezer notes blocks
- [~] Ingredient substitutions (AI popover exists — surface as static "swap table" too)
- [x] Equipment list with affiliate links
- [x] Cook mode (screen-awake, large-text stepper)
- [x] Print-optimised layout
- [x] Metric ⇄ US customary unit toggle
- [ ] Reader Q&A thread separate from star ratings
- [ ] "I made this" photo uploads in reviews

## 2. World-atlas layer (TasteAtlas standard)
- [~] Interactive map discovery (continent maps exist — unify into one atlas view)
- [x] Dish encyclopedia at /dish/:slug — native name, pronunciation, region, where to eat, related dishes
- [ ] Ingredient & drink atlas pages (yam, teff, palm oil, rooibos, palm wine…)
- [x] Ranked lists at /atlas — Top 50 African Dishes, Best Stews & Soups, 100 Foods to Try
- [ ] Annual **TasteAfrica Awards** driven by logged-in user votes
- [~] "Where to eat" panel on dish pages (venue data still being sourced)
- [~] Authenticity + popularity blended ranking score powering atlas lists
- [~] Related dishes by country on every dish page

## 3. Country journey (The Foreign Fork standard)
- [x] Country hub pages upgraded to full guides
- [x] Per-country guide: flag, cuisine intro, staple pantry, meal structure, festive dishes
- [x] "Every country we've cooked" progress tracker (54/54 African)
- [x] Region → country → dish breadcrumb + JSON-LD BreadcrumbList
- [x] Faceted recipe index at /recipe-index (URL-synced facets)
- [ ] Country passport: users mark dishes cooked and collect stamps

## 4. Creator & content authority (Swahili Food / Drizzle and Dip)
- [ ] Author profiles with credentials, photo, bio (E-E-A-T requirement)
- [ ] Short-form vertical video slot per recipe (Reels/TikTok embed)
- [ ] Street-food & market guides ("Best places to eat in Mombasa" format)
- [ ] Seasonal & occasion collections (Ramadan, Christmas, Braai season, weeknight)
- [ ] Editorial photography standard: hero, overhead, process, plated
- [~] Newsletter capture with lead magnet (signup exists — add downloadable e-book)
- [ ] Reader-favourite / most-cooked badges

## 5. Discovery & personalisation (our differentiator)
- [~] Smart pantry → recipe matching with % match
- [~] AI meal planner + shopping list
- [ ] "Cook from what's expiring" queue
- [ ] Save-to-collections (cookbooks) with public share URLs
- [ ] Recently viewed + continue cooking
- [ ] Global search with typo tolerance, ingredient exclusion, and dish-vs-recipe tabs

## 6. Trust, SEO & performance
- [x] Recipe JSON-LD schema
- [ ] JSON-LD: HowTo, VideoObject, ItemList (for ranked lists), Breadcrumb, Person (author)
- [ ] Per-dish authenticity provenance ("verified by", sources cited)
- [ ] Image licence/attribution line on every photo
- [ ] Core Web Vitals pass: responsive srcset, lazy-load, LCP hero preload
- [~] Legal pages + CMP for AdSense
- [ ] Sitemap segmentation (recipes, dishes, countries, blog) + hreflang if i18n ships

## 7. Monetisation
- [~] Premium tier gating (banner exists — complete paywall surfaces)
- [ ] In-content ad slots that respect recipe-card readability
- [ ] Affiliate modules: ingredients, equipment, African grocery boxes
- [ ] Printable/downloadable recipe packs for subscribers

---

## Implementation order (recommended)
1. **Recipe page depth** — highest conversion + SEO impact per unit of work.
2. **Faceted recipe index + country guides** — unlocks long-tail traffic.
3. **Atlas layer** (dish encyclopedia, ranked lists, awards) — the moat vs. recipe blogs.
4. **Creator authority & video** — E-E-A-T and social loop.
5. **Collections/passport personalisation** — retention.
6. **Monetisation polish** — after traffic quality is proven.
