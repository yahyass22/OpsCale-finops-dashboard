from __future__ import annotations

from dataclasses import dataclass

from .models import TCOResult


@dataclass(frozen=True)
class PlacementRecommendation:
    label: str
    confidence: str
    style: str
    headline: str
    rationale: tuple[str, ...]
    placement: tuple[str, ...]


def _dominant_cloud_category(result: TCOResult) -> tuple[str, float]:
    cloud = result.cloud
    categories = {
        "compute": cloud.compute_monthly,
        "storage": cloud.storage_monthly,
        "database": cloud.database_monthly,
        "network": cloud.network_monthly,
        "backup": cloud.backup_monthly,
        "support": cloud.support_monthly,
    }
    total = cloud.monthly_total_before_discount
    if total <= 0:
        return "none", 0.0

    category, value = max(categories.items(), key=lambda item: item[1])
    return category, value / total


def recommend_placement(result: TCOResult) -> PlacementRecommendation:
    if result.cloud_tco <= 0:
        return PlacementRecommendation(
            label="Validate inputs",
            confidence="Low",
            style="neutral",
            headline="The model needs cloud cost data before making a placement recommendation.",
            rationale=("Public cloud TCO is zero, so the comparison has no useful baseline.",),
            placement=("Enter current cloud spend before using the recommendation.",),
        )

    savings_pct = result.savings_pct
    break_even = result.break_even_month
    local_monthly_advantage = result.monthly_run_rate_delta > 0
    dominant_category, dominant_share = _dominant_cloud_category(result)
    rationale: list[str] = []
    placement: list[str] = []

    if savings_pct >= 15 and break_even is not None and break_even <= 24:
        label = "Repatriation candidate"
        confidence = "High"
        style = "local"
        headline = "The economics support moving predictable workloads to local infrastructure."
        rationale.append(f"Local infrastructure is {savings_pct:.1f}% cheaper over the selected window.")
        rationale.append(f"Break-even occurs in month {break_even}, which is inside a practical payback window.")
        placement.append("Move stable, predictable workloads local first.")
        placement.append("Keep elastic, customer-facing, or globally distributed workloads in cloud.")
    elif savings_pct >= 5:
        label = "Hybrid candidate"
        confidence = "Medium"
        style = "hybrid"
        headline = "The local option helps, but a selective migration is more credible than all-in repatriation."
        rationale.append(f"Local infrastructure is {savings_pct:.1f}% cheaper, but the margin is not large enough for a blanket move.")
        if break_even is None:
            rationale.append("Break-even is not reached inside the selected window.")
        elif break_even > 24:
            rationale.append(f"Break-even occurs late, in month {break_even}.")
        else:
            rationale.append(f"Break-even occurs in month {break_even}, but selective placement still lowers execution risk.")
        placement.append("Use local infrastructure for steady-state workloads with predictable demand.")
        placement.append("Keep workloads needing elasticity, managed services, or fast scaling in cloud.")
    elif savings_pct <= -5 and not local_monthly_advantage:
        label = "Cloud-first candidate"
        confidence = "High"
        style = "cloud"
        headline = "The current assumptions do not justify repatriation on cost."
        rationale.append(f"Local infrastructure is {abs(savings_pct):.1f}% more expensive over the selected window.")
        rationale.append("The local monthly run-rate is not lower than the cloud run-rate.")
        placement.append("Keep the evaluated workload in public cloud.")
        placement.append("Optimize cloud commitments, storage tiers, and support before revisiting repatriation.")
    elif savings_pct <= -5:
        label = "Hybrid candidate"
        confidence = "Low"
        style = "hybrid"
        headline = "Full repatriation is weak, but selective placement may still be worth validating."
        rationale.append(f"Local infrastructure is {abs(savings_pct):.1f}% more expensive over the selected window.")
        rationale.append("The local monthly run-rate is lower, so migration cost is the main drag.")
        placement.append("Avoid a full move unless migration cost can be reduced.")
        placement.append("Test only the most predictable workload slice first.")
    else:
        label = "Validate assumptions"
        confidence = "Low"
        style = "neutral"
        headline = "The result is too close for a strong placement recommendation."
        rationale.append(f"The TCO difference is only {abs(savings_pct):.1f}%.")
        rationale.append("Small changes in discounts, migration effort, or support cost could change the conclusion.")
        placement.append("Treat this as a hybrid discovery case.")
        placement.append("Validate billing, vendor quotes, and workload criticality before choosing a direction.")

    if dominant_share >= 0.35:
        if dominant_category in {"storage", "backup"} and style != "cloud":
            rationale.append("Storage and backup are a major share of cloud spend.")
            placement.append("Prioritize storage-heavy or backup-heavy workloads for local evaluation.")
        elif dominant_category == "compute" and result.cloud.discount_pct >= 10:
            rationale.append("Compute dominates cloud spend, but cloud discounts are already material.")
            placement.append("Keep bursty or elastic compute cloud-side unless utilization is consistently high.")
        elif dominant_category == "database" and style != "local":
            rationale.append("Database spend is a major share of the cloud baseline.")
            placement.append("Keep managed databases in cloud unless operations ownership is clearly covered.")

    return PlacementRecommendation(
        label=label,
        confidence=confidence,
        style=style,
        headline=headline,
        rationale=tuple(rationale[:4]),
        placement=tuple(placement[:4]),
    )

