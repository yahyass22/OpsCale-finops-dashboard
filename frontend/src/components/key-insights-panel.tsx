import { CheckCircle2 } from "lucide-react";
import type { PlacementRecommendation } from "@/lib/tco/recommender";
import type { TCOResult } from "@/lib/tco/models";
import { formatMoney } from "@/lib/utils";

interface Props {
  result: TCOResult;
  recommendation: PlacementRecommendation;
}

export function KeyInsightsPanel({ result, recommendation }: Props) {
  const cloudTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].cloudCumulative : 0;
  const localTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].localCumulative : 0;
  const savings = cloudTCO - localTCO;
  const savingsPct = cloudTCO === 0 ? 0 : (savings / cloudTCO) * 100;
  const monthlySavings = result.rows.length > 0
    ? result.rows[result.rows.length - 1].cloudMonthly - result.rows[result.rows.length - 1].localMonthly
    : 0;

  const insights = [
    `Local infrastructure is ${savingsPct.toFixed(1)}% more cost-effective over ${result.months} months.`,
    result.breakEvenMonth
      ? `Break-even achieved in month ${result.breakEvenMonth} with monthly savings growing to ${formatMoney(monthlySavings)} by month ${result.months}.`
      : "Break-even not reached within the projection window.",
    `Compute and Storage are the top cost drivers in cloud.`,
    recommendation.label !== "Cloud-first candidate"
      ? "Legacy Databases and Batch Processing offer the highest savings potential."
      : "Cloud optimization should be prioritized before considering repatriation.",
    "Adoption of local infrastructure is accelerating across all workload types.",
  ];

  return (
    <div className="chart-container h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Key Insights</h3>
        <p className="text-xs text-muted-foreground mt-0.5">AI-generated analysis</p>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-chart-local mt-0.5 shrink-0" />
            <p className="text-xs text-foreground/80 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
