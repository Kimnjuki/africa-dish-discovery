# LadhaQuest pantry cookability benchmark

Evaluates whether pantry matching recommends dishes a household can **genuinely cook**—not whether ingredient *names* look similar.

## Modes

| Mode | Relevant labels |
|------|-----------------|
| `cook_now` | 3 (fully cookable) and 2 (reviewed substitution + adjustments) |
| `shop_first` | 3, 2, and 1 (useful shop-first with correct missing disclosure) |

Label **0** is never relevant. Safety / constraint failures are scored separately and never “averaged away.”

## Stages instrumented

1. Input understanding  
2. Ingredient resolution (exact / alias ≠ category ≠ substitute)  
3. Inventory (quantity, freshness, uncertainty)  
4. Recipe retrieval  
5. Substitution quality  
6. Constraints (allergy, diet, equipment, time, servings)  
7. Ranking  
8. Explanation consistency  

## Layout

```
benchmarks/pantry/
  cases/           development.jsonl | validation.jsonl | heldout.jsonl | safety.jsonl
  judgments/       recipe_relevance.jsonl | ingredient_resolution.jsonl
  snapshots/       catalog + ingredient graph freeze metadata
  runners/         overlap | quantity_aware | graph_offline | production
  metrics/         ranking | cookability | resolution | missing | constraints
  reports/         generated JSON reports (null metrics until measured)
  pilots/          cooking-pilot protocol + online experiment plan
```

## Run

```bash
npm run bench:pantry:freeze          # snapshot versions from live DB
npm run bench:pantry:cases           # regenerate development/validation/safety/heldout
npm run bench:pantry:heldout:grow    # grow held-out toward 200 (or -- --target 500)
npm run bench:pantry:adjudicate:seed # bootstrap dual reviewers from pilot labels
npm run bench:pantry:adjudicate      # merge A/B → disagreements + adjudicated
npm run test:pantry-cookability      # unit gates for false-ready killers
npm run test:unit-conversion         # cups↔g conversion graph
npm run bench:pantry                 # offline eval (includes heldout)
npm run bench:pantry:report          # print latest report summary
npm run pilot:cooking:status         # 20–30 household pilot gate
```

## Dual-reviewer adjudication

See `judgments/ADJUDICATION.md`. Freeze held-out reporting only when `adjudicated: true` and `reviewers >= 2`.

## Held-out growth

Track progress in `cases/HELDOUT_GROWTH.md` (200 dual-review batch → 500 scale freeze).

## Unit conversion

Production: `src/lib/unitConversion.ts` (wired into `recipeMatching`).  
Offline runners: `metrics/unitConversion.mjs` (used by `quantityOk`).

## Cooking pilot → online A/B

1. Run 20–30 household pilot (`pilots/cooking-pilot-protocol.md`).
2. When `pilot:cooking:status` is clean, enable online A/B (`pilots/online-experiment-plan.md`).

## Production improvements wired to the product

- **Ready** = zero essential missing (+ quantity check when both sides known)
- Allergy / equipment / time hard filters (`src/lib/pantryConstraints.ts`)
- Cook now vs Shop first UI modes on pantry matches
- LLM cannot promote a local non-ready dish to Ready
- Weak token matches blocked (`oil` ≠ `palm oil`, paprika ≠ pap)
- Prep-state guard (flour ≠ whole grain; fresh ≠ stockfish)

## Launch gates (provisional)

| Metric | Gate |
|--------|------|
| Critical safety | 0 observed critical failures |
| False-ready rate | < 2% on held-out (report CI) |
| Essential missing-ingredient recall | ≥ 98% |
| Precision@5 (cook_now, ≥5 qualifiers) | ≥ 80% |
| Ingredient resolution | ≥ 95% overall + per-language |
| NDCG@5 | beat strongest deterministic baseline |
| LLM factual consistency | no invented pantry facts / substitute IDs |

Do not seed dashboards with plausible metrics—leave null until measured.
