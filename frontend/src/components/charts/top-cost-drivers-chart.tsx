"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CloudCostAssumptions, LocalCostAssumptions } from "@/lib/tco/models";
import { formatMoney } from "@/lib/utils";

const CLOUD_ITEMS = [
  { key: "computeMonthly", label: "Compute", color: "#1d5fd1" },
  { key: "storageMonthly", label: "Storage", color: "#5b8def" },
  { key: "databaseMonthly", label: "Data Transfer", color: "#808BC5" },
  { key: "networkMonthly", label: "Network", color: "#9ED6DF" },
  { key: "backupMonthly", label: "Backup", color: "#245E55" },
  { key: "supportMonthly", label: "Other", color: "#159a74" },
] as const;

const LOCAL_ITEMS = [
  { key: "infrastructureSubscriptionMonthly", label: "Infrastructure", color: "#c88116" },
  { key: "softwareLicensesMonthly", label: "Software Licenses", color: "#EAC119" },
  { key: "supportContractMonthly", label: "Support Contract", color: "#808BC5" },
  { key: "powerCoolingMonthly", label: "Power & Cooling", color: "#c44949" },
  { key: "datacenterMonthly", label: "Data Center", color: "#245E55" },
  { key: "adminLaborMonthly", label: "Admin Labor", color: "#1d5fd1" },
  { key: "backupDrMonthly", label: "Backup/DR", color: "#9ED6DF" },
] as const;

interface Props {
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
}

function DonutChart({
  items,
  costObj,
  title,
  subtitle,
}: {
  items: ReadonlyArray<{ key: string; label: string; color: string }>;
  costObj: Record<string, number>;
  title: string;
  subtitle: string;
}) {
  const data = items
    .map((item) => ({
      name: item.label,
      value: costObj[item.key] ?? 0,
      color: item.color,
    }))
    .filter((d) => d.value > 0);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col items-center flex-1">
      <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
      <p className="text-[10px] text-muted-foreground mb-3">{subtitle}</p>
      {/* Donut */}
      <div className="relative w-[140px] h-[140px] mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={42}
              outerRadius={62}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #d9e1e6",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                background: "#fff",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-base font-bold text-foreground leading-none">{formatMoney(total)}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Total/mo</p>
        </div>
      </div>
      {/* Legend */}
      <div className="w-full grid grid-cols-2 gap-x-3 gap-y-1.5">
        {data.map((d) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(0) : "0";
          return (
            <div key={d.name} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: d.color }} />
              <span className="text-[10px] text-muted-foreground truncate flex-1">{d.name}</span>
              <span className="text-[10px] font-semibold text-foreground tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function TopCostDriversChart({ cloud, local }: Props) {
  return (
    <div className="chart-container h-full">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-foreground">Top Cost Drivers</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Monthly spend breakdown by category</p>
      </div>
      <div className="flex gap-6">
        <DonutChart
          items={CLOUD_ITEMS}
          costObj={cloud as unknown as Record<string, number>}
          title="Public Cloud"
          subtitle="Before discount"
        />
        {/* Divider */}
        <div className="w-px bg-border self-stretch" />
        <DonutChart
          items={LOCAL_ITEMS}
          costObj={local as unknown as Record<string, number>}
          title="On-Premises"
          subtitle="Monthly recurring"
        />
      </div>
    </div>
  );
}
