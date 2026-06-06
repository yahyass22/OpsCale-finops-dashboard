import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import type { ReactNode } from "react";

interface SparklineKPIProps {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "neutral";
  icon?: ReactNode;
  accentColor?: string;
  sparklineData?: number[];
  className?: string;
  highlight?: boolean;
}

export function SparklineKPI({
  label,
  value,
  delta,
  deltaDirection = "neutral",
  icon,
  accentColor = "#1d5fd1",
  sparklineData,
  className,
  highlight,
}: SparklineKPIProps) {
  const DeltaIcon = deltaDirection === "up" ? TrendingUp : deltaDirection === "down" ? TrendingDown : Minus;
  const deltaColor =
    deltaDirection === "up" ? "text-chart-local" : deltaDirection === "down" ? "text-chart-red" : "text-muted-foreground";

  const sparkData = sparklineData?.map((v, i) => ({ i, v })) ?? [];

  return (
    <div className={cn(
      "metric-card group relative overflow-hidden",
      highlight && "ring-1 ring-[#159a74]/30 bg-gradient-to-br from-[#159a74]/[0.04] to-transparent",
      className
    )}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        {icon && (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-xl"
            style={{ background: `${accentColor}15`, color: accentColor }}
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
      {sparkData.length > 0 && (
        <div className="absolute bottom-0 right-0 w-[80px] h-[40px] opacity-60">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={accentColor}
                strokeWidth={1.5}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
