# Sprint 1 Baselines (S1-02)

**Recorded:** 2026-11-20  
**Author:** Automated audit (S1-01 / S1-02)  
**Live site:** https://www.ladhaquest.com

---

## Catalog counts (as of 2026-11-20)

| Metric | Count |
|---|---:|
| Total recipes | **2,103** |
| African recipes (`continent = Africa`) | **1,477** |
| Prerendered recipe shells | **1,477** (African subset) |
| Non-prerendered recipe URLs in sitemap | **626** (fall through to SPA shell) |
| Dishes | 1,428 |
| Ingredients | 542 |

---

## Search Console / GA4

GSC and GA4 are not yet wired (S1-13 analytics helper ships in this sprint; GTM container
and Measurement ID must be added to `index.html` by a human before data flows).

**Baselines pending human export from Search Console:**

| Metric | Baseline | Date |
|---|---|---|
| Total indexed pages | — | — |
| Total impressions (28 d) | — | — |
| Total clicks (28 d) | — | — |
| Average position | — | — |
| Core Web Vitals (GSC) | — | — |

> Prior note (2026-11-16 crawl): ~3 indexed pages, 1 impression in first 7 days before the
> sitemap expansion. Re-measure after the prerender + sitemap deploy lands on `main`.

---

## Lighthouse

Mobile lab runs against production on **2026-11-20** (Lighthouse 12.8.2, headless Chrome).
CI stays `workflow_dispatch` only (`.github/workflows/lighthouse.yml`) so main CI does not need Chrome.

### How to run Lighthouse manually

```bash
npx lighthouse https://www.ladhaquest.com/ --only-categories=performance,seo,accessibility --form-factor=mobile
npm run test:lighthouse
```

### Results table (lab, single run)

| Template | URL | Performance | Accessibility | SEO | LCP | TBT | CLS |
|---|---|---|---|---|---|---|---|
| Homepage | / | **0.81** | **0.87** | **0.92** | **3.5–3.7 s** | **100–130 ms** | **0** |
| Recipe Index | /recipe-index | — | — | **0.92** | — | — | — |
| Country hub | /country/nigeria | — | — | — | — | — | — |
| Recipe (prerendered) | /recipe/<slug> | — | — | — | — | — | — |
| Blog | /blog | — | — | — | — | — | — |

Note: category score aggregation flaked on multi-category CLI flags in this environment; SEO-only and raw audits (LCP/TBT/CLS) are reliable. LCP is above the 2.5 s budget — treat as the Sprint 1 performance baseline to beat.

> **Target thresholds** (enforce in a later sprint per blueprint):  
> Performance ≥ 0.70 · LCP ≤ 2.5 s · INP ≤ 200 ms · CLS ≤ 0.1 · JS per route ≤ 170 KB gzip

---

## Analytics event coverage (S1-13)

| Event | Wired | Location |
|---|---|---|
| `recipe_viewed` | ✓ | `RecipeDetail.tsx` |
| `search_performed` | ✓ | `RecipeIndex.tsx` |
| `search_zero_result` | ✓ | `RecipeIndex.tsx` |
| `filter_applied` | ✓ | `RecipeIndex.tsx` |
| `substitution_requested` | ✓ | `IngredientSubstitutionPopover.tsx` |
| `cook_mode_started` | ✓ | `CookMode.tsx` |
| `recipe_saved` | pending | — |
| `cook_mode_completed` | pending | — |
| `plan_created` | pending | — |
| `shopping_list_exported` | pending | — |
| `creator_submission_started` | pending | — |
| `creator_submission_published` | pending | — |
| `affiliate_click` | pending | — |
| `substitution_feedback` | pending | — |
