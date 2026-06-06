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
  breakEvenMonth: number | null;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">Month {label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{formatMoney(Number(entry.value))}</span>
        </div>
      ))}
    </div>
  );
}

export function CumulativeTCOChart({ data, breakEvenMonth }: Props) {
  return (
    <div className="chart-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-foreground">Cumulative TCO over time</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Total cost of ownership comparison</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#1d5fd1]" />
            <span className="text-muted-foreground">Public cloud</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#159a74]" />
            <span className="text-muted-foreground">Local infra</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cloudGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1d5fd1" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#1d5fd1" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="localGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#159a74" stopOpacity={0.25} />
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
          <Area
            type="monotone"
            dataKey="cloudCumulative"
            name="Public cloud"
            stroke="#1d5fd1"
            strokeWidth={2.5}
            fill="url(#cloudGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#1d5fd1", stroke: "#fff", strokeWidth: 2 }}
          />
          <Area
            type="monotone"
            dataKey="localCumulative"
            name="Local infra"
            stroke="#159a74"
            strokeWidth={2.5}
            fill="url(#localGrad)"
            dot={false}
            activeDot={{ r: 5, fill: "#159a74", stroke: "#fff", strokeWidth: 2 }}
          />
          {breakEvenMonth && (
            <ReferenceLine
              x={breakEvenMonth}
              stroke="#c88116"
              strokeDasharray="6 4"
              strokeWidth={1.5}
              label={{
                value: `Break-even M${breakEvenMonth}`,
                position: "top",
                style: { fontSize: 11, fill: "#c88116", fontWeight: 600 },
              }}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
