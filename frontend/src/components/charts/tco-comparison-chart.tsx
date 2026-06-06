"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { ProjectionRow } from "@/lib/tco/models";
import { formatMoney } from "@/lib/utils";

interface Props {
  data: ProjectionRow[];
  breakEvenMonth: number | null;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">Month {label}</p>
      {payload.map((entry: any, i: number) => {
        if (entry.value === undefined || entry.value === null) return null;
        return (
          <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color || entry.stroke }} />
            <span className="text-muted-foreground">{entry.name}:</span>
            <span className="font-semibold text-foreground">{formatMoney(Number(entry.value))}</span>
          </div>
        );
      })}
    </div>
  );
}

export function TCOComparisonChart({ data, breakEvenMonth }: Props) {
  const chartData = data.map((row) => ({
    month: row.month,
    cloudCumulative: row.cloudCumulative,
    localCumulative: row.localCumulative,
    savings: row.cloudCumulative - row.localCumulative,
  }));

  const totalSavings = chartData.length > 0 ? chartData[chartData.length - 1].savings : 0;
  const savingsPct = chartData.length > 0 && chartData[0].cloudCumulative > 0
    ? ((totalSavings / chartData[chartData.length - 1].cloudCumulative) * 100).toFixed(1)
    : "0";
  const monthlySavingsAtEnd = chartData.length > 0
    ? chartData[chartData.length - 1].cloudCumulative / chartData.length - chartData[chartData.length - 1].localCumulative / chartData.length
    : 0;

  return (
    <div className="chart-container h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Cumulative TCO Comparison</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Cloud vs Local costs over time</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] shrink-0">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-[2px] rounded bg-[#1d5fd1]" />
            <span className="text-muted-foreground">Cloud</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-[2px] rounded bg-[#159a74]" />
            <span className="text-muted-foreground">Local</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-[2px] rounded bg-[#c44949]" />
            <span className="text-muted-foreground">Savings</span>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="savingsAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c44949" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#c44949" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: "#8a9499" }}
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#8a9499" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
              width={45}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="savings"
              name="Savings"
              stroke="#c44949"
              strokeWidth={2}
              fill="url(#savingsAreaGrad)"
              fillOpacity={1}
              dot={false}
              activeDot={{ r: 4, fill: "#c44949", stroke: "#fff", strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="cloudCumulative"
              name="Public Cloud"
              stroke="#1d5fd1"
              strokeWidth={2}
              fill="none"
              dot={false}
              activeDot={{ r: 4, fill: "#1d5fd1", stroke: "#fff", strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="localCumulative"
              name="Local Infrastructure"
              stroke="#159a74"
              strokeWidth={2}
              fill="none"
              dot={false}
              activeDot={{ r: 4, fill: "#159a74", stroke: "#fff", strokeWidth: 2 }}
            />
            {breakEvenMonth && (
              <ReferenceLine
                x={breakEvenMonth}
                stroke="#c88116"
                strokeDasharray="5 3"
                strokeWidth={1.5}
                label={{
                  value: "Break-even",
                  position: "top",
                  style: { fontSize: 10, fill: "#c88116", fontWeight: 600 },
                }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* Footer stats */}
      <div className="grid grid-cols-3 gap-4 mt-3 pt-3 border-t border-border/50">
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Total Savings</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{formatMoney(totalSavings)} <span className="font-normal text-[10px] text-muted-foreground">({savingsPct}%)</span></p>
        </div>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Break-even</p>
          <p className="text-sm font-bold text-foreground mt-0.5">{breakEvenMonth ? `Month ${breakEvenMonth}` : "N/A"}</p>
        </div>
        <div>
          <p className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">Monthly Savings</p>
          <p className="text-sm font-bold text-[#c44949] mt-0.5">{formatMoney(Math.abs(monthlySavingsAtEnd))}/mo</p>
        </div>
      </div>
    </div>
  );
}
