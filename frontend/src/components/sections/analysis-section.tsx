"use client";

import { TCOComparisonChart } from "@/components/charts/tco-comparison-chart";
import { MonthlyDeltaChart } from "@/components/charts/monthly-delta-chart";
import { TopCostDriversChart } from "@/components/charts/top-cost-drivers-chart";
import { SavingsByRegionChart } from "@/components/charts/savings-by-region-chart";
import { AdoptionByWorkloadChart } from "@/components/charts/adoption-by-workload-chart";
import { MigrationOpportunityMatrix } from "@/components/charts/migration-opportunity-matrix";
import type { TCOResult } from "@/lib/tco/models";
import {
  getRegionSavingsData,
  getAdoptionData,
  getMigrationMatrixData,
} from "@/lib/tco/dashboard-data";

interface Props {
  result: TCOResult;
}

export function AnalysisSection({ result }: Props) {
  const regionData = getRegionSavingsData(result);
  const adoptionData = getAdoptionData(result);
  const migrationData = getMigrationMatrixData(result);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TCOComparisonChart data={result.rows} breakEvenMonth={result.breakEvenMonth} />
        <MonthlyDeltaChart data={result.rows} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TopCostDriversChart cloud={result.cloud} local={result.local} />
        <SavingsByRegionChart data={regionData} />
        <AdoptionByWorkloadChart data={adoptionData} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        <MigrationOpportunityMatrix data={migrationData} />
      </div>
    </div>
  );
}
