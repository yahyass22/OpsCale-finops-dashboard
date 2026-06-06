import { TCOResult, getCloudMonthlyTotalBeforeDiscount, getLocalOneTimeTotal } from "./models";

export interface PlacementRecommendation {
  label: string;
  confidence: "High" | "Medium" | "Low";
  style: "local" | "hybrid" | "cloud" | "neutral";
  headline: string;
  rationale: string[];
  placement: string[];
}

function cloudTCO(r: TCOResult): number {
  return r.rows.length ? r.rows[r.rows.length - 1].cloudCumulative : 0;
}

function localTCO(r: TCOResult): number {
  return r.rows.length ? r.rows[r.rows.length - 1].localCumulative : getLocalOneTimeTotal(r.local);
}

function savingsPct(r: TCOResult): number {
  const c = cloudTCO(r);
  return c === 0 ? 0 : ((cloudTCO(r) - localTCO(r)) / c) * 100;
}

function runRateDelta(r: TCOResult): number {
  const c = r.cloud, l = r.local;
  return (c.computeMonthly + c.storageMonthly + c.databaseMonthly + c.networkMonthly + c.backupMonthly + c.supportMonthly) * (1 - c.discountPct / 100) -
    (l.infrastructureSubscriptionMonthly + l.softwareLicensesMonthly + l.supportContractMonthly + l.powerCoolingMonthly + l.datacenterMonthly + l.adminLaborMonthly + l.backupDrMonthly);
}

function dominantCategory(r: TCOResult): { category: string; share: number } {
  const cats: Record<string, number> = {
    compute: r.cloud.computeMonthly,
    storage: r.cloud.storageMonthly,
    database: r.cloud.databaseMonthly,
    network: r.cloud.networkMonthly,
    backup: r.cloud.backupMonthly,
    support: r.cloud.supportMonthly,
  };
  const total = getCloudMonthlyTotalBeforeDiscount(r.cloud);
  if (total <= 0) return { category: "none", share: 0 };
  let maxC = "none", maxV = 0;
  for (const [c, v] of Object.entries(cats)) {
    if (v > maxV) { maxV = v; maxC = c; }
  }
  return { category: maxC, share: maxV / total };
}

export function recommendPlacement(result: TCOResult): PlacementRecommendation {
  if (cloudTCO(result) <= 0) {
    return {
      label: "Validate inputs",
      confidence: "Low",
      style: "neutral",
      headline: "The model needs cloud cost data.",
      rationale: ["Public cloud TCO is zero."],
      placement: ["Enter current cloud spend."],
    };
  }

  const sp = savingsPct(result);
  const be = result.breakEvenMonth;
  const lma = runRateDelta(result) > 0;
  const { category: dc, share: ds } = dominantCategory(result);
  const rat: string[] = [];
  const pl: string[] = [];
  let label = "";
  let conf: PlacementRecommendation["confidence"] = "Low";
  let style: PlacementRecommendation["style"] = "neutral";
  let headline = "";

  if (sp >= 15 && be !== null && be <= 24) {
    label = "Repatriation candidate";
    conf = "High";
    style = "local";
    headline = "The economics support moving predictable workloads to local infrastructure.";
    rat.push(`Local infrastructure is ${sp.toFixed(1)}% cheaper over the selected window.`);
    rat.push(`Break-even occurs in month ${be}, within a practical payback window.`);
    pl.push("Move stable, predictable workloads local first.");
    pl.push("Keep elastic, customer-facing, or globally distributed workloads in cloud.");
  } else if (sp >= 5) {
    label = "Hybrid candidate";
    conf = "Medium";
    style = "hybrid";
    headline = "The local option helps, but a selective migration is more credible than all-in repatriation.";
    rat.push(`Local infrastructure is ${sp.toFixed(1)}% cheaper, but the margin is not large enough for a blanket move.`);
    if (be === null) rat.push("Break-even is not reached inside the selected window.");
    else if (be > 24) rat.push(`Break-even occurs late, in month ${be}.`);
    else rat.push(`Break-even occurs in month ${be}, but selective placement still lowers execution risk.`);
    pl.push("Use local infrastructure for steady-state workloads with predictable demand.");
    pl.push("Keep workloads needing elasticity, managed services, or fast scaling in cloud.");
  } else if (sp <= -5 && !lma) {
    label = "Cloud-first candidate";
    conf = "High";
    style = "cloud";
    headline = "The current assumptions do not justify repatriation on cost.";
    rat.push(`Local infrastructure is ${Math.abs(sp).toFixed(1)}% more expensive over the selected window.`);
    rat.push("The local monthly run-rate is not lower than the cloud run-rate.");
    pl.push("Keep the evaluated workload in public cloud.");
    pl.push("Optimize cloud commitments, storage tiers, and support before revisiting repatriation.");
  } else if (sp <= -5) {
    label = "Hybrid candidate";
    conf = "Low";
    style = "hybrid";
    headline = "Full repatriation is weak, but selective placement may still be worth validating.";
    rat.push(`Local infrastructure is ${Math.abs(sp).toFixed(1)}% more expensive over the selected window.`);
    rat.push("The local monthly run-rate is lower, so migration cost is the main drag.");
    pl.push("Avoid a full move unless migration cost can be reduced.");
    pl.push("Test only the most predictable workload slice first.");
  } else {
    label = "Validate assumptions";
    conf = "Low";
    style = "neutral";
    headline = "The result is too close for a strong placement recommendation.";
    rat.push(`The TCO difference is only ${Math.abs(sp).toFixed(1)}%.`);
    rat.push("Small changes in discounts, migration effort, or support cost could change the conclusion.");
    pl.push("Treat this as a hybrid discovery case.");
    pl.push("Validate billing, vendor quotes, and workload criticality before choosing a direction.");
  }

  if (ds >= 0.35) {
    if ((dc === "storage" || dc === "backup") && style !== "cloud") {
      rat.push("Storage and backup are a major share of cloud spend.");
      pl.push("Prioritize storage-heavy or backup-heavy workloads for local evaluation.");
    } else if (dc === "compute" && result.cloud.discountPct >= 10) {
      rat.push("Compute dominates cloud spend, but cloud discounts are already material.");
      pl.push("Keep bursty or elastic compute cloud-side unless utilization is consistently high.");
    } else if (dc === "database" && style !== "local") {
      rat.push("Database spend is a major share of the cloud baseline.");
      pl.push("Keep managed databases in cloud unless operations ownership is clearly covered.");
    }
  }

  return { label, confidence: conf, style, headline, rationale: rat.slice(0, 4), placement: pl.slice(0, 4) };
}
