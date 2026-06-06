# Cost Model and Estimate

## Purpose

This document defines the cost model for the TCO Repatriation Dashboard. The calculator should be assumption-driven, not quote-driven. It helps users compare scenarios and understand what assumptions change the decision.

## User Inputs

### Public Cloud Inputs

| Input | Description |
| --- | --- |
| Compute monthly cost | VM, container, serverless, or instance spend |
| Storage monthly cost | Block, object, archive, and snapshots |
| Database monthly cost | Managed database spend if separated |
| Network monthly cost | Egress, inter-region, VPN, or connectivity |
| Backup monthly cost | Backup service, snapshots, replication |
| Support monthly cost | Cloud support plan or managed services |
| Annual growth rate | Expected growth in usage or spend |
| Cloud discount percent | Savings plan, committed-use, or negotiated discount |

### Local Infrastructure Inputs

| Input | Description |
| --- | --- |
| Infrastructure subscription | Monthly local hardware or managed infrastructure subscription |
| Software licenses | Hypervisor, backup, monitoring, database, or OS licensing |
| Support contract | Vendor support and maintenance |
| Power and cooling | Estimated facility cost |
| Rack or datacenter | Colocation, rack, space, cross-connects |
| Admin labor | Monthly operations labor cost |
| Backup and DR | Local backup, replication, or disaster recovery |
| Migration cost | One-time migration, services, and cutover effort |
| Installation cost | One-time implementation services |

## Calculation Method

Projection horizon:

```text
36 months
```

Public cloud base monthly cost:

```text
cloud_base =
  compute
  + storage
  + database
  + network
  + backup
  + support
```

Public cloud discounted monthly cost:

```text
cloud_after_discount =
  cloud_base * (1 - cloud_discount_percent)
```

Public cloud projected monthly cost:

```text
cloud_month_n =
  cloud_after_discount * (1 + annual_growth_rate) ^ (n / 12)
```

Local base monthly cost:

```text
local_base =
  infrastructure_subscription
  + software_licenses
  + support_contract
  + power_and_cooling
  + rack_or_datacenter
  + admin_labor
  + backup_and_dr
```

Local projected monthly cost:

```text
local_month_n =
  local_base * (1 + local_cost_growth_rate) ^ (n / 12)
```

Three-year totals:

```text
cloud_tco_36 = sum(cloud_month_1 through cloud_month_36)

local_tco_36 =
  migration_cost
  + installation_cost
  + sum(local_month_1 through local_month_36)
```

Savings:

```text
savings = cloud_tco_36 - local_tco_36
savings_percent = savings / cloud_tco_36
```

Break-even:

```text
first month where cumulative_local <= cumulative_cloud
```

## Example Scenario

These are sample values for testing only.

| Input | Value |
| --- | ---: |
| Cloud compute | 12,000 per month |
| Cloud storage | 4,000 per month |
| Cloud database | 2,500 per month |
| Cloud network | 1,000 per month |
| Cloud support | 1,500 per month |
| Cloud annual growth | 12 percent |
| Cloud discount | 0 percent |
| Local infrastructure subscription | 10,000 per month |
| Local software and support | 2,500 per month |
| Local power, cooling, rack | 1,500 per month |
| Local admin labor | 3,000 per month |
| Backup and DR | 1,000 per month |
| Migration and installation | 40,000 one time |

Expected interpretation:

- The cloud path starts lower if migration cost is high.
- The local path can become cheaper if monthly cloud growth is strong.
- Break-even depends heavily on migration cost, labor, and whether cloud discounts are included.

## App Development Cost

| Phase | Scope | Estimated Effort |
| --- | --- | --- |
| MVP calculator | Formula engine, tests, basic inputs | 1 to 2 days |
| Dashboard | Charts, KPI cards, presets | 2 to 4 days |
| Export/report | CSV and HTML/PDF output | 1 to 3 days |
| Polish | Copy, layout, examples, README | 1 to 2 days |
| Productization | Auth, database, saved scenarios | 1 to 3 weeks |

## Hidden Costs To Surface

The dashboard should remind users to include:

- Cloud egress and inter-region transfer.
- Backup and disaster recovery.
- Cloud support plans.
- Local power and cooling.
- Rack, colocation, or facility cost.
- Admin and operations labor.
- Migration services and downtime.
- Hardware support contract.
- Software licenses.
- Security and compliance overhead.

## Output Labels

Use explicit labels in the UI:

- Planning estimate, not final quote.
- Assumptions are user-provided.
- Validate local infrastructure pricing with vendor quotes.
- Validate public cloud pricing with current billing and committed-use discounts.

