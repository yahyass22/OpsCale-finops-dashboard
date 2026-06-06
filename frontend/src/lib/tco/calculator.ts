import {
  CloudCostAssumptions,
  LocalCostAssumptions,
  ProjectionRow,
  TCOResult,
  getCloudMonthlyTotalAfterDiscount,
  getLocalMonthlyTotal,
  getLocalOneTimeTotal,
} from "./models";

function growthMultiplier(rate: number, month: number): number {
  return Math.pow(1 + rate / 100, (month - 1) / 12);
}

export function calculateTCO(
  cloud: CloudCostAssumptions,
  local: LocalCostAssumptions,
  months = 36
): TCOResult {
  const rows: ProjectionRow[] = [];
  let cloudCum = 0;
  let localCum = getLocalOneTimeTotal(local);
  let breakEven: number | null = null;

  for (let m = 1; m <= months; m++) {
    const cm = getCloudMonthlyTotalAfterDiscount(cloud) * growthMultiplier(cloud.annualGrowthRatePct, m);
    const lm = getLocalMonthlyTotal(local) * growthMultiplier(local.annualGrowthRatePct, m);
    cloudCum += cm;
    localCum += lm;
    rows.push({ month: m, cloudMonthly: cm, localMonthly: lm, cloudCumulative: cloudCum, localCumulative: localCum });
    if (breakEven === null && localCum <= cloudCum) breakEven = m;
  }

  return { months, rows, cloud, local, breakEvenMonth: breakEven };
}
