# Calculation Model

## Projection Window

The app projects costs month by month.

Default:

```text
36 months
```

Allowed in the UI:

```text
12 to 60 months
```

## Growth Multiplier

Monthly costs are compounded from an annual growth rate.

```text
growth_multiplier = (1 + annual_growth_rate_pct / 100) ^ ((month - 1) / 12)
```

Month 1 uses the baseline monthly cost.

## Public Cloud Monthly Cost

The public cloud baseline is the sum of cloud line items:

```text
cloud_base =
  compute_monthly
  + storage_monthly
  + database_monthly
  + network_monthly
  + backup_monthly
  + support_monthly
```

Discount is applied before projection:

```text
cloud_after_discount = cloud_base * (1 - discount_pct / 100)
```

Projected monthly cloud cost:

```text
cloud_month_n =
  cloud_after_discount
  * (1 + annual_growth_rate_pct / 100) ^ ((n - 1) / 12)
```

## Local Infrastructure Monthly Cost

The local baseline is the sum of local monthly line items:

```text
local_base =
  infrastructure_subscription_monthly
  + software_licenses_monthly
  + support_contract_monthly
  + power_cooling_monthly
  + datacenter_monthly
  + admin_labor_monthly
  + backup_dr_monthly
```

Projected monthly local cost:

```text
local_month_n =
  local_base
  * (1 + annual_growth_rate_pct / 100) ^ ((n - 1) / 12)
```

## One-Time Local Costs

Local infrastructure starts with one-time costs:

```text
one_time_local_cost =
  migration_one_time
  + installation_one_time
```

These costs are included before monthly local costs accumulate.

## TCO Totals

```text
cloud_tco = sum(cloud_month_1 through cloud_month_n)
```

```text
local_tco =
  migration_one_time
  + installation_one_time
  + sum(local_month_1 through local_month_n)
```

## Savings

```text
savings = cloud_tco - local_tco
```

```text
savings_pct = savings / cloud_tco * 100
```

Interpretation:

- Positive savings: local infrastructure is cheaper.
- Negative savings: local infrastructure is more expensive.

## Monthly Run-Rate Delta

```text
monthly_run_rate_delta =
  cloud_monthly_after_discount
  - local_monthly_total
```

This is the current monthly baseline difference, before projection growth.

## Break-Even Month

Break-even is the first month where:

```text
cumulative_local_cost <= cumulative_cloud_cost
```

If that never happens inside the projection window, break-even is shown as not reached.

## Validation Rules

Cost inputs must be non-negative.

Cloud discount must be between:

```text
0 and 100 percent
```

Growth rates are allowed between:

```text
-100 and 1000 percent
```

## Known Limitations

- No net present value or discount rate.
- No depreciation model.
- No tax treatment.
- No workload-level sizing model.
- No cloud API import.
- No distinction between reserved and on-demand usage beyond the discount field.

