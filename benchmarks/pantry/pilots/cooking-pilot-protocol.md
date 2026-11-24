# Cooking pilot protocol (qualitative discovery)

Offline metrics filter systems; this pilot checks whether households can **actually cook** recommendations.

## Scope

- **Households:** 20–30 consented participants across KE / NG / GH / ZA / diaspora.
- **Not** a population-impact claim — discovery only.
- Do **not** claim reduced food waste from clicks/saves alone.

## Procedure (per household)

1. Enter actual pantry (text first; optional photo/barcode as separate arms).
2. Request **cook now** mode.
3. Select one recommended dish.
4. Confirm quantities + missing list accuracy before shopping.
5. Cook when practical.
6. Log outcomes in `pilots/cooking-pilot-log.jsonl`.

## Metrics to capture

| Field | Meaning |
|-------|---------|
| `meal_success_no_unplanned_shop` | boolean |
| `time_to_suitable_dish_sec` | number |
| `pantry_corrections` | count of edits before match felt right |
| `substitution_worked` | yes / no / n/a |
| `servings_sufficient` | yes / no |
| `would_use_again` | 1–5 |
| `false_ready_reported` | boolean |
| `safety_incident` | boolean + notes |

## Logging tooling

```bash
npm run pilot:cooking:seed     # optional sample row
npm run pilot:cooking:log -- --file path/to/row.json
npm run pilot:cooking:status   # households, gates, ready_for_online_ab
```

Append-only log: `pilots/cooking-pilot-log.jsonl` (schema in `cooking-pilot-log.schema.json`).  
Roster: `pilots/household-roster.json` (target 20–30).

## Gate to expand

Proceed to controlled online experiment only after:

- Zero critical safety incidents in pilot
- False-ready reports investigated and patched
- Qualitative usability issues triaged
- `npm run pilot:cooking:status` reports `ready_for_online_ab: true`
