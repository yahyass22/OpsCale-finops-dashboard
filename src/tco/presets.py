from __future__ import annotations

from dataclasses import dataclass

from .models import CloudCostAssumptions, LocalCostAssumptions


@dataclass(frozen=True)
class ScenarioPreset:
    name: str
    description: str
    cloud: CloudCostAssumptions
    local: LocalCostAssumptions


PRESETS: dict[str, ScenarioPreset] = {
    "Steady VM estate": ScenarioPreset(
        name="Steady VM estate",
        description="Balanced compute and storage spend with moderate cloud growth.",
        cloud=CloudCostAssumptions(
            compute_monthly=12_000,
            storage_monthly=4_000,
            database_monthly=2_500,
            network_monthly=1_000,
            backup_monthly=750,
            support_monthly=1_500,
            annual_growth_rate_pct=12,
            discount_pct=0,
        ),
        local=LocalCostAssumptions(
            infrastructure_subscription_monthly=10_000,
            software_licenses_monthly=1_200,
            support_contract_monthly=1_300,
            power_cooling_monthly=900,
            datacenter_monthly=600,
            admin_labor_monthly=3_000,
            backup_dr_monthly=1_000,
            annual_growth_rate_pct=3,
            migration_one_time=35_000,
            installation_one_time=5_000,
        ),
    ),
    "Storage-heavy archive": ScenarioPreset(
        name="Storage-heavy archive",
        description="Large and growing storage footprint with lower compute intensity.",
        cloud=CloudCostAssumptions(
            compute_monthly=5_000,
            storage_monthly=14_000,
            database_monthly=1_000,
            network_monthly=2_500,
            backup_monthly=2_000,
            support_monthly=1_500,
            annual_growth_rate_pct=18,
            discount_pct=5,
        ),
        local=LocalCostAssumptions(
            infrastructure_subscription_monthly=13_500,
            software_licenses_monthly=1_000,
            support_contract_monthly=1_800,
            power_cooling_monthly=1_300,
            datacenter_monthly=900,
            admin_labor_monthly=3_500,
            backup_dr_monthly=1_750,
            annual_growth_rate_pct=4,
            migration_one_time=55_000,
            installation_one_time=8_000,
        ),
    ),
    "Compute-heavy platform": ScenarioPreset(
        name="Compute-heavy platform",
        description="High monthly compute run rate with meaningful committed-use opportunity.",
        cloud=CloudCostAssumptions(
            compute_monthly=28_000,
            storage_monthly=3_500,
            database_monthly=5_500,
            network_monthly=1_200,
            backup_monthly=1_000,
            support_monthly=2_400,
            annual_growth_rate_pct=10,
            discount_pct=15,
        ),
        local=LocalCostAssumptions(
            infrastructure_subscription_monthly=20_000,
            software_licenses_monthly=2_800,
            support_contract_monthly=2_500,
            power_cooling_monthly=1_800,
            datacenter_monthly=1_200,
            admin_labor_monthly=5_000,
            backup_dr_monthly=1_500,
            annual_growth_rate_pct=3,
            migration_one_time=70_000,
            installation_one_time=12_000,
        ),
    ),
}

