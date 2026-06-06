"use client";

import { useState, useMemo } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  type CustomerProfile, type Industry, type WorkloadType, type BudgetTier,
  INDUSTRIES, WORKLOADS, BUDGET_TIERS, CUSTOMER_SCENARIOS,
} from "@/lib/solutions/solution-catalog";
import { recommendSolution, type ScoredProduct } from "@/lib/solutions/solution-recommender";
import { cn } from "@/lib/utils";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import {
  Server, HardDrive, ShieldCheck, Cloud, Wrench,
  MessageSquare, Sparkles, ArrowRight, BookOpen,
} from "lucide-react";

const CATEGORY_ICONS = {
  Compute: Server,
  Storage: HardDrive,
  "Data Protection": ShieldCheck,
  "Hybrid Cloud": Cloud,
  Services: Wrench,
} as const;

// Each industry gets a bold, saturated accent from the brand palette
const INDUSTRY_COLORS: Record<Industry, string> = {
  Healthcare:          "#2BBF5D", // Light Malachite — bold green
  "Financial Services": "#1283EB", // Azure Cornflower — bold blue
  Manufacturing:       "#ED773C", // Tangerine — warm orange
  Education:           "#245E55", // Tea — deep teal
  Retail:              "#7B61FF", // Amethyst Bellflower — vivid purple
  Technology:          "#C63F3E", // Red Passion — bold red
} as const;

const WORKLOAD_ICONS: Record<WorkloadType, string> = {
  Virtualization: "VM",
  Database: "DB",
  "AI/ML": "AI",
  VDI: "VDI",
  "Mixed/HCI": "HCI",
};

const DEFAULT_PROFILE: CustomerProfile = {
  industry: "Financial Services",
  workload: "Database",
  budget: "$150–500K",
  priorities: { performance: 80, cost: 50, scalability: 60, simplicity: 50 },
};

export function SolutionRecommenderSection() {
  const [profile, setProfile] = useState<CustomerProfile>(DEFAULT_PROFILE);

  const result = useMemo(() => recommendSolution(profile), [profile]);
  const accent = INDUSTRY_COLORS[profile.industry];

  // Radar chart data: average fit across stack for each dimension
  const radarData = useMemo(() => {
    const stack = result.stack;
    const avg = (arr: number[]) => Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);

    const workloadFit = avg(stack.map((s) => (s.product.workloadFit[profile.workload] || 0) * 10));
    const budgetFit = avg(stack.map((s) => (s.product.budgetFit[profile.budget] || 0) * 10));
    const priorityFit = avg(stack.map((s) => {
      const p = profile.priorities;
      const total = p.performance + p.cost + p.scalability + p.simplicity || 1;
      return ((s.product.priorityFit["Performance"] || 0) * (p.performance / total)
            + (s.product.priorityFit["Cost"] || 0) * (p.cost / total)
            + (s.product.priorityFit["Scalability"] || 0) * (p.scalability / total)
            + (s.product.priorityFit["Simplicity"] || 0) * (p.simplicity / total)) * 10;
    }));
    const industryFit = avg(stack.map((s) => Math.min(100, ((s.product.industryBonus[profile.industry] || 0) / 3) * 100)));

    return [
      { axis: "Workload", value: workloadFit },
      { axis: "Budget", value: budgetFit },
      { axis: "Priority", value: priorityFit },
      { axis: "Industry", value: industryFit },
    ];
  }, [result, profile]);

  const setPriority = (key: keyof CustomerProfile["priorities"], val: number) => {
    setProfile((p) => ({ ...p, priorities: { ...p.priorities, [key]: val } }));
  };

  const applyScenario = (key: string) => {
    const s = CUSTOMER_SCENARIOS[key];
    if (!s) return;
    setProfile({ industry: s.industry, workload: s.workload, budget: s.budget, priorities: { ...s.priorities } });
  };

  return (
    <div className="space-y-6">
      {/* Scenario Presets */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(CUSTOMER_SCENARIOS).map(([key, s]) => {
          const sColor = INDUSTRY_COLORS[s.industry];
          const isActive = profile.industry === s.industry && profile.workload === s.workload && profile.budget === s.budget;
          return (
            <button
              key={key}
              onClick={() => applyScenario(key)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
              style={
                isActive
                  ? { background: sColor, borderColor: sColor, color: "#fff" }
                  : { background: "#fff", borderColor: "#d9e1e5", color: "#555" }
              }
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: isActive ? "#fff" : sColor }} />
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Row 1: Customer Profile | Fit Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Customer Profile + Guide ── */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-white p-5 space-y-5">
            <h2 className="text-sm font-bold tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-5 rounded-full" style={{ background: accent }} />
              Customer Profile
            </h2>

            {/* Industry */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Industry</label>
              <Select value={profile.industry} onValueChange={(v) => setProfile((p) => ({ ...p, industry: v as Industry }))}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {INDUSTRIES.map((ind) => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Workload */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Workload Type</label>
              <div className="grid grid-cols-5 gap-1.5">
                {WORKLOADS.map((w) => (
                  <button
                    key={w}
                    onClick={() => setProfile((p) => ({ ...p, workload: w }))}
                    className="flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-semibold border transition-colors"
                    style={
                      profile.workload === w
                        ? { background: `${accent}12`, borderColor: accent, color: accent }
                        : { background: "#fff", borderColor: "#d9e1e5", color: "#8a9499" }
                    }
                  >
                    <span className="text-[11px] font-bold">{WORKLOAD_ICONS[w]}</span>
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Budget Range</label>
              <div className="grid grid-cols-4 gap-1.5">
                {BUDGET_TIERS.map((b) => (
                  <button
                    key={b}
                    onClick={() => setProfile((p) => ({ ...p, budget: b }))}
                    className="py-2 rounded-lg text-[11px] font-semibold border text-center transition-colors"
                    style={
                      profile.budget === b
                        ? { background: `${accent}12`, borderColor: accent, color: accent }
                        : { background: "#fff", borderColor: "#d9e1e5", color: "#8a9499" }
                    }
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority Sliders */}
            <div className="space-y-3 pt-1">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Priorities</label>
              <style>{`
                .priority-sliders > span:first-child > span:first-child {
                  background: ${accent} !important;
                }
                .priority-sliders [role="slider"] {
                  background: white !important;
                  border-color: ${accent} !important;
                  box-shadow: 0 0 0 3px ${accent}25 !important;
                }
              `}</style>
              {(["performance", "cost", "scalability", "simplicity"] as const).map((key) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium capitalize text-foreground/80">{key}</span>
                    <span className="text-xs font-bold tabular-nums text-foreground/60">{profile.priorities[key]}</span>
                  </div>
                  <Slider
                    value={[profile.priorities[key]]}
                    onValueChange={(v) => setPriority(key, v[0])}
                    min={0} max={100} step={5}
                    className="priority-sliders"
                  />
                </div>
              ))}
            </div>
          </div>

        {/* ── How to Use ── */}
        <div className="rounded-xl border border-border bg-white p-5 space-y-3">
          <h3 className="text-sm font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-4 h-4" style={{ color: accent }} />
            How to Use
          </h3>
          <ol className="space-y-1.5 text-[11px] text-foreground/70 leading-snug list-decimal list-inside">
            <li><span className="font-semibold text-foreground/90">Pick a scenario</span> or configure manually</li>
            <li><span className="font-semibold text-foreground/90">Set industry &amp; workload</span> to drive product matching</li>
            <li><span className="font-semibold text-foreground/90">Choose budget</span> to filter by price tier</li>
            <li><span className="font-semibold text-foreground/90">Adjust sliders</span> to weight priorities</li>
            <li><span className="font-semibold text-foreground/90">Expand cards</span> for full justification &amp; pricing</li>
            <li><span className="font-semibold text-foreground/90">Copy talking points</span> into your proposal</li>
          </ol>
        </div>
        </div>

        {/* ── Fit Radar Chart ── */}
        <div className="rounded-xl border border-border bg-white p-5 flex flex-col">
          <h2 className="text-sm font-bold tracking-tight flex items-center gap-2 mb-2">
            <MessageSquare className="w-4 h-4" style={{ color: accent }} />
            Fit Analysis
          </h2>
          <p className="text-[11px] text-muted-foreground mb-3">How well the recommended stack matches your profile across four scoring dimensions</p>
          <div className="flex-1 min-h-0" style={{ minHeight: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: "#6b7280", fontWeight: 600 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#9ca3af" }} axisLine={false} />
                <Radar
                  name="Stack Fit"
                  dataKey="value"
                  stroke={accent}
                  fill={accent}
                  fillOpacity={0.2}
                  strokeWidth={2}
                  dot={{ r: 4, fill: accent, stroke: "#fff", strokeWidth: 2 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          {/* Dimension Scores */}
          <div className="grid grid-cols-4 gap-2 mt-2">
            {radarData.map((d) => (
              <div key={d.axis} className="text-center">
                <div className="text-sm font-bold tabular-nums" style={{ color: accent }}>{d.value}</div>
                <div className="text-[9px] font-semibold uppercase text-muted-foreground">{d.axis}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2: Stack | Summary + Talking Points */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Recommended Stack ── */}
        <div className="space-y-2.5">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground px-1">Recommended Stack</h3>
          {result.stack.map((item) => (
            <StackCard key={item.product.id} item={item} accent={accent} />
          ))}
        </div>

        {/* ── Summary + Talking Points ── */}
        <div className="space-y-5">
          {/* Summary */}
          <div className="rounded-xl border border-border p-5" style={{ background: `linear-gradient(135deg, ${accent}08, ${accent}03, #fff)` }}>
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4" style={{ color: accent }} />
              Summary
            </h3>
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="rounded-lg bg-white/80 border border-border/50 p-2.5 text-center">
                <div className="text-xl font-bold tabular-nums" style={{ color: accent }}>
                  {Math.round(result.stack.reduce((s, i) => s + i.score, 0) / result.stack.length)}
                </div>
                <div className="text-[9px] font-semibold uppercase text-muted-foreground mt-0.5">Avg Score</div>
              </div>
              <div className="rounded-lg bg-white/80 border border-border/50 p-2.5 text-center">
                <div className="text-xl font-bold tabular-nums" style={{ color: accent }}>
                  {result.stack.filter((i) => i.confidence === "Strong").length}/{result.stack.length}
                </div>
                <div className="text-[9px] font-semibold uppercase text-muted-foreground mt-0.5">Strong Fits</div>
              </div>
              <div className="rounded-lg bg-white/80 border border-border/50 p-2.5 text-center">
                <div className="text-xl font-bold tabular-nums" style={{ color: accent }}>
                  {result.stack[0].product.name.split(" ").slice(0, 2).join(" ")}
                </div>
                <div className="text-[9px] font-semibold uppercase text-muted-foreground mt-0.5">Top Pick</div>
              </div>
            </div>
            <p className="text-xs text-foreground/70 leading-relaxed">{result.summary}</p>
          </div>

          {/* Talking Points */}
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-bold tracking-tight flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4" style={{ color: accent }} />
              SA Talking Points
            </h3>
            <ul className="space-y-3">
              {result.talkingPoints.map((tp, i) => {
                const label = i === 0 ? "Compute" : i === 1 ? "Storage" : i === 2 ? "Protection" : i === 3 ? "Industry" : i === 4 ? "Cloud" : "Services";
                return (
                  <li key={i} className="pl-3 text-xs text-foreground/80 leading-snug" style={{ borderLeft: `2px solid ${accent}` }}>
                    <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color: accent }}>{label}</span>
                    <p className="mt-0.5">{tp}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

    </div>
  );
}

// ── Stack Card Component ─────────────────────────────────
function StackCard({ item, accent }: { item: ScoredProduct; accent: string }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[item.product.category];

  // Blend industry accent with confidence intensity
  const color = accent;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white transition-all cursor-pointer",
        expanded ? "shadow-sm" : "border-border"
      )}
      style={{ borderColor: expanded ? `${accent}40` : undefined }}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Category Icon */}
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${color}12` }}
        >
          <Icon className="w-4 h-4" style={{ color }} />
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground truncate">{item.product.name}</span>
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 h-4 font-semibold shrink-0"
              style={{ color, borderColor: `${color}40` }}
            >
              {item.confidence}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground truncate">{item.product.tagline}</p>
        </div>

        {/* Score */}
        <div className="text-right shrink-0">
          <div className="text-lg font-bold tabular-nums" style={{ color }}>{item.score}</div>
          <div className="text-[9px] text-muted-foreground uppercase">Score</div>
        </div>

        {/* Expand Arrow */}
        <ArrowRight className="w-4 h-4 text-muted-foreground transition-transform" style={{ color: expanded ? accent : undefined, transform: expanded ? "rotate(90deg)" : undefined }} />
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-3.5 pb-3.5 pt-1 border-t" style={{ borderColor: `${accent}15` }}>
          <p className="text-xs text-foreground/70 leading-relaxed mb-2">{item.product.justification}</p>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase text-muted-foreground">Est. Price:</span>
            <span className="text-xs font-medium text-foreground">{item.product.priceHint}</span>
          </div>
        </div>
      )}
    </div>
  );
}
