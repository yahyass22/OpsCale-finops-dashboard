"use client";

import { useState, useMemo } from "react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  RotateCcw,
  TrendingUp,
  DollarSign,
  Server,
  Cloud,
} from "lucide-react";
import { calculateTCO } from "@/lib/tco/calculator";
import { recommendPlacement, type PlacementRecommendation } from "@/lib/tco/recommender";
import {
  getCloudMonthlyTotalAfterDiscount,
  getLocalMonthlyTotal,
} from "@/lib/tco/models";
import type { CloudCostAssumptions, LocalCostAssumptions } from "@/lib/tco/models";

interface Props {
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
  months: number;
}

/* ── Style config per verdict ── */
const STYLE_CONFIG = {
  local:   { color: "#16a34a", bg: "#f0fdf4", icon: CheckCircle2,  label: "Repatriation" },
  hybrid:  { color: "#d97706", bg: "#fffbeb", icon: AlertTriangle, label: "Hybrid" },
  cloud:   { color: "#3b82f6", bg: "#eff6ff", icon: XCircle,       label: "Cloud-first" },
  neutral: { color: "#6b7280", bg: "#f9fafb", icon: Info,          label: "Neutral" },
} as const;

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1000
    ? `$${(n / 1000).toFixed(1)}k`
    : `$${n.toLocaleString()}`;

/* ── Sensitivity slider config ── */
interface SensitivityVar {
  key: string;
  label: string;
  icon: React.ReactNode;
  min: number;
  max: number;
  step: number;
  defaultPct: number;
  suffix: string;
  description: string;
}

const SENSITIVITY_VARS: SensitivityVar[] = [
  {
    key: "discount",
    label: "Cloud Discount",
    icon: <DollarSign className="w-3.5 h-3.5" />,
    min: -30,
    max: 30,
    step: 1,
    defaultPct: 0,
    suffix: "%",
    description: "Additional cloud discount/surcharge",
  },
  {
    key: "migration",
    label: "Migration Cost",
    icon: <Server className="w-3.5 h-3.5" />,
    min: -80,
    max: 100,
    step: 5,
    defaultPct: 0,
    suffix: "%",
    description: "Adjust migration/installation cost",
  },
  {
    key: "localSupport",
    label: "Local Support",
    icon: <Cloud className="w-3.5 h-3.5" />,
    min: -50,
    max: 50,
    step: 5,
    defaultPct: 0,
    suffix: "%",
    description: "Adjust local support contract cost",
  },
  {
    key: "cloudGrowth",
    label: "Cloud Growth",
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    min: -15,
    max: 15,
    step: 1,
    defaultPct: 0,
    suffix: "%",
    description: "Additional cloud growth rate",
  },
];

/* ── Main Component ── */
export function RecommendationSection({ cloud, local, months }: Props) {
  const [overrides, setOverrides] = useState<Record<string, number>>({
    discount: 0,
    migration: 0,
    localSupport: 0,
    cloudGrowth: 0,
  });

  const setOverride = (key: string, value: number) =>
    setOverrides((prev) => ({ ...prev, [key]: value }));

  const hasOverrides = Object.values(overrides).some((v) => v !== 0);

  /* ── Apply overrides to compute adjusted result ── */
  const adjustedResult = useMemo(() => {
    const adjCloud: CloudCostAssumptions = {
      ...cloud,
      discountPct: Math.max(0, Math.min(100, cloud.discountPct + overrides.discount)),
      annualGrowthRatePct: Math.max(0, cloud.annualGrowthRatePct + overrides.cloudGrowth),
    };
    const migrationMultiplier = 1 + overrides.migration / 100;
    const supportMultiplier = 1 + overrides.localSupport / 100;
    const adjLocal: LocalCostAssumptions = {
      ...local,
      migrationOneTime: local.migrationOneTime * migrationMultiplier,
      installationOneTime: local.installationOneTime * migrationMultiplier,
      supportContractMonthly: local.supportContractMonthly * supportMultiplier,
    };
    return calculateTCO(adjCloud, adjLocal, months);
  }, [cloud, local, months, overrides]);

  const adjustedRec = useMemo(() => recommendPlacement(adjustedResult), [adjustedResult]);

  /* ── Baseline (no overrides) ── */
  const baselineResult = useMemo(() => calculateTCO(cloud, local, months), [cloud, local, months]);
  const baselineRec = useMemo(() => recommendPlacement(baselineResult), [baselineResult]);

  /* ── Derived metrics ── */
  const cloudMonthly = getCloudMonthlyTotalAfterDiscount(adjustedResult.cloud);
  const localMonthly = getLocalMonthlyTotal(adjustedResult.local);
  const savingsPct =
    cloudMonthly > 0 ? ((cloudMonthly - localMonthly) / cloudMonthly) * 100 : 0;
  const breakEven = adjustedResult.breakEvenMonth;

  /* ── Sensitivity: how close to flipping ── */
  // A "stability score" based on how far savings% is from the thresholds (5% and -5%)
  const stabilityScore = useMemo(() => {
    const absSp = Math.abs(savingsPct);
    if (absSp >= 15) return 100;
    if (absSp >= 5) return Math.round(50 + ((absSp - 5) / 10) * 50);
    return Math.round((absSp / 5) * 50);
  }, [savingsPct]);

  const didFlip = adjustedRec.style !== baselineRec.style;

  const resetAll = () =>
    setOverrides({ discount: 0, migration: 0, localSupport: 0, cloudGrowth: 0 });

  const config = STYLE_CONFIG[adjustedRec.style];
  const Icon = config.icon;

  return (
    <div className="space-y-5 max-w-5xl">
      {/* ── Verdict Card ── */}
      <div
        className="rounded-xl border p-6 transition-all duration-300"
        style={{ borderColor: config.color, background: config.bg }}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `${config.color}18` }}
            >
              <Icon className="w-6 h-6" style={{ color: config.color }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl font-bold tracking-tight" style={{ color: config.color }}>
                  {adjustedRec.label}
                </h2>
                <Badge
                  variant={
                    adjustedRec.confidence === "High"
                      ? "success"
                      : adjustedRec.confidence === "Medium"
                      ? "warning"
                      : "outline"
                  }
                >
                  {adjustedRec.confidence} confidence
                </Badge>
                {didFlip && (
                  <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    Flipped
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/70 leading-relaxed max-w-xl">
                {adjustedRec.headline}
              </p>
            </div>
          </div>
          {hasOverrides && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>

        {/* ── Metrics Strip ── */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <MetricCard
            label="Savings"
            value={`${savingsPct >= 0 ? "" : "+"}${Math.abs(savingsPct).toFixed(1)}%`}
            sublabel={savingsPct >= 0 ? "Local is cheaper" : "Cloud is cheaper"}
            color={savingsPct >= 0 ? "#16a34a" : "#3b82f6"}
          />
          <MetricCard
            label="Break-even"
            value={breakEven ? `Mo ${breakEven}` : "N/A"}
            sublabel={breakEven ? `${breakEven} months to recoup` : "Not reached in window"}
            color={breakEven && breakEven <= 24 ? "#16a34a" : "#d97706"}
          />
          <MetricCard
            label="Cloud Run-rate"
            value={fmt(cloudMonthly)}
            sublabel="per month after discount"
            color="#3b82f6"
          />
          <MetricCard
            label="Local Run-rate"
            value={fmt(localMonthly)}
            sublabel="per month recurring"
            color="#10b981"
          />
        </div>
      </div>

      {/* ── Sensitivity Simulator ── */}
      <div className="rounded-xl border border-border bg-white p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Sensitivity Simulator
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Adjust assumptions to see how the recommendation changes
            </p>
          </div>
          {/* Stability Gauge */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Decision Stability
            </span>
            <div className="w-24 h-2 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${stabilityScore}%`,
                  background: stabilityScore >= 70 ? "#16a34a" : stabilityScore >= 40 ? "#d97706" : "#dc2626",
                }}
              />
            </div>
            <span className="text-xs font-bold tabular-nums w-8 text-right">{stabilityScore}%</span>
          </div>
        </div>

        {/* ── Sliders ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SENSITIVITY_VARS.map((v) => {
            const value = overrides[v.key];
            const isAdjusted = value !== 0;
            return (
              <div key={v.key} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60">{v.icon}</span>
                    <span className="text-xs font-semibold text-foreground/80">{v.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: isAdjusted ? "#d97706" : "inherit" }}
                    >
                      {value >= 0 ? "+" : ""}
                      {value}
                      {v.suffix}
                    </span>
                    {isAdjusted && (
                      <button
                        onClick={() => setOverride(v.key, 0)}
                        className="text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                <Slider
                  value={[value]}
                  onValueChange={(vals) => setOverride(v.key, vals[0])}
                  min={v.min}
                  max={v.max}
                  step={v.step}
                />
                <div className="flex justify-between text-[9px] text-muted-foreground/60">
                  <span>{v.min}{v.suffix}</span>
                  <span className="italic">{v.description}</span>
                  <span>+{v.max}{v.suffix}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Flip Indicator ── */}
        {didFlip && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-800">
              <span className="font-bold">Recommendation flipped</span> from{" "}
              <span className="font-semibold">{STYLE_CONFIG[baselineRec.style].label}</span> to{" "}
              <span className="font-semibold">{config.label}</span> with these adjustments.
            </p>
          </div>
        )}
      </div>

      {/* ── Rationale + Actions ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border bg-white p-5 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Why this result
          </h4>
          <ul className="space-y-2">
            {adjustedRec.rationale.map((item, i) => (
              <li
                key={i}
                className="text-xs text-foreground/75 leading-relaxed pl-3"
                style={{ borderLeft: `2px solid ${config.color}30` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-border bg-white p-5 space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            What to do first
          </h4>
          <ul className="space-y-2">
            {adjustedRec.placement.map((item, i) => (
              <li
                key={i}
                className="text-xs text-foreground/75 leading-relaxed pl-3"
                style={{ borderLeft: `2px solid ${config.color}30` }}
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/* ── Small Metric Card ── */
function MetricCard({
  label,
  value,
  sublabel,
  color,
}: {
  label: string;
  value: string;
  sublabel: string;
  color: string;
}) {
  return (
    <div className="rounded-lg bg-white/70 border border-white p-3">
      <div className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
        {label}
      </div>
      <div className="text-lg font-bold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</div>
    </div>
  );
}
