# Dual-reviewer adjudication protocol

Held-out pantry judgments require **two independent reviewers** before freeze.

## Labels (0–3)

| Label | Meaning |
|-------|---------|
| 3 | Cookable now |
| 2 | Cookable with reviewed substitution + adjustments |
| 1 | Useful shop-first (missing disclosed) |
| 0 | Not suitable |

Safety failures are recorded separately in `critical_safety_ids` and never “averaged away.”

## Process

1. Reviewer A labels candidates **blind** to algorithm source.
2. Reviewer B labels the same pool independently.
3. Run `npm run bench:pantry:adjudicate`.
4. Agreements → `final_relevance` automatically.
5. Disagreements → adjudicator (third editor or discussion) sets `final_relevance` and `adjudication_notes`.
6. Held-out freeze only when `adjudicated: true` and `reviewers >= 2` for every judgment row used in reporting.

## File layout

```
judgments/
  recipe_relevance.jsonl          # current merged / pilot labels
  reviewer_a.jsonl                # independent A
  reviewer_b.jsonl                # independent B
  disagreements.jsonl             # generated for adjudication queue
  recipe_relevance.adjudicated.jsonl  # release artifact
```

## Blindness rules

- Do not show which matcher produced a candidate.
- Pool candidates from all systems + editor-added qualifiers.
- Mark unreviewed candidates as **unjudged**, not irrelevant.

## Commands

```bash
npm run bench:pantry:adjudicate:seed   # bootstrap A/B from pilot labels (dev only)
npm run bench:pantry:adjudicate        # write disagreements + adjudicated artifact
```

Inspect `adjudication_report.json` — `freeze_ready` is true only when disagreements = 0.
Human adjudicators resolve `disagreements.jsonl` then re-run until freeze_ready.
