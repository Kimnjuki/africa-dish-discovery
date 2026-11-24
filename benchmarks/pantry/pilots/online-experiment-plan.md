# Controlled online experiment plan

## Gate (do not launch until clean)

```bash
npm run pilot:cooking:status
```

Require: `ready_for_online_ab: true` (≤0 safety, ≤0 unpatched false-ready, ≥20 households logged).

## Design

- **Experiment ID:** `pantry_cookability_v1` (`src/lib/pantryExperiment.ts`)
- **Unit of randomization:** household (fallback: user id when no household)
- **Control:** deterministic JSON cookability matcher only (`findMatchingRecipes`)
- **Treatment:** graph-first hybrid then JSON fallback (current production path)
- **Assignment:** stable FNV hash; persisted in `localStorage` key `ladhaquest_pantry_experiment_v1`
- **Kill switch:** `VITE_PANTRY_EXPERIMENT=0` forces treatment path for everyone (experiment off)

## Primary outcome

Confirmed pantry-to-meal success per exposed household (`pantry_cook_confirmed` after cook completion without unplanned shop).

## Secondary

- Recipe selection / cook-mode start / completion / repeat use
- Ready rate among top-5 (`can_cook_now` on `pantry_match`)

## Guardrails

| Event | Meaning |
|-------|---------|
| `pantry_false_ready_report` | User said Ready but could not cook |
| `pantry_safety_report` | Allergy / unsafe recommendation |
| latency / cost / complaints | Ops dashboards |

## Sample size (planning aid)

```ts
import { estimateSampleSizePerArm } from "@/lib/pantryExperiment";
estimateSampleSizePerArm({ baselineRate: 0.25, mde: 0.05 }); // ~record in ticket
```

Do **not** pick an arbitrary N. Recompute with exact tests before launch and paste into the experiment ticket.

## Instrumentation (shipped)

- `pantry_experiment_exposure` — assignment
- `pantry_match` — includes `experiment_variant`, `can_cook_now`
- `pantry_cook_confirmed`
- `pantry_false_ready_report`
- `pantry_safety_report`

## Reporting

Publish offline report version + online lift with confidence intervals. Never replace offline cookability metrics with click metrics alone.
