import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";
import type { PlacementRecommendation } from "@/lib/tco/recommender";

const STYLE_CONFIG = {
  local: { borderColor: "border-chart-local", icon: CheckCircle2, iconColor: "text-chart-local" },
  hybrid: { borderColor: "border-chart-amber", icon: AlertTriangle, iconColor: "text-chart-amber" },
  cloud: { borderColor: "border-chart-cloud", icon: XCircle, iconColor: "text-chart-cloud" },
  neutral: { borderColor: "border-border", icon: Info, iconColor: "text-muted-foreground" },
};

interface RecommendationCardProps {
  recommendation: PlacementRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const config = STYLE_CONFIG[recommendation.style];
  const Icon = config.icon;

  return (
    <div className={cn("glass-card rounded-xl border-l-4 p-6", config.borderColor)}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", config.iconColor)} />
          <div>
            <h3 className="text-lg font-bold text-foreground">{recommendation.label}</h3>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{recommendation.headline}</p>
          </div>
        </div>
        <Badge
          variant={
            recommendation.confidence === "High"
              ? "success"
              : recommendation.confidence === "Medium"
              ? "warning"
              : "outline"
          }
        >
          {recommendation.confidence} confidence
        </Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        <div>
          <p className="section-label">Why this result</p>
          <ul className="space-y-2">
            {recommendation.rationale.map((item, i) => (
              <li key={i} className="text-sm text-foreground/80 leading-relaxed border-t border-border/50 pt-2 first:border-0 first:pt-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="section-label">What to do first</p>
          <ul className="space-y-2">
            {recommendation.placement.map((item, i) => (
              <li key={i} className="text-sm text-foreground/80 leading-relaxed border-t border-border/50 pt-2 first:border-0 first:pt-0">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
