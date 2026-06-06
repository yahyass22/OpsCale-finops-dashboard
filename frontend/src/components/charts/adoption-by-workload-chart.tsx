"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface AdoptionPoint {
  month: number;
  webServices: number;
  legacyDB: number;
  batchProcessing: number;
}

interface Props {
  data: AdoptionPoint[];
}

const LINES = [
  { key: "webServices", label: "Web Services", color: "#1283EB" },
  { key: "legacyDB", label: "Legacy Databases", color: "#2BBF5D" },
  { key: "batchProcessing", label: "Batch Processing", color: "#7B61FF" },
] as const;

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl shadow-lg border border-border px-4 py-3 text-sm">
      <p className="font-semibold text-foreground mb-2">Month {label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 mb-1 last:mb-0">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-semibold text-foreground">{entry.value}%</span>
        </div>
      ))}
    </div>
  );
}

export function AdoptionByWorkloadChart({ data }: Props) {
  const latest = data[data.length - 1];
  const prev = data[Math.max(0, data.length - 7)];

  const getDelta = (key: string) => {
    if (!latest || !prev) return 0;
    return (latest[key as keyof AdoptionPoint] as number) - (prev[key as keyof AdoptionPoint] as number);
  };

  return (
    <div className="chart-container h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Adoption by Workload</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Showing adoption rate across workload types over time</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] shrink-0">
          {LINES.map((l) => {
            const delta = getDelta(l.key);
            return (
              <div key={l.key} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-muted-foreground">{l.label}</span>
                <span className="font-semibold text-[#159a74]">+{delta.toFixed(0)}pp</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
            <defs>
              {LINES.map((l) => (
                <linearGradient key={l.key} id={`adoptGrad-${l.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={l.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={l.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
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
              tickFormatter={(v: number) => `${v}%`}
              domain={[0, 100]}
              width={38}
            />
            <Tooltip content={<CustomTooltip />} />
            {LINES.map((l) => (
              <Area
                key={l.key}
                type="monotone"
                dataKey={l.key}
                name={l.label}
                stroke={l.color}
                strokeWidth={2}
                fill={`url(#adoptGrad-${l.key})`}
                fillOpacity={1}
                dot={false}
                activeDot={{ r: 4, fill: l.color, stroke: "#fff", strokeWidth: 2 }}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
