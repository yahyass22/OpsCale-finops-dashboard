# Demo Runbook

## Goal

Deliver a concise 7-10 minute demo that makes the project look like a presales asset, not a hobby app.

## Setup

Start the app:

```powershell
streamlit run app.py --server.port 8502
```

Open:

```text
http://localhost:8502
```

Recommended preset:

```text
Storage-heavy archive
```

This preset makes the hybrid conversation clearer because storage-heavy workloads are easier to explain as local evaluation candidates.

## Demo Flow

### 1. Business Setup: 45 Seconds

Say:

```text
The business problem is cloud cost pressure. Customers do not just ask whether cloud is expensive. They ask where each workload should live. This tool helps structure that conversation with a TCO model and a hybrid placement recommendation.
```

### 2. Show Inputs: 60 Seconds

Open the sidebar.

Show:

- Cloud cost categories.
- Local infrastructure categories.
- Projection window.

Say:

```text
I kept the model assumption-driven. A presales user can enter known monthly cloud spend, local subscription assumptions, growth, discount, and migration costs. The point is to make the assumptions visible.
```

### 3. Show Overview: 2 Minutes

Point to:

- Public cloud TCO.
- Local infrastructure TCO.
- Net savings.
- Break-even.

Say:

```text
This gives the executive view. The key metric is not only savings. Break-even matters because migration cost can make a lower monthly run-rate unattractive if payback is too late.
```

Then show charts:

- Cumulative TCO.
- Monthly run-rate delta.
- Cumulative cost advantage.
- Cost composition.

### 4. Show Recommendation: 2 Minutes

Open:

```text
Recommendation
```

Say:

```text
I separated this from the overview so it reads as guidance, not just a metric. The recommender is conservative and transparent. It does not pretend to know exact workload percentages. It gives a credible next step: cloud-first, hybrid, repatriation candidate, or validate assumptions.
```

Point to:

- Recommendation label.
- Confidence.
- Why this result.
- What to do first.

### 5. Show Assumptions: 60 Seconds

Open:

```text
Assumptions
```

Say:

```text
This tab is important for trust. A customer or account team can challenge every input behind the model.
```

### 6. Show Export: 30 Seconds

Click:

```text
Download CSV
```

Say:

```text
The output can be handed to finance or used for follow-up analysis.
```

### 7. Close: 45 Seconds

Say:

```text
The purpose of the project is to show how I approach presales: understand the customer's business pressure, quantify the impact, explain the architecture tradeoffs, and recommend a practical next action.
```

## What Not To Do

- Do not explain every code file in the demo.
- Do not oversell the recommender as artificial intelligence.
- Do not claim this is a Dell product.
- Do not frame repatriation as always better than cloud.

## Strong Closing Line

```text
This project shows the bridge I want to bring to the role: technical architecture, business value, and customer-facing clarity.
```

