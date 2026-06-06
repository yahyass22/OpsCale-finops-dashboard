import { CloudCostAssumptions, LocalCostAssumptions } from "./models";

export interface ScenarioPreset {
  name: string;
  description: string;
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
}

export const PRESETS: Record<string, ScenarioPreset> = {
  "Steady VM estate": {
    name: "Steady VM estate",
    description: "Balanced compute and storage spend.",
    cloud: { computeMonthly: 12000, storageMonthly: 4000, databaseMonthly: 2500, networkMonthly: 1000, backupMonthly: 750, supportMonthly: 1500, annualGrowthRatePct: 12, discountPct: 0 },
    local: { infrastructureSubscriptionMonthly: 10000, softwareLicensesMonthly: 1200, supportContractMonthly: 1300, powerCoolingMonthly: 900, datacenterMonthly: 600, adminLaborMonthly: 3000, backupDrMonthly: 1000, annualGrowthRatePct: 3, migrationOneTime: 35000, installationOneTime: 5000 },
  },
  "Storage-heavy archive": {
    name: "Storage-heavy archive",
    description: "Large and growing storage footprint.",
    cloud: { computeMonthly: 5000, storageMonthly: 14000, databaseMonthly: 1000, networkMonthly: 2500, backupMonthly: 2000, supportMonthly: 1500, annualGrowthRatePct: 18, discountPct: 5 },
    local: { infrastructureSubscriptionMonthly: 13500, softwareLicensesMonthly: 1000, supportContractMonthly: 1800, powerCoolingMonthly: 1300, datacenterMonthly: 900, adminLaborMonthly: 3500, backupDrMonthly: 1750, annualGrowthRatePct: 4, migrationOneTime: 55000, installationOneTime: 8000 },
  },
  "Compute-heavy platform": {
    name: "Compute-heavy platform",
    description: "High monthly compute run rate.",
    cloud: { computeMonthly: 28000, storageMonthly: 3500, databaseMonthly: 5500, networkMonthly: 1200, backupMonthly: 1000, supportMonthly: 2400, annualGrowthRatePct: 10, discountPct: 15 },
    local: { infrastructureSubscriptionMonthly: 20000, softwareLicensesMonthly: 2800, supportContractMonthly: 2500, powerCoolingMonthly: 1800, datacenterMonthly: 1200, adminLaborMonthly: 5000, backupDrMonthly: 1500, annualGrowthRatePct: 3, migrationOneTime: 70000, installationOneTime: 12000 },
  },
};
