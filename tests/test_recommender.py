from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from tco import CloudCostAssumptions, LocalCostAssumptions, calculate_tco, recommend_placement


def cloud_monthly(amount: float, discount_pct: float = 0.0) -> CloudCostAssumptions:
    return CloudCostAssumptions(
        compute_monthly=amount,
        storage_monthly=0,
        database_monthly=0,
        network_monthly=0,
        backup_monthly=0,
        support_monthly=0,
        annual_growth_rate_pct=0,
        discount_pct=discount_pct,
    )


def local_monthly(amount: float, migration: float = 0.0) -> LocalCostAssumptions:
    return LocalCostAssumptions(
        infrastructure_subscription_monthly=amount,
        software_licenses_monthly=0,
        support_contract_monthly=0,
        power_cooling_monthly=0,
        datacenter_monthly=0,
        admin_labor_monthly=0,
        backup_dr_monthly=0,
        annual_growth_rate_pct=0,
        migration_one_time=migration,
        installation_one_time=0,
    )


class PlacementRecommenderTests(unittest.TestCase):
    def test_repatriation_candidate_when_savings_and_break_even_are_strong(self) -> None:
        result = calculate_tco(
            cloud_monthly(20_000),
            local_monthly(8_000, migration=10_000),
        )

        recommendation = recommend_placement(result)

        self.assertEqual(recommendation.label, "Repatriation candidate")
        self.assertEqual(recommendation.confidence, "High")
        self.assertEqual(recommendation.style, "local")

    def test_hybrid_candidate_when_savings_are_positive_but_late(self) -> None:
        result = calculate_tco(
            cloud_monthly(10_000),
            local_monthly(8_000, migration=50_000),
        )

        recommendation = recommend_placement(result)

        self.assertEqual(recommendation.label, "Hybrid candidate")
        self.assertEqual(recommendation.confidence, "Medium")

    def test_cloud_first_when_local_is_more_expensive_and_run_rate_is_not_better(self) -> None:
        result = calculate_tco(
            cloud_monthly(8_000),
            local_monthly(12_000),
        )

        recommendation = recommend_placement(result)

        self.assertEqual(recommendation.label, "Cloud-first candidate")
        self.assertEqual(recommendation.confidence, "High")
        self.assertEqual(recommendation.style, "cloud")

    def test_close_result_requires_validation(self) -> None:
        result = calculate_tco(
            cloud_monthly(10_000),
            local_monthly(9_800),
        )

        recommendation = recommend_placement(result)

        self.assertEqual(recommendation.label, "Validate assumptions")
        self.assertEqual(recommendation.confidence, "Low")


if __name__ == "__main__":
    unittest.main()
