import type { TCOResult } from "./models";

export interface RegionBubble {
  region: string;
  savings: number;
  workloads: number;
  growth: number;
}

export interface AdoptionPoint {
  month: number;
  webServices: number;
  legacyDB: number;
  batchProcessing: number;
}

export interface WorkloadBubble {
  name: string;
  savings: number;
  complexity: number;
  potential: number;
  quadrant: "high-high" | "high-low" | "low-high" | "low-low";
}

export interface WorkloadPriority {
  name: string;
  potentialSavings: number;
  confidence: number;
  priority: "High" | "Medium" | "Low";
}

function getSavingsPct(r: TCOResult): number {
  const c = r.rows.length ? r.rows[r.rows.length - 1].cloudCumulative : 0;
  const l = r.rows.length ? r.rows[r.rows.length - 1].localCumulative : 0;
  return c === 0 ? 0 : ((c - l) / c) * 100;
}

export function getRegionSavingsData(result: TCOResult): RegionBubble[] {
  const totalSavings = Math.max(0,
    (result.rows.length ? result.rows[result.rows.length - 1].cloudCumulative : 0) -
    (result.rows.length ? result.rows[result.rows.length - 1].localCumulative : 0)
  );
  const sp = getSavingsPct(result);

  return [
    { region: "N. America", savings: Math.round(totalSavings * 0.42), workloads: 145, growth: Math.round(sp * 0.8) },
    { region: "Europe", savings: Math.round(totalSavings * 0.28), workloads: 98, growth: Math.round(sp * 0.6) },
    { region: "Asia Pacific", savings: Math.round(totalSavings * 0.18), workloads: 72, growth: Math.round(sp * 0.9) },
    { region: "Latin America", savings: Math.round(totalSavings * 0.07), workloads: 34, growth: Math.round(sp * 0.5) },
    { region: "Middle East", savings: Math.round(totalSavings * 0.03), workloads: 18, growth: Math.round(sp * 0.4) },
    { region: "Africa", savings: Math.round(totalSavings * 0.02), workloads: 12, growth: Math.round(sp * 0.3) },
  ];
}

export function getAdoptionData(result: TCOResult): AdoptionPoint[] {
  const months = result.months;
  const sp = getSavingsPct(result);
  const data: AdoptionPoint[] = [];

  for (let m = 1; m <= months; m += 3) {
    const progress = m / months;
    data.push({
      month: m,
      webServices: Math.min(95, Math.round(15 + progress * (55 + sp * 0.3))),
      legacyDB: Math.min(90, Math.round(8 + progress * (45 + sp * 0.25))),
      batchProcessing: Math.min(85, Math.round(5 + progress * (35 + sp * 0.2))),
    });
  }
  return data;
}

export function getMigrationMatrixData(result: TCOResult): WorkloadBubble[] {
  const sp = getSavingsPct(result);
  const monthlyCloud = result.cloud.computeMonthly + result.cloud.storageMonthly + result.cloud.databaseMonthly + result.cloud.networkMonthly + result.cloud.backupMonthly + result.cloud.supportMonthly;

  return [
    {
      name: "Legacy Databases",
      savings: Math.round(monthlyCloud * 0.35 * 12),
      complexity: 72,
      potential: 88,
      quadrant: "high-high" as const,
    },
    {
      name: "Batch Processing",
      savings: Math.round(monthlyCloud * 0.22 * 12),
      complexity: 45,
      potential: 82,
      quadrant: "high-high" as const,
    },
    {
      name: "Web Services",
      savings: Math.round(monthlyCloud * 0.15 * 12),
      complexity: 30,
      potential: 72,
      quadrant: "low-high" as const,
    },
    {
      name: "Analytics",
      savings: Math.round(monthlyCloud * 0.12 * 12),
      complexity: 55,
      potential: 64,
      quadrant: "high-low" as const,
    },
    {
      name: "Internal Tools",
      savings: Math.round(monthlyCloud * 0.05 * 12),
      complexity: 20,
      potential: 35,
      quadrant: "low-low" as const,
    },
  ];
}

export function getWorkloadPriorityData(result: TCOResult): WorkloadPriority[] {
  const monthlyCloud = result.cloud.computeMonthly + result.cloud.storageMonthly + result.cloud.databaseMonthly + result.cloud.networkMonthly + result.cloud.backupMonthly + result.cloud.supportMonthly;
  const sp = getSavingsPct(result);

  return [
    { name: "Legacy Databases", potentialSavings: Math.round(monthlyCloud * 0.35), confidence: 95, priority: "High" as const },
    { name: "Batch Processing", potentialSavings: Math.round(monthlyCloud * 0.22), confidence: 88, priority: "High" as const },
    { name: "Web Services", potentialSavings: Math.round(monthlyCloud * 0.15), confidence: 72, priority: "Medium" as const },
    { name: "Analytics", potentialSavings: Math.round(monthlyCloud * 0.12), confidence: 64, priority: "Medium" as const },
    { name: "Internal Tools", potentialSavings: Math.round(monthlyCloud * 0.05), confidence: 35, priority: "Low" as const },
  ];
}

export function getSparklineData(result: TCOResult): number[] {
  return result.rows.map((r) => r.cloudCumulative - r.localCumulative);
}
