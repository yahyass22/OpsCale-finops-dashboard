"use client";

import {
  AreaChart,
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
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const val = Number(payload[0].value);
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-1">Month {label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full bg-[#159a74]" />
        <span className="text-muted-foreground">Cumulative savings:</span>
        <span className="font-semibold text-[#159a74]">{formatMoney(val)}</span>
      </div>
    </div>
  );
}

export function CumulativeSavingsChart({ data }: Props) {
  const chartData = data.map((row) => ({
    month: row.month,
    savings: row.cloudCumulative - row.localCumulative,
  }));

  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Cumulative cost advantage</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Growing savings over time</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-3 h-3 rounded-full bg-[#159a74]" />
          <span className="text-muted-foreground">Local savings</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#159a74" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#159a74" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f2f5" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 11, fill: "#8a9499" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#8a9499" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#d9e1e6" strokeWidth={1.5} strokeDasharray="4 4" />
          <Area
            type="monotone"
            dataKey="savings"
            stroke="#159a74"
            strokeWidth={2.5}
            fill="url(#savingsGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#159a74", stroke: "#fff", strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
