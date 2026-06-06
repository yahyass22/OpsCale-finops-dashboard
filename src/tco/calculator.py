from __future__ import annotations

from .models import CloudCostAssumptions, LocalCostAssumptions, ProjectionRow, TCOResult


def growth_multiplier(annual_growth_rate_pct: float, month: int) -> float:
    """Return monthly compounded growth with month 1 as the starting baseline."""
    if month < 1:
        raise ValueError("month must be greater than or equal to 1")
    return (1 + annual_growth_rate_pct / 100) ** ((month - 1) / 12)


def calculate_tco(
    cloud: CloudCostAssumptions,
    local: LocalCostAssumptions,
    months: int = 36,
) -> TCOResult:
    if months < 1:
        raise ValueError("months must be greater than or equal to 1")

    rows: list[ProjectionRow] = []
    cloud_cumulative = 0.0
    local_cumulative = local.one_time_total
    break_even_month: int | None = None

    for month in range(1, months + 1):
        cloud_monthly = cloud.monthly_total_after_discount * growth_multiplier(
            cloud.annual_growth_rate_pct,
            month,
        )
        local_monthly = local.monthly_total * growth_multiplier(
            local.annual_growth_rate_pct,
            month,
        )

        cloud_cumulative += cloud_monthly
        local_cumulative += local_monthly

        row = ProjectionRow(
            month=month,
            cloud_monthly=cloud_monthly,
            local_monthly=local_monthly,
            cloud_cumulative=cloud_cumulative,
            local_cumulative=local_cumulative,
        )
        rows.append(row)

        if break_even_month is None and local_cumulative <= cloud_cumulative:
            break_even_month = month

    return TCOResult(
        months=months,
        rows=tuple(rows),
        cloud=cloud,
        local=local,
        break_even_month=break_even_month,
    )

