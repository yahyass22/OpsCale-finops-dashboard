import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  icon?: ReactNode;
  accentColor?: string;
  className?: string;
}

export function MetricCard({
  label,
  value,
  delta,
  deltaDirection = "neutral",
  icon,
  accentColor = "#1d5fd1",
  className,
}: MetricCardProps) {
  const DeltaIcon = deltaDirection === "up" ? TrendingUp : deltaDirection === "down" ? TrendingDown : Minus;
  const deltaColor =
    deltaDirection === "up" ? "text-chart-local" : deltaDirection === "down" ? "text-chart-red" : "text-muted-foreground";

  return (
    <div className={cn("metric-card group", className)}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && (
          <div
            className="flex items-center justify-center w-7 h-7 rounded-lg"
            style={{ background: `${accentColor}12`, color: accentColor }}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {delta && (
        <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", deltaColor)}>
          <DeltaIcon className="w-3.5 h-3.5" />
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
}
