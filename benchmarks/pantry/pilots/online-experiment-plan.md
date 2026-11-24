# Controlled online experiment plan

## Design

- **Unit of randomization:** household (shared users see one variant).
- **Control:** best deterministic matcher (quantity-aware + strict cookability).
- **Treatment:** hybrid retrieval + rules + ranking (production stack under test).
- **Primary outcome:** confirmed pantry-to-meal success per exposed household.
- **Secondary:** recipe selection, cook-mode start, completion, repeat use.
- **Guardrails:** safety reports, false-ready reports, latency, cost, complaints.

## Sample size

Do not pick an arbitrary N. Estimate from current conversion rate and minimum detectable effect (MDE) worth shipping. Record the power calculation in the experiment ticket before launch.

## Instrumentation

Events already available / extend:

- `pantry_match`
- `affiliate_click` (commerce guardrail only)
- New: `pantry_cook_confirmed`, `pantry_false_ready_report`, `pantry_safety_report`

## Reporting

Publish offline report version + online lift with confidence intervals. Never replace offline cookability metrics with click metrics alone.
