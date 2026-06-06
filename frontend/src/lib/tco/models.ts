export interface CloudCostAssumptions {
  computeMonthly: number;
  storageMonthly: number;
  databaseMonthly: number;
  networkMonthly: number;
  backupMonthly: number;
  supportMonthly: number;
  annualGrowthRatePct: number;
  discountPct: number;
}

export interface LocalCostAssumptions {
  infrastructureSubscriptionMonthly: number;
  softwareLicensesMonthly: number;
  supportContractMonthly: number;
  powerCoolingMonthly: number;
  datacenterMonthly: number;
  adminLaborMonthly: number;
  backupDrMonthly: number;
  annualGrowthRatePct: number;
  migrationOneTime: number;
  installationOneTime: number;
}

export interface ProjectionRow {
  month: number;
  cloudMonthly: number;
  localMonthly: number;
  cloudCumulative: number;
  localCumulative: number;
}

export interface TCOResult {
  months: number;
  rows: ProjectionRow[];
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
  breakEvenMonth: number | null;
}

export function getCloudMonthlyTotalBeforeDiscount(c: CloudCostAssumptions): number {
  return c.computeMonthly + c.storageMonthly + c.databaseMonthly + c.networkMonthly + c.backupMonthly + c.supportMonthly;
}

export function getCloudMonthlyTotalAfterDiscount(c: CloudCostAssumptions): number {
  return getCloudMonthlyTotalBeforeDiscount(c) * (1 - c.discountPct / 100);
}

export function getLocalMonthlyTotal(l: LocalCostAssumptions): number {
  return l.infrastructureSubscriptionMonthly + l.softwareLicensesMonthly + l.supportContractMonthly + l.powerCoolingMonthly + l.datacenterMonthly + l.adminLaborMonthly + l.backupDrMonthly;
}

export function getLocalOneTimeTotal(l: LocalCostAssumptions): number {
  return l.migrationOneTime + l.installationOneTime;
}
