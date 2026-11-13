# LadhaQuest Recipe Coverage

**Queried:** 2026-11-13  
**Source:** Supabase REST anon API (`recipes` table)  
**Project:** `qfctezxqcomhrasrsvjg`  
**Method:** Paginated `GET /rest/v1/recipes?select=country,continent` (page size 1000), grouped client-side.

No service-role or `.env` secrets used.

## Totals

| Metric | Count |
|--------|------:|
| Recipes | **2103** |
| Dishes (table) | **1428** |
| Unique `country` labels | **156** (includes codes, fusion labels, duplicates like USA/US) |
| Ingredients (table) | **542** |
| Recipe reviews (anon) | **1** |
| Ingredient substitutions (anon visible) | **0** / blocked |
| Venues (anon visible) | **0** / blocked |
| Live `sitemap-recipes.xml` URLs | **3136** |

### By continent (`recipes.continent`)

| Continent | Recipes |
|-----------|--------:|
| Africa | **1477** |
| Global | 313 |
| Asia | 123 |
| Europe | 90 |
| North America | 70 |
| South America | 21 |
| Oceania | 8 |
| Central America | 1 |

## African countries (54/54 with ≥1 recipe)

Continent filter `Africa` = 1477. Named countries below sum to 1477 when using the labels present in data.

| Country | Recipes |
|---------|--------:|
| Egypt | 200 |
| Nigeria | 112 |
| Uganda | 56 |
| Morocco | 56 |
| South Africa | 54 |
| Kenya | 54 |
| Ghana | 52 |
| Algeria | 40 |
| Senegal | 37 |
| Ethiopia | 32 |
| Zambia | 31 |
| Zimbabwe | 30 |
| Tanzania | 28 |
| Mozambique | 26 |
| Malawi | 25 |
| Democratic Republic of the Congo | 21 |
| Angola | 21 |
| Cameroon | 21 |
| Madagascar | 21 |
| Botswana | 20 |
| Ivory Coast | 20 |
| Tunisia | 20 |
| Somalia | 19 |
| Burkina Faso | 19 |
| South Sudan | 18 |
| Mali | 17 |
| Rwanda | 17 |
| Namibia | 17 |
| Liberia | 16 |
| Gambia | 16 |
| Guinea | 16 |
| Cape Verde | 16 |
| Eswatini | 16 |
| Sudan | 16 |
| Eritrea | 15 |
| Mauritius | 15 |
| Chad | 15 |
| Sierra Leone | 15 |
| Seychelles | 15 |
| Benin | 15 |
| Libya | 15 |
| Guinea-Bissau | 15 |
| Djibouti | 15 |
| Burundi | 15 |
| Niger | 15 |
| Central African Republic | 15 |
| Gabon | 15 |
| Comoros | 15 |
| Lesotho | 15 |
| Togo | 15 |
| Equatorial Guinea | 15 |
| Republic of the Congo | 14 |
| Mauritania | 14 |
| Sao Tome and Principe | 14 |

## Non-African / other top labels

| Label | Recipes |
|-------|--------:|
| Global | 303 |
| USA | 18 |
| India | 18 |
| US | 13 |
| Greece | 13 |
| Japan | 13 |
| Italy | 12 |
| IT | 12 |
| United States | 11 |
| Mexico | 9 |
| Thailand | 9 |
| France | 8 |
| … | (see full list in audit export) |

## Coverage notes

1. **Breadth strong, depth uneven:** Egypt + Nigeria alone are ~21% of African recipes; many countries sit at 14–20 (seeded floor).
2. **Label hygiene:** Duplicate geo codes (`US`/`USA`/`United States`, `IT`/`Italy`, fusion strings) inflate unique-country count and hurt filters/SEO.
3. **Sitemap > DB:** 3136 sitemap recipe URLs vs 2103 recipe rows — investigate stale/duplicate slugs.
4. **Homepage marketing** claims “1,700+ Recipes” / “54 Countries” — roughly consistent with Africa-heavy corpus; `index.html` still says “50+” in places.
5. **Differentiation risk:** Large Global/soup/viral imports dilute Africa-first positioning on the live homepage featured strips.

## Related

- Full Phase 0 write-up: [AUDIT.md](./AUDIT.md)
