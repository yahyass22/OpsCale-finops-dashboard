"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
  CartesianGrid,
} from "recharts";
import type { ProjectionRow } from "@/lib/tco/models";
import { formatMoney } from "@/lib/utils";

interface Props {
  data: ProjectionRow[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0].value);
  const isPositive = val >= 0;
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2.5 text-sm">
      <p className="font-semibold text-gray-900 text-xs">Month {label}</p>
      <p className={`text-xs mt-1 font-medium ${isPositive ? "text-[#159a74]" : "text-[#c44949]"}`}>
        {isPositive ? "+" : ""}{formatMoney(val)}/mo
      </p>
    </div>
  );
}

export function MonthlyDeltaChart({ data }: Props) {
  const chartData = data.map((row) => ({
    month: row.month,
    delta: (row.cloudCumulative - row.localCumulative) / row.month,
  }));

  // Summary stats
  const lastRow = data.length > 0 ? data[data.length - 1] : null;
  const totalSavings = lastRow ? lastRow.cloudCumulative - lastRow.localCumulative : 0;
  const latestDelta = chartData.length > 0 ? chartData[chartData.length - 1].delta : 0;

  return (
    <div className="chart-container h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Monthly Run-Rate Delta</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Amortized cost difference (Cloud − Local)</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#159a74]" />
            <span className="text-muted-foreground">Cloud higher</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded-full bg-[#c44949]" />
            <span className="text-muted-foreground">Local higher</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="greenBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#159a74" stopOpacity={1} />
                <stop offset="100%" stopColor="#159a74" stopOpacity={0.5} />
              </linearGradient>
              <linearGradient id="redBarGrad" x1="0" y1="1" x2="0" y2="0">
                <stop offset="0%" stopColor="#c44949" stopOpacity={1} />
                <stop offset="100%" stopColor="#c44949" stopOpacity={0.5} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#8a9499" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#8a9499" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
            <ReferenceLine y={0} stroke="#d9e1e6" strokeWidth={1.5} />
            <Bar dataKey="delta" radius={3} maxBarSize={14}>
              {chartData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.delta >= 0 ? "url(#greenBarGrad)" : "url(#redBarGrad)"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Footer summary */}
      <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-border/50">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Current Delta</p>
          <p className={`text-sm font-bold mt-0.5 ${latestDelta >= 0 ? "text-[#159a74]" : "text-[#c44949]"}`}>
            {latestDelta >= 0 ? "+" : ""}{formatMoney(latestDelta)}/mo
          </p>
        </div>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Total Savings</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatMoney(totalSavings)}</p>
        </div>
      </div>
    </div>
  );
}
