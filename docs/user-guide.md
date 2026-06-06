# User Guide

## Purpose

The TCO Repatriation Dashboard helps compare two infrastructure options:

- Continue running the workload in public cloud.
- Move some or all predictable workload cost to local infrastructure.

The app also provides a hybrid strategy recommendation based on the current cost comparison.

## Start The App

```powershell
streamlit run app.py --server.port 8502
```

Open:

```text
http://localhost:8502
```

## Sidebar Inputs

The sidebar is the configuration area.

### Scenario

| Field | Meaning |
| --- | --- |
| Preset | Loads a sample scenario |
| Apply preset | Copies preset values into the input fields |
| Scenario name | Name shown in the report and CSV filename |
| Projection window | Projection length from 12 to 60 months |

### Cloud

| Field | Meaning |
| --- | --- |
| Compute | Monthly VM, container, serverless, or instance spend |
| Storage | Monthly object, block, file, snapshot, or archive storage spend |
| Database | Monthly managed database spend |
| Network | Monthly egress, VPN, inter-region, or connectivity spend |
| Backup | Monthly backup, snapshot, replication, or recovery spend |
| Support | Monthly cloud support or managed service spend |
| Annual growth % | Expected annual growth in public cloud usage or cost |
| Discount % | Existing cloud discount, such as committed-use or savings plan discount |

### Local

| Field | Meaning |
| --- | --- |
| Infrastructure subscription | Monthly local infrastructure subscription |
| Software licenses | Monthly hypervisor, OS, database, backup, or monitoring licenses |
| Support contract | Monthly vendor support and maintenance |
| Power and cooling | Monthly facility power and cooling cost |
| Rack or datacenter | Monthly rack, colocation, datacenter, or connectivity cost |
| Admin labor | Monthly operations labor cost |
| Backup and DR | Monthly local backup and disaster recovery cost |
| Annual local cost growth % | Expected annual growth in local operating costs |
| One-time migration | One-time migration, services, engineering, and cutover cost |
| One-time installation | One-time setup or implementation cost |

## Main Tabs

### Overview

The overview tab shows:

- Public cloud TCO.
- Local infrastructure TCO.
- Net savings.
- Break-even month.
- Executive summary.
- Cost and delta charts.

Use this tab to understand the headline economics.

### Recommendation

The recommendation tab turns the current cost comparison into a placement suggestion.

Possible outputs:

- Repatriation candidate.
- Hybrid candidate.
- Cloud-first candidate.
- Validate assumptions.

The recommendation is based only on the values already entered in the sidebar.

### Assumptions

The assumptions tab shows the line items behind the calculation. Use this tab to validate that the cost model is using the values you intended.

### Monthly Detail

The monthly detail tab shows the projection table. It includes:

- Cloud monthly cost.
- Local monthly cost.
- Cloud cumulative cost.
- Local cumulative cost.
- Cumulative delta.

### Report Notes

The report notes tab summarizes the result and includes the placement recommendation. Use this as a simple presales talking point.

## CSV Export

Use `Download CSV` to export the monthly projection.

The CSV includes:

- Month.
- Cloud monthly cost.
- Local monthly cost.
- Cloud cumulative cost.
- Local cumulative cost.
- Cumulative delta.

## Interpretation Rules

Positive savings means local infrastructure is cheaper over the selected projection window.

Negative savings means local infrastructure is more expensive over the selected projection window.

Break-even is the first month where cumulative local infrastructure cost is less than or equal to cumulative public cloud cost.

## Important Limitations

- The app is a planning estimate, not a procurement quote.
- The app does not import real cloud billing data.
- The app does not know workload architecture, latency requirements, compliance requirements, or operational maturity.
- The recommendation is rule-based and should be validated with billing records and vendor quotes.

