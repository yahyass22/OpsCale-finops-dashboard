from __future__ import annotations

from dataclasses import dataclass


def _ensure_non_negative(name: str, value: float) -> None:
    if value < 0:
        raise ValueError(f"{name} must be greater than or equal to 0")


def _ensure_percent(name: str, value: float, minimum: float = -100.0, maximum: float = 1000.0) -> None:
    if value < minimum or value > maximum:
        raise ValueError(f"{name} must be between {minimum} and {maximum}")


@dataclass(frozen=True)
class CloudCostAssumptions:
    compute_monthly: float = 12_000.0
    storage_monthly: float = 4_000.0
    database_monthly: float = 2_500.0
    network_monthly: float = 1_000.0
    backup_monthly: float = 750.0
    support_monthly: float = 1_500.0
    annual_growth_rate_pct: float = 12.0
    discount_pct: float = 0.0

    def __post_init__(self) -> None:
        for name in (
            "compute_monthly",
            "storage_monthly",
            "database_monthly",
            "network_monthly",
            "backup_monthly",
            "support_monthly",
        ):
            _ensure_non_negative(name, getattr(self, name))
        _ensure_percent("annual_growth_rate_pct", self.annual_growth_rate_pct)
        _ensure_percent("discount_pct", self.discount_pct, 0.0, 100.0)

    @property
    def monthly_total_before_discount(self) -> float:
        return (
            self.compute_monthly
            + self.storage_monthly
            + self.database_monthly
            + self.network_monthly
            + self.backup_monthly
            + self.support_monthly
        )

    @property
    def monthly_total_after_discount(self) -> float:
        return self.monthly_total_before_discount * (1 - self.discount_pct / 100)


@dataclass(frozen=True)
class LocalCostAssumptions:
    infrastructure_subscription_monthly: float = 10_000.0
    software_licenses_monthly: float = 1_200.0
    support_contract_monthly: float = 1_300.0
    power_cooling_monthly: float = 900.0
    datacenter_monthly: float = 600.0
    admin_labor_monthly: float = 3_000.0
    backup_dr_monthly: float = 1_000.0
    annual_growth_rate_pct: float = 3.0
    migration_one_time: float = 35_000.0
    installation_one_time: float = 5_000.0

    def __post_init__(self) -> None:
        for name in (
            "infrastructure_subscription_monthly",
            "software_licenses_monthly",
            "support_contract_monthly",
            "power_cooling_monthly",
            "datacenter_monthly",
            "admin_labor_monthly",
            "backup_dr_monthly",
            "migration_one_time",
            "installation_one_time",
        ):
            _ensure_non_negative(name, getattr(self, name))
        _ensure_percent("annual_growth_rate_pct", self.annual_growth_rate_pct)

    @property
    def monthly_total(self) -> float:
        return (
            self.infrastructure_subscription_monthly
            + self.software_licenses_monthly
            + self.support_contract_monthly
            + self.power_cooling_monthly
            + self.datacenter_monthly
            + self.admin_labor_monthly
            + self.backup_dr_monthly
        )

    @property
    def one_time_total(self) -> float:
        return self.migration_one_time + self.installation_one_time


@dataclass(frozen=True)
class ProjectionRow:
    month: int
    cloud_monthly: float
    local_monthly: float
    cloud_cumulative: float
    local_cumulative: float


@dataclass(frozen=True)
class TCOResult:
    months: int
    rows: tuple[ProjectionRow, ...]
    cloud: CloudCostAssumptions
    local: LocalCostAssumptions
    break_even_month: int | None

    @property
    def cloud_tco(self) -> float:
        return self.rows[-1].cloud_cumulative if self.rows else 0.0

    @property
    def local_tco(self) -> float:
        return self.rows[-1].local_cumulative if self.rows else self.local.one_time_total

    @property
    def savings(self) -> float:
        return self.cloud_tco - self.local_tco

    @property
    def savings_pct(self) -> float:
        if self.cloud_tco == 0:
            return 0.0
        return self.savings / self.cloud_tco * 100

    @property
    def monthly_run_rate_delta(self) -> float:
        return self.cloud.monthly_total_after_discount - self.local.monthly_total

