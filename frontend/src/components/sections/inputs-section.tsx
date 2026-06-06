"use client";

import { useMemo } from "react";
import { CostInputGroup } from "@/components/cost-input-group";
import {
  Server,
  HardDrive,
  Database,
  Wifi,
  Shield,
  Headphones,
  TrendingUp,
  Percent,
  Cpu,
  FileKey,
  Wrench,
  Zap,
  Building2,
  Users,
  ArrowRightLeft,
  Settings,
} from "lucide-react";
import type { CloudCostAssumptions, LocalCostAssumptions } from "@/lib/tco/models";
import {
  getCloudMonthlyTotalBeforeDiscount,
  getCloudMonthlyTotalAfterDiscount,
  getLocalMonthlyTotal,
  getLocalOneTimeTotal,
} from "@/lib/tco/models";

interface Props {
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
  onCloudChange: (c: CloudCostAssumptions) => void;
  onLocalChange: (l: LocalCostAssumptions) => void;
}

const fmt = (n: number) =>
  n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n.toLocaleString()}`;

/* ── Proportional Bar ────────────────────────────────── */
function BreakdownBar({
  items,
  color,
}: {
  items: { label: string; value: number }[];
  color: string;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <div className="space-y-1">
      <div className="flex h-2 rounded-full overflow-hidden bg-muted/50">
        {items.map((item) => {
          const pct = (item.value / total) * 100;
          if (pct < 1) return null;
          return (
            <div
              key={item.label}
              style={{ width: `${pct}%`, background: color, opacity: 0.3 + (pct / 100) * 0.7 }}
              title={`${item.label}: ${fmt(item.value)}`}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {items.map((item) => {
          const pct = Math.round((item.value / total) * 100);
          return (
            <span key={item.label} className="text-[9px] text-muted-foreground">
              <span className="font-semibold">{item.label}</span>{" "}
              <span className="tabular-nums opacity-70">{pct}%</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

/* ── Section Header Card ──────────────────────────────── */
function SummaryHeader({
  title,
  subtitle,
  monthlyTotal,
  oneTimeTotal,
  color,
}: {
  title: string;
  subtitle: string;
  monthlyTotal: number;
  oneTimeTotal?: number;
  color: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h3 className="text-base font-bold tracking-tight flex items-center gap-2">
          <span className="w-2 h-5 rounded-full" style={{ background: color }} />
          {title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold tabular-nums tracking-tight" style={{ color }}>
          {fmt(monthlyTotal)}
          <span className="text-xs font-medium text-muted-foreground ml-1">/mo</span>
        </div>
        {oneTimeTotal != null && oneTimeTotal > 0 && (
          <div className="text-[10px] text-muted-foreground tabular-nums">
            + {fmt(oneTimeTotal)} one-time
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Section ─────────────────────────────────────── */
export function InputsSection({ cloud, local, onCloudChange, onLocalChange }: Props) {
  const updateCloud = (field: keyof CloudCostAssumptions, value: number) =>
    onCloudChange({ ...cloud, [field]: value });
  const updateLocal = (field: keyof LocalCostAssumptions, value: number) =>
    onLocalChange({ ...local, [field]: value });

  /* Live totals */
  const cloudMonthly = useMemo(() => getCloudMonthlyTotalBeforeDiscount(cloud), [cloud]);
  const cloudAfterDiscount = useMemo(() => getCloudMonthlyTotalAfterDiscount(cloud), [cloud]);
  const localMonthly = useMemo(() => getLocalMonthlyTotal(local), [local]);
  const localOneTime = useMemo(() => getLocalOneTimeTotal(local), [local]);

  /* Weight computation for visual emphasis */
  const cloudItems = useMemo(
    () => [
      { key: "computeMonthly" as const, label: "Compute", value: cloud.computeMonthly, icon: <Cpu className="w-3.5 h-3.5" />, help: "VMs, containers, serverless" },
      { key: "storageMonthly" as const, label: "Storage", value: cloud.storageMonthly, icon: <HardDrive className="w-3.5 h-3.5" />, help: "Object, block, file storage" },
      { key: "databaseMonthly" as const, label: "Database", value: cloud.databaseMonthly, icon: <Database className="w-3.5 h-3.5" />, help: "Managed database services" },
      { key: "networkMonthly" as const, label: "Network", value: cloud.networkMonthly, icon: <Wifi className="w-3.5 h-3.5" />, help: "Egress, VPN, connectivity" },
      { key: "backupMonthly" as const, label: "Backup", value: cloud.backupMonthly, icon: <Shield className="w-3.5 h-3.5" />, help: "Snapshot, replication, recovery" },
      { key: "supportMonthly" as const, label: "Support", value: cloud.supportMonthly, icon: <Headphones className="w-3.5 h-3.5" />, help: "Cloud support plan" },
    ],
    [cloud]
  );

  const localItems = useMemo(
    () => [
      { key: "infrastructureSubscriptionMonthly" as const, label: "Infrastructure", value: local.infrastructureSubscriptionMonthly, icon: <Server className="w-3.5 h-3.5" />, help: "Hardware subscription" },
      { key: "softwareLicensesMonthly" as const, label: "Software Licenses", value: local.softwareLicensesMonthly, icon: <FileKey className="w-3.5 h-3.5" />, help: "OS, hypervisor, DB licenses" },
      { key: "supportContractMonthly" as const, label: "Support Contract", value: local.supportContractMonthly, icon: <Wrench className="w-3.5 h-3.5" />, help: "Vendor support" },
      { key: "powerCoolingMonthly" as const, label: "Power & Cooling", value: local.powerCoolingMonthly, icon: <Zap className="w-3.5 h-3.5" />, help: "Energy and cooling" },
      { key: "datacenterMonthly" as const, label: "Datacenter", value: local.datacenterMonthly, icon: <Building2 className="w-3.5 h-3.5" />, help: "Colocation, rack" },
      { key: "adminLaborMonthly" as const, label: "Admin Labor", value: local.adminLaborMonthly, icon: <Users className="w-3.5 h-3.5" />, help: "Operations effort" },
      { key: "backupDrMonthly" as const, label: "Backup & DR", value: local.backupDrMonthly, icon: <Shield className="w-3.5 h-3.5" />, help: "Local backup, replication" },
    ],
    [local]
  );

  const cloudWeights = useMemo(() => {
    const total = cloudMonthly || 1;
    return Object.fromEntries(cloudItems.map((i) => [i.key, Math.round((i.value / total) * 100)]));
  }, [cloudItems, cloudMonthly]);

  const localWeights = useMemo(() => {
    const total = localMonthly || 1;
    return Object.fromEntries(localItems.map((i) => [i.key, Math.round((i.value / total) * 100)]));
  }, [localItems, localMonthly]);

  /* Compare bar */
  const maxTotal = Math.max(cloudAfterDiscount, localMonthly) || 1;
  const delta = cloudAfterDiscount - localMonthly;

  return (
    <div className="space-y-5 max-w-7xl">
      {/* ── Top Comparison Strip ── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Monthly Spend Comparison</span>
          <span className="text-xs font-semibold" style={{ color: delta > 0 ? "#16a34a" : delta < 0 ? "#dc2626" : "#6b7280" }}>
            {delta > 0
              ? `Local saves ${fmt(delta)}/mo`
              : delta < 0
              ? `Cloud saves ${fmt(Math.abs(delta))}/mo`
              : "Break even"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground/70">Cloud</span>
              <span className="font-bold tabular-nums" style={{ color: "#3b82f6" }}>{fmt(cloudAfterDiscount)}</span>
            </div>
            <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${(cloudAfterDiscount / maxTotal) * 100}%` }} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground/70">Local</span>
              <span className="font-bold tabular-nums" style={{ color: "#10b981" }}>{fmt(localMonthly)}</span>
            </div>
            <div className="h-3 rounded-full bg-muted/50 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${(localMonthly / maxTotal) * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Two-Column Cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ── Cloud Card ── */}
        <div className="rounded-xl border border-border bg-white p-5 space-y-4">
          <SummaryHeader
            title="Public Cloud"
            subtitle="Monthly spend by category"
            monthlyTotal={cloudAfterDiscount}
            color="#3b82f6"
          />

          {/* Breakdown */}
          <BreakdownBar
            items={cloudItems.map((i) => ({ label: i.label, value: i.value }))}
            color="#3b82f6"
          />

          {/* Monthly Inputs */}
          <div className="grid grid-cols-2 gap-2">
            {cloudItems.map((item) => (
              <CostInputGroup
                key={item.key}
                label={item.label}
                value={item.value}
                onChange={(v) => updateCloud(item.key, v)}
                helpText={item.help}
                icon={item.icon}
                weight={cloudWeights[item.key]}
              />
            ))}
          </div>

          {/* Growth & Discount */}
          <div className="border-t border-border/50 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Growth & Discounts</p>
            <div className="grid grid-cols-2 gap-2">
              <CostInputGroup
                label="Annual Growth"
                value={cloud.annualGrowthRatePct}
                onChange={(v) => updateCloud("annualGrowthRatePct", v)}
                suffix="%"
                step={1}
                prefix=""
                icon={<TrendingUp className="w-3.5 h-3.5" />}
              />
              <CostInputGroup
                label="Discount"
                value={cloud.discountPct}
                onChange={(v) => updateCloud("discountPct", v)}
                suffix="%"
                step={1}
                prefix=""
                icon={<Percent className="w-3.5 h-3.5" />}
              />
            </div>
          </div>
        </div>

        {/* ── Local Card ── */}
        <div className="rounded-xl border border-border bg-white p-5 space-y-4">
          <SummaryHeader
            title="Local Infrastructure"
            subtitle="Hardware subscription + operations"
            monthlyTotal={localMonthly}
            oneTimeTotal={localOneTime}
            color="#10b981"
          />

          {/* Breakdown */}
          <BreakdownBar
            items={localItems.map((i) => ({ label: i.label, value: i.value }))}
            color="#10b981"
          />

          {/* Monthly Inputs */}
          <div className="grid grid-cols-2 gap-2">
            {localItems.map((item) => (
              <CostInputGroup
                key={item.key}
                label={item.label}
                value={item.value}
                onChange={(v) => updateLocal(item.key, v)}
                helpText={item.help}
                icon={item.icon}
                weight={localWeights[item.key]}
              />
            ))}
          </div>

          {/* Growth & One-time */}
          <div className="border-t border-border/50 pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Growth & One-time Costs</p>
            <div className="grid grid-cols-3 gap-2">
              <CostInputGroup
                label="Annual Growth"
                value={local.annualGrowthRatePct}
                onChange={(v) => updateLocal("annualGrowthRatePct", v)}
                suffix="%"
                step={1}
                prefix=""
                icon={<TrendingUp className="w-3.5 h-3.5" />}
              />
              <CostInputGroup
                label="Migration"
                value={local.migrationOneTime}
                onChange={(v) => updateLocal("migrationOneTime", v)}
                step={1000}
                helpText="One-time migration cost"
                icon={<ArrowRightLeft className="w-3.5 h-3.5" />}
              />
              <CostInputGroup
                label="Installation"
                value={local.installationOneTime}
                onChange={(v) => updateLocal("installationOneTime", v)}
                step={1000}
                helpText="One-time installation cost"
                icon={<Settings className="w-3.5 h-3.5" />}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
