# Demo Script

## Audience

This script is for a presales, portfolio, or interview demo. The target viewer is someone who understands cloud cost pressure but may not care about implementation details.

## Demo Goal

Show that the project is not just a software dashboard. It connects technical infrastructure decisions to financial outcomes.

## 1. Open With The Business Problem

Say:

```text
Companies often start in public cloud for speed, but steady workloads can become expensive over time. This dashboard compares the 3-year cost of staying in cloud against moving predictable workloads to local infrastructure.
```

Show:

```text
Overview tab
```

## 2. Explain The Inputs

Open the sidebar.

Say:

```text
The model separates public cloud costs and local infrastructure costs. It includes recurring monthly costs, growth assumptions, cloud discounts, and one-time migration or installation cost.
```

Show:

- Cloud section.
- Local section.
- Projection window.

Do not spend too long on every field. The point is transparency.

## 3. Use A Preset

Pick a preset:

```text
Storage-heavy archive
```

Click:

```text
Apply preset
```

Say:

```text
This scenario represents a large and growing storage footprint. It is a common repatriation candidate because storage and backup can become expensive at scale.
```

## 4. Read The Executive Numbers

Point to:

- Public cloud TCO.
- Local infrastructure TCO.
- Net savings.
- Break-even.

Say:

```text
The headline numbers give the finance view: total cost, savings, and payback timing.
```

## 5. Use The Charts

Show:

- Cumulative TCO over time.
- Monthly run-rate delta.
- Cumulative cost advantage.
- Monthly cost composition.

Say:

```text
The charts show whether the local option is cheaper immediately, cheaper later, or never catches up. That matters because migration cost can make a lower monthly run-rate unattractive if payback is too late.
```

## 6. Show The Recommendation Tab

Open:

```text
Recommendation
```

Say:

```text
The recommendation does not pretend to know the exact migration plan. It translates the cost model into a practical placement suggestion: cloud-first, repatriation candidate, hybrid candidate, or validate assumptions.
```

Point to:

- Label.
- Confidence.
- Why this result.
- What to do first.

## 7. Show Assumptions

Open:

```text
Assumptions
```

Say:

```text
Every recommendation is only as good as the assumptions. This tab makes the line items visible so the customer or stakeholder can challenge the model.
```

## 8. Show CSV Export

Click:

```text
Download CSV
```

Say:

```text
The monthly projection can be exported for finance review or follow-up analysis.
```

## 9. Close With The Value

Say:

```text
The value of this project is not only calculating cloud versus local cost. It shows how a presales engineer can frame infrastructure choices financially, explain assumptions, and recommend a practical hybrid strategy.
```

## Strong Demo Notes

- Keep the discussion at business-decision level.
- Do not oversell the recommender as an AI system.
- Emphasize transparent assumptions.
- Emphasize that this is a planning estimate.
- Explain that direct AWS/OCI import is a future feature, not required for the current MVP.

