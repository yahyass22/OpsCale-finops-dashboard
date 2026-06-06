from __future__ import annotations

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))

from tco import CloudCostAssumptions, LocalCostAssumptions, calculate_tco


class TCOCalculatorTests(unittest.TestCase):
    def test_no_growth_projection_totals(self) -> None:
        cloud = CloudCostAssumptions(
            compute_monthly=1_000,
            storage_monthly=0,
            database_monthly=0,
            network_monthly=0,
            backup_monthly=0,
            support_monthly=0,
            annual_growth_rate_pct=0,
            discount_pct=0,
        )
        local = LocalCostAssumptions(
            infrastructure_subscription_monthly=800,
            software_licenses_monthly=0,
            support_contract_monthly=0,
            power_cooling_monthly=0,
            datacenter_monthly=0,
            admin_labor_monthly=0,
            backup_dr_monthly=0,
            annual_growth_rate_pct=0,
            migration_one_time=0,
            installation_one_time=0,
        )

        result = calculate_tco(cloud, local, months=36)

        self.assertEqual(result.cloud_tco, 36_000)
        self.assertEqual(result.local_tco, 28_800)
        self.assertEqual(result.savings, 7_200)
        self.assertEqual(result.savings_pct, 20)
        self.assertEqual(result.break_even_month, 1)

    def test_one_time_migration_delays_break_even(self) -> None:
        cloud = CloudCostAssumptions(
            compute_monthly=1_000,
            storage_monthly=0,
            database_monthly=0,
            network_monthly=0,
            backup_monthly=0,
            support_monthly=0,
            annual_growth_rate_pct=0,
            discount_pct=0,
        )
        local = LocalCostAssumptions(
            infrastructure_subscription_monthly=800,
            software_licenses_monthly=0,
            support_contract_monthly=0,
            power_cooling_monthly=0,
            datacenter_monthly=0,
            admin_labor_monthly=0,
            backup_dr_monthly=0,
            annual_growth_rate_pct=0,
            migration_one_time=5_000,
            installation_one_time=0,
        )

        result = calculate_tco(cloud, local, months=36)

        self.assertEqual(result.break_even_month, 25)

    def test_cloud_discount_is_applied_before_projection(self) -> None:
        cloud = CloudCostAssumptions(
            compute_monthly=1_000,
            storage_monthly=0,
            database_monthly=0,
            network_monthly=0,
            backup_monthly=0,
            support_monthly=0,
            annual_growth_rate_pct=0,
            discount_pct=10,
        )
        local = LocalCostAssumptions(
            infrastructure_subscription_monthly=1_000,
            software_licenses_monthly=0,
            support_contract_monthly=0,
            power_cooling_monthly=0,
            datacenter_monthly=0,
            admin_labor_monthly=0,
            backup_dr_monthly=0,
            annual_growth_rate_pct=0,
            migration_one_time=0,
            installation_one_time=0,
        )

        result = calculate_tco(cloud, local, months=12)

        self.assertEqual(result.cloud_tco, 10_800)
        self.assertEqual(result.local_tco, 12_000)
        self.assertIsNone(result.break_even_month)

    def test_break_even_not_reached_when_local_is_always_more_expensive(self) -> None:
        cloud = CloudCostAssumptions(
            compute_monthly=1_000,
            storage_monthly=0,
            database_monthly=0,
            network_monthly=0,
            backup_monthly=0,
            support_monthly=0,
            annual_growth_rate_pct=0,
            discount_pct=0,
        )
        local = LocalCostAssumptions(
            infrastructure_subscription_monthly=2_000,
            software_licenses_monthly=0,
            support_contract_monthly=0,
            power_cooling_monthly=0,
            datacenter_monthly=0,
            admin_labor_monthly=0,
            backup_dr_monthly=0,
            annual_growth_rate_pct=0,
            migration_one_time=0,
            installation_one_time=0,
        )

        result = calculate_tco(cloud, local, months=36)

        self.assertIsNone(result.break_even_month)
        self.assertLess(result.savings, 0)


if __name__ == "__main__":
    unittest.main()

