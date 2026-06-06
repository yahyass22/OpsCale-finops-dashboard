"use client";

import { useMemo } from "react";
import { formatMoney } from "@/lib/utils";

interface WorkloadBubble {
  name: string;
  savings: number;
  complexity: number;
  potential: number;
  quadrant: "high-high" | "high-low" | "low-high" | "low-low";
}

interface Props {
  data: WorkloadBubble[];
}

const QUADRANT_COLORS: Record<string, string> = {
  "high-high": "#159a74",
  "high-low": "#1d5fd1",
  "low-high": "#EAC119",
  "low-low": "#c44949",
};

const QUADRANT_LABELS: Record<string, string> = {
  "high-high": "Quick Win",
  "high-low": "Strategic",
  "low-high": "Evaluate",
  "low-low": "Defer",
};

// Carefully positioned cluster — staggered to minimize overlap
const CLUSTER_POSITIONS = [
  { left: "38%", top: "30%" },   // largest — upper-left center
  { left: "65%", top: "35%" },   // second — upper-right
  { left: "25%", top: "62%" },   // third — lower-left
  { left: "55%", top: "68%" },   // fourth — lower-right
  { left: "80%", top: "55%" },   // fifth — far right
];

export function MigrationOpportunityMatrix({ data }: Props) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.savings - a.savings),
    [data],
  );

  const maxSavings = sorted.length > 0 ? sorted[0].savings : 1;
  const totalSavings = data.reduce((s, d) => s + d.savings, 0);

  return (
    <div className="chart-container h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Workload Migration Opportunity Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Bubble size = Annual savings potential
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] shrink-0">
          {Object.entries(QUADRANT_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: QUADRANT_COLORS[key] }}
              />
              <span className="text-muted-foreground font-medium">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex gap-6">
        {/* Left: bubble cluster — the star of the show */}
        <div className="flex-1 relative h-[260px]">
          {sorted.map((d, i) => {
            const color = QUADRANT_COLORS[d.quadrant] || "#1d5fd1";
            const ratio = d.savings / maxSavings;
            // Size: 55px min → 120px max
            const size = Math.max(55, Math.min(120, 55 + ratio * 65));
            const pos = CLUSTER_POSITIONS[i] || CLUSTER_POSITIONS[0];

            return (
              <div
                key={d.name}
                className="absolute flex flex-col items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 cursor-default group"
                style={{
                  width: size,
                  height: size,
                  left: pos.left,
                  top: pos.top,
                  transform: "translate(-50%, -50%)",
                  background: color,
                  opacity: 0.65,
                  zIndex: 10 - i,
                  boxShadow: `0 4px 16px ${color}30`,
                }}
              >
                <span className="text-white text-sm font-bold drop-shadow-sm leading-none">
                  {formatMoney(d.savings)}
                </span>
                <span className="text-white/80 text-[9px] mt-0.5 leading-none truncate max-w-[80%] text-center">
                  {d.name}
                </span>

                {/* Hover tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-50 pointer-events-none">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-3 py-2.5 whitespace-nowrap">
                    <p className="text-xs font-semibold text-gray-900">{d.name}</p>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-[10px] text-gray-500">
                        Savings: <span className="font-semibold text-gray-900">{formatMoney(d.savings)}/yr</span>
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Complexity: <span className="font-semibold text-gray-900">{d.complexity}/100</span>
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Potential: <span className="font-semibold text-gray-900">{d.potential}/100</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: clean workload list */}
        <div className="w-[200px] shrink-0 flex flex-col justify-center gap-4">
          {sorted.map((d) => {
            const color = QUADRANT_COLORS[d.quadrant] || "#1d5fd1";
            const pct = totalSavings > 0 ? (d.savings / totalSavings) * 100 : 0;
            return (
              <div key={d.name} className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate leading-tight">
                    {d.name}
                  </p>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: color, opacity: 0.75 }}
                    />
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-foreground tabular-nums w-[32px] text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
