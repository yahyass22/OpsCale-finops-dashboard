from __future__ import annotations

import csv
from io import StringIO

from .models import TCOResult


def projection_to_csv(result: TCOResult) -> str:
    buffer = StringIO()
    writer = csv.writer(buffer)
    writer.writerow(
        [
            "month",
            "cloud_monthly",
            "local_monthly",
            "cloud_cumulative",
            "local_cumulative",
            "cumulative_delta",
        ]
    )
    for row in result.rows:
        writer.writerow(
            [
                row.month,
                round(row.cloud_monthly, 2),
                round(row.local_monthly, 2),
                round(row.cloud_cumulative, 2),
                round(row.local_cumulative, 2),
                round(row.cloud_cumulative - row.local_cumulative, 2),
            ]
        )
    return buffer.getvalue()


def executive_summary_text(result: TCOResult) -> str:
    break_even = (
        f"month {result.break_even_month}"
        if result.break_even_month is not None
        else "not reached within the projection window"
    )
    direction = "saves" if result.savings >= 0 else "costs an additional"
    return (
        f"Over {result.months} months, the public cloud scenario totals "
        f"${result.cloud_tco:,.0f} and the local infrastructure scenario totals "
        f"${result.local_tco:,.0f}. The local path {direction} "
        f"${abs(result.savings):,.0f}, with break-even {break_even}."
    )

