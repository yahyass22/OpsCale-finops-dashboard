"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { CloudCostAssumptions, LocalCostAssumptions } from "@/lib/tco/models";
import { formatMoney } from "@/lib/utils";

const CLOUD_COLORS = ["#1d5fd1", "#5b8def", "#808BC5", "#9ED6DF", "#245E55", "#159a74"];
const LOCAL_COLORS = ["#EAC119", "#c88116", "#c44949", "#808BC5", "#245E55", "#159a74", "#1d5fd1"];

const CLOUD_ITEMS = [
  { key: "computeMonthly", label: "Compute" },
  { key: "storageMonthly", label: "Storage" },
  { key: "databaseMonthly", label: "Database" },
  { key: "networkMonthly", label: "Network" },
  { key: "backupMonthly", label: "Backup" },
  { key: "supportMonthly", label: "Support" },
] as const;

const LOCAL_ITEMS = [
  { key: "infrastructureSubscriptionMonthly", label: "Infrastructure" },
  { key: "softwareLicensesMonthly", label: "Licenses" },
  { key: "supportContractMonthly", label: "Support" },
  { key: "powerCoolingMonthly", label: "Power/Cooling" },
  { key: "datacenterMonthly", label: "Datacenter" },
  { key: "adminLaborMonthly", label: "Admin Labor" },
  { key: "backupDrMonthly", label: "Backup/DR" },
] as const;

interface Props {
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
}

function RadialChart({
  data,
  colors,
  total,
  label,
}: {
  data: { name: string; value: number }[];
  colors: string[];
  total: number;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center">
      <p className="section-label mb-3">{label}</p>
      <div className="relative w-[200px] h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatMoney(Number(value))}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #d9e1e6",
                fontSize: 12,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-center">
          <p className="text-lg font-bold text-foreground leading-none">{formatMoney(total)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">/month</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-3 w-full">
        {data.map((d, i) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
            <span className="text-muted-foreground truncate">{d.name}</span>
            <span className="ml-auto font-medium text-foreground tabular-nums">{((d.value / total) * 100).toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CostCompositionChart({ cloud, local }: Props) {
  const cloudData = CLOUD_ITEMS.map((item) => ({
    name: item.label,
    value: cloud[item.key],
  })).filter((d) => d.value > 0);

  const localData = LOCAL_ITEMS.map((item) => ({
    name: item.label,
    value: local[item.key],
  })).filter((d) => d.value > 0);

  const cloudTotal = cloudData.reduce((s, d) => s + d.value, 0);
  const localTotal = localData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="chart-container">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-foreground">Monthly cost composition</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Breakdown by category</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <RadialChart data={cloudData} colors={CLOUD_COLORS} total={cloudTotal} label="Public Cloud" />
        <RadialChart data={localData} colors={LOCAL_COLORS} total={localTotal} label="Local Infrastructure" />
      </div>
    </div>
  );
}
