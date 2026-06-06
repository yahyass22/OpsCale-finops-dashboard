# Module Reference

## Package

```text
src/tco/
```

The `tco` package contains the calculation, recommendation, presets, export helpers, and data models used by the Streamlit app.

## Public Exports

Defined in:

```text
src/tco/__init__.py
```

Exports:

| Name | Type | Purpose |
| --- | --- | --- |
| `CloudCostAssumptions` | dataclass | Public cloud cost inputs |
| `LocalCostAssumptions` | dataclass | Local infrastructure cost inputs |
| `ProjectionRow` | dataclass | One month of projected cost data |
| `TCOResult` | dataclass | Full projection result and derived metrics |
| `PlacementRecommendation` | dataclass | Recommendation output |
| `calculate_tco` | function | Builds the monthly TCO projection |
| `recommend_placement` | function | Creates the hybrid placement recommendation |

## `models.py`

### `CloudCostAssumptions`

Fields:

- `compute_monthly`
- `storage_monthly`
- `database_monthly`
- `network_monthly`
- `backup_monthly`
- `support_monthly`
- `annual_growth_rate_pct`
- `discount_pct`

Properties:

| Property | Meaning |
| --- | --- |
| `monthly_total_before_discount` | Sum of cloud monthly cost categories |
| `monthly_total_after_discount` | Cloud monthly total after discount |

Validation:

- Monthly costs must be non-negative.
- Discount must be between 0 and 100 percent.
- Growth rate must be within the allowed percentage range.

### `LocalCostAssumptions`

Fields:

- `infrastructure_subscription_monthly`
- `software_licenses_monthly`
- `support_contract_monthly`
- `power_cooling_monthly`
- `datacenter_monthly`
- `admin_labor_monthly`
- `backup_dr_monthly`
- `annual_growth_rate_pct`
- `migration_one_time`
- `installation_one_time`

Properties:

| Property | Meaning |
| --- | --- |
| `monthly_total` | Sum of local monthly cost categories |
| `one_time_total` | Migration plus installation cost |

Validation:

- Monthly and one-time costs must be non-negative.
- Growth rate must be within the allowed percentage range.

### `ProjectionRow`

Represents one projected month.

Fields:

- `month`
- `cloud_monthly`
- `local_monthly`
- `cloud_cumulative`
- `local_cumulative`

### `TCOResult`

Represents the full calculation output.

Fields:

- `months`
- `rows`
- `cloud`
- `local`
- `break_even_month`

Properties:

| Property | Meaning |
| --- | --- |
| `cloud_tco` | Final cumulative public cloud cost |
| `local_tco` | Final cumulative local infrastructure cost |
| `savings` | `cloud_tco - local_tco` |
| `savings_pct` | Savings as a percentage of public cloud TCO |
| `monthly_run_rate_delta` | Current monthly cloud baseline minus local baseline |

## `calculator.py`

### `growth_multiplier(annual_growth_rate_pct, month)`

Returns the monthly growth multiplier for a given month.

Month 1 returns the baseline multiplier:

```text
1.0
```

### `calculate_tco(cloud, local, months=36)`

Builds a monthly projection and returns `TCOResult`.

Behavior:

- Starts local cumulative cost with one-time local costs.
- Projects cloud monthly cost with cloud growth.
- Projects local monthly cost with local growth.
- Tracks cumulative totals.
- Finds the first break-even month.

## `recommender.py`

### `PlacementRecommendation`

Fields:

- `label`
- `confidence`
- `style`
- `headline`
- `rationale`
- `placement`

### `recommend_placement(result)`

Returns a placement recommendation from a `TCOResult`.

Possible labels:

- `Repatriation candidate`
- `Hybrid candidate`
- `Cloud-first candidate`
- `Validate assumptions`
- `Validate inputs`

See [recommender.md](recommender.md) for the rule details.

## `presets.py`

Contains built-in demo scenarios.

Current presets:

- `Steady VM estate`
- `Storage-heavy archive`
- `Compute-heavy platform`

Each preset contains:

- Preset name.
- Description.
- Cloud assumptions.
- Local assumptions.

## `export.py`

### `projection_to_csv(result)`

Returns a CSV string containing:

- Month.
- Cloud monthly cost.
- Local monthly cost.
- Cloud cumulative cost.
- Local cumulative cost.
- Cumulative delta.

### `executive_summary_text(result)`

Returns a short plain-language summary of:

- Projection window.
- Public cloud TCO.
- Local infrastructure TCO.
- Savings or added cost.
- Break-even status.

## `app.py`

Streamlit app entry point.

Responsibilities:

- Page configuration.
- Light-only visual styling.
- Sidebar input collection.
- TCO calculation orchestration.
- Recommendation rendering.
- Plotly chart creation.
- Tabs and report layout.
- CSV download button.

The file intentionally imports from `src/tco` and should not own financial rules directly.

