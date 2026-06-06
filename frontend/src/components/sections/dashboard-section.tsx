"use client";

import dynamic from "next/dynamic";
import { SparklineKPI } from "@/components/sparkline-kpi";
import { TCOComparisonChart } from "@/components/charts/tco-comparison-chart";
import { MonthlyDeltaChart } from "@/components/charts/monthly-delta-chart";
import { TopCostDriversChart } from "@/components/charts/top-cost-drivers-chart";
import { AdoptionByWorkloadChart } from "@/components/charts/adoption-by-workload-chart";
import { MigrationOpportunityMatrix } from "@/components/charts/migration-opportunity-matrix";
import { RecommendationPriorityTable } from "@/components/recommendation-priority-table";
import { KeyInsightsPanel } from "@/components/key-insights-panel";
import type { TCOResult } from "@/lib/tco/models";
import type { PlacementRecommendation } from "@/lib/tco/recommender";
import { formatMoney, formatPct } from "@/lib/utils";
import {
  getRegionSavingsData,
  getAdoptionData,
  getMigrationMatrixData,
  getWorkloadPriorityData,
  getSparklineData,
} from "@/lib/tco/dashboard-data";
import { Cloud, Server, DollarSign, Clock, TrendingUp } from "lucide-react";

// Dynamically import the map component to bypass SSR (maplibre-gl requires window)
const SavingsByRegionChart = dynamic(
  () => import("@/components/charts/savings-by-region-chart").then((mod) => ({ default: mod.SavingsByRegionChart })),
  { ssr: false, loading: () => <div className="h-[520px] animate-pulse bg-secondary/30 rounded-xl mb-6" /> }
);

interface Props {
  result: TCOResult;
  recommendation: PlacementRecommendation;
}

export function DashboardSection({ result, recommendation }: Props) {
  const cloudTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].cloudCumulative : 0;
  const localTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].localCumulative : 0;
  const savings = cloudTCO - localTCO;
  const savingsPct = cloudTCO === 0 ? 0 : (savings / cloudTCO) * 100;
  const monthlyDelta =
    (result.cloud.computeMonthly + result.cloud.storageMonthly + result.cloud.databaseMonthly + result.cloud.networkMonthly + result.cloud.backupMonthly + result.cloud.supportMonthly) * (1 - result.cloud.discountPct / 100) -
    (result.local.infrastructureSubscriptionMonthly + result.local.softwareLicensesMonthly + result.local.supportContractMonthly + result.local.powerCoolingMonthly + result.local.datacenterMonthly + result.local.adminLaborMonthly + result.local.backupDrMonthly);

  const roi = cloudTCO > 0 ? ((savings / localTCO) * 100) : 0;
  const sparklineData = getSparklineData(result);
  const regionData = getRegionSavingsData(result);
  const adoptionData = getAdoptionData(result);
  const migrationData = getMigrationMatrixData(result);
  const priorityData = getWorkloadPriorityData(result);

  return (
    <div className="space-y-0">
      {/* Row 1: KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <SparklineKPI
          label="Public Cloud TCO"
          value={formatMoney(cloudTCO)}
          delta={`${result.months} months`}
          icon={<Cloud className="w-4 h-4" />}
          accentColor="#1d5fd1"
          sparklineData={result.rows.map((r) => r.cloudMonthly)}
        />
        <SparklineKPI
          label="Local Infrastructure TCO"
          value={formatMoney(localTCO)}
          delta={`${result.months} months`}
          icon={<Server className="w-4 h-4" />}
          accentColor="#159a74"
          sparklineData={result.rows.map((r) => r.localMonthly)}
        />
        <SparklineKPI
          label="Net Savings"
          value={formatMoney(savings)}
          delta={`+${formatPct(savingsPct)} vs cloud`}
          deltaDirection={savings >= 0 ? "up" : "down"}
          icon={<DollarSign className="w-4 h-4" />}
          accentColor={savings >= 0 ? "#159a74" : "#c44949"}
          sparklineData={sparklineData}
          highlight
        />
        <SparklineKPI
          label="Break-even"
          value={result.breakEvenMonth ? `Month ${result.breakEvenMonth}` : "Not reached"}
          delta={formatMoney(monthlyDelta)}
          deltaDirection={monthlyDelta > 0 ? "up" : "down"}
          icon={<Clock className="w-4 h-4" />}
          accentColor="#c88116"
          sparklineData={result.rows.map((r) => r.cloudCumulative - r.localCumulative)}
        />
        <SparklineKPI
          label="ROI"
          value={`${roi.toFixed(0)}%`}
          delta={`Over ${result.months} months`}
          deltaDirection="up"
          icon={<TrendingUp className="w-4 h-4" />}
          accentColor="#808BC5"
          sparklineData={result.rows.map((r) => r.localCumulative > 0 ? ((r.cloudCumulative - r.localCumulative) / r.localCumulative) * 100 : 0)}
        />
      </div>

      {/* Row 2: Cumulative TCO (½) + Monthly Run-Rate Delta (½) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TCOComparisonChart data={result.rows} breakEvenMonth={result.breakEvenMonth} />
        <MonthlyDeltaChart data={result.rows} />
      </div>

      {/* Row 3: Full-width SVG World Map */}
      <div className="w-full mb-6">
        <SavingsByRegionChart data={regionData} />
      </div>

      {/* Row 4: Cost Drivers + Migration Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TopCostDriversChart cloud={result.cloud} local={result.local} />
        <MigrationOpportunityMatrix data={migrationData} />
      </div>

      {/* Row 5: Adoption + Priority Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AdoptionByWorkloadChart data={adoptionData} />
        <RecommendationPriorityTable data={priorityData} />
      </div>

      {/* Row 6: Key Insights */}
      <div className="w-full">
        <KeyInsightsPanel result={result} recommendation={recommendation} />
      </div>
    </div>
  );
}
