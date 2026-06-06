"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Printer, Download } from "lucide-react";
import type { TCOResult } from "@/lib/tco/models";
import type { PlacementRecommendation } from "@/lib/tco/recommender";
import type { CloudCostAssumptions, LocalCostAssumptions } from "@/lib/tco/models";
import {
  getCloudMonthlyTotalAfterDiscount,
  getLocalMonthlyTotal,
  getLocalOneTimeTotal,
} from "@/lib/tco/models";
import { recommendSolution, type RecommendationResult } from "@/lib/solutions/solution-recommender";
import {
  type CustomerProfile,
  CUSTOMER_SCENARIOS,
} from "@/lib/solutions/solution-catalog";
import { formatMoney } from "@/lib/utils";
import { exportExcel } from "@/lib/excel-export";

interface Props {
  result: TCOResult;
  recommendation: PlacementRecommendation;
  cloud: CloudCostAssumptions;
  local: LocalCostAssumptions;
  months: number;
}

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`;

const fmtFull = (n: number) => `$${Math.round(n).toLocaleString()}`;

const defaultScenarioKey = Object.keys(CUSTOMER_SCENARIOS)[0];
const defaultScenario = CUSTOMER_SCENARIOS[defaultScenarioKey];

export function ReportSection({ result, recommendation, cloud, local, months }: Props) {
  const [company, setCompany] = useState("Your Company");
  const [customer, setCustomer] = useState("Customer Name");
  const [preparedBy, setPreparedBy] = useState("Solutions Architect");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const [profile, setProfile] = useState<CustomerProfile>({ ...defaultScenario });
  const [selectedScenario, setSelectedScenario] = useState(defaultScenarioKey);

  const applyScenario = (key: string) => {
    const s = CUSTOMER_SCENARIOS[key];
    if (!s) return;
    setSelectedScenario(key);
    setProfile({ ...s });
  };

  const [notes, setNotes] = useState(
    "Validate cloud billing against current invoices.\nConfirm local subscription pricing with Dell quote.\nSchedule technical deep-dive for migration planning."
  );

  const cloudTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].cloudCumulative : 0;
  const localTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].localCumulative : 0;
  const savings = cloudTCO - localTCO;
  const savingsPct = cloudTCO > 0 ? ((savings / cloudTCO) * 100).toFixed(1) : "0";
  const cloudMonthly = useMemo(() => getCloudMonthlyTotalAfterDiscount(cloud), [cloud]);
  const localMonthly = useMemo(() => getLocalMonthlyTotal(local), [local]);
  const localOneTime = useMemo(() => getLocalOneTimeTotal(local), [local]);

  const dellStack: RecommendationResult = useMemo(() => recommendSolution(profile), [profile]);

  const handlePrint = () => window.print();

  /* ── CSV export ── */
  const downloadCSV = () => {
    const lines: string[] = [];
    lines.push("TCO REPATRIATION ANALYSIS — EXECUTIVE BRIEF");
    lines.push(`Company,${company}`);
    lines.push(`Customer,${customer}`);
    lines.push(`Prepared By,${preparedBy}`);
    lines.push(`Date,${date}`);
    lines.push(`Projection Window,${months} months`);
    lines.push("");
    lines.push("KEY FINDINGS");
    lines.push(`Cloud TCO (total),${fmt(cloudTCO)}`);
    lines.push(`Local TCO (total),${fmt(localTCO)}`);
    lines.push(`Net Savings,${fmt(savings)} (${savingsPct}%)`);
    lines.push(`Break-even Month,${result.breakEvenMonth ?? "Not reached"}`);
    lines.push(`Cloud Monthly Run-rate,${fmt(cloudMonthly)}`);
    lines.push(`Local Monthly Run-rate,${fmt(localMonthly)}`);
    lines.push(`Local One-time Cost,${fmt(localOneTime)}`);
    lines.push(`Recommendation,${recommendation.label} (${recommendation.confidence} confidence)`);
    lines.push("");
    lines.push("DELL RECOMMENDED STACK");
    lines.push("Category,Product,Score,Confidence,Tagline");
    dellStack.stack.forEach((item) => {
      lines.push(`${item.product.category},${item.product.name},${item.score},${item.confidence},"${item.product.tagline}"`);
    });
    lines.push("");
    lines.push("QUARTERLY PROJECTION");
    lines.push("Quarter,Cloud Cumulative,Local Cumulative,Delta,Status");
    for (let q = 1; q <= Math.ceil(months / 3); q++) {
      const m = Math.min(q * 3, months);
      const row = result.rows[m - 1];
      if (!row) continue;
      const delta = row.cloudCumulative - row.localCumulative;
      const status = delta > 0 ? "Local wins" : delta < 0 ? "Cloud wins" : "Break even";
      lines.push(`Q${q} (Mo ${m}),${fmt(row.cloudCumulative)},${fmt(row.localCumulative)},${fmt(Math.abs(delta))},${status}`);
    }
    lines.push("");
    lines.push("YEARLY SUMMARY");
    lines.push("Year,Cloud Annual,Local Annual,Cumulative Delta");
    for (let y = 1; y <= Math.ceil(months / 12); y++) {
      const endM = Math.min(y * 12, months);
      const startM = (y - 1) * 12 + 1;
      const endRow = result.rows[endM - 1];
      const startRow = startM > 1 ? result.rows[startM - 2] : null;
      if (!endRow) continue;
      const cloudAnnual = endRow.cloudCumulative - (startRow?.cloudCumulative ?? 0);
      const localAnnual = endRow.localCumulative - (startRow?.localCumulative ?? 0);
      lines.push(`Year ${y},${fmt(cloudAnnual)},${fmt(localAnnual)},${fmt(endRow.cloudCumulative - endRow.localCumulative)}`);
    }
    lines.push("");
    lines.push("NEXT STEPS");
    notes.split("\n").filter(Boolean).forEach((n) => lines.push(`• ${n}`));
    lines.push("");
    lines.push("Generated by TCO Repatriation Dashboard");

    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tco-brief-${customer.replace(/\s+/g, "-").toLowerCase()}-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadExcel = async () => {
    await exportExcel({
      company, customer, preparedBy, date, result, recommendation, dellStack, notes, months,
    });
  };

  const quarterlyRows = useMemo(() => {
    const rows: { quarter: number; month: number; cloudCum: number; localCum: number; delta: number }[] = [];
    for (let q = 1; q <= Math.ceil(months / 3); q++) {
      const m = Math.min(q * 3, months);
      const row = result.rows[m - 1];
      if (!row) continue;
      rows.push({ quarter: q, month: m, cloudCum: row.cloudCumulative, localCum: row.localCumulative, delta: row.cloudCumulative - row.localCumulative });
    }
    return rows;
  }, [result.rows, months]);

  const yearlyRows = useMemo(() => {
    const rows: { year: number; cloudAnnual: number; localAnnual: number; cumDelta: number }[] = [];
    for (let y = 1; y <= Math.ceil(months / 12); y++) {
      const endM = Math.min(y * 12, months);
      const startM = (y - 1) * 12 + 1;
      const endRow = result.rows[endM - 1];
      const startRow = startM > 1 ? result.rows[startM - 2] : null;
      if (!endRow) continue;
      rows.push({
        year: y,
        cloudAnnual: endRow.cloudCumulative - (startRow?.cloudCumulative ?? 0),
        localAnnual: endRow.localCumulative - (startRow?.localCumulative ?? 0),
        cumDelta: endRow.cloudCumulative - endRow.localCumulative,
      });
    }
    return rows;
  }, [result.rows, months]);

  /* Shared input style — clearly editable */
  const inputCls = "h-8 text-xs border border-foreground/25 rounded-md px-2.5 bg-foreground/[0.03] hover:bg-foreground/[0.06] transition-colors focus-visible:ring-1 focus-visible:ring-primary/40";

  return (
    <>
      <style>{`
        @media print {
          body, html { -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; overflow: visible !important; height: auto !important; }
          .no-print { display: none !important; }
          aside, nav, [data-sidebar] { display: none !important; }
          header:not(.rpt-header) { display: none !important; }
          main, .flex-1 { overflow: visible !important; height: auto !important; padding: 0 !important; margin: 0 !important; }
          [class*="overflow"] { overflow: visible !important; }
          .report-doc { padding: 0 !important; max-width: 100% !important; width: 100% !important; margin: 0 !important; font-size: 11px !important; }
          .report-doc h1 { font-size: 18px !important; }
          .report-doc h2 { font-size: 12px !important; margin-top: 12px !important; }
          .report-doc table { font-size: 9.5px !important; }
          .report-doc table th, .report-doc table td { padding: 3px 6px !important; }
          .report-doc input, .report-doc textarea { border: none !important; background: transparent !important; box-shadow: none !important; padding: 0 !important; font-weight: 600 !important; font-size: 11px !important; height: auto !important; min-height: 0 !important; }
          .report-doc input:focus, .report-doc textarea:focus { outline: none !important; }
          .report-doc [role="combobox"] { display: none !important; }
          .report-doc table { break-inside: avoid; page-break-inside: avoid; }
          .report-doc h2 { break-after: avoid; page-break-after: avoid; }
          .report-doc section { break-inside: avoid; page-break-inside: avoid; }
          .report-doc p { margin-top: 3px !important; margin-bottom: 3px !important; }
          .report-doc section { margin-bottom: 6px !important; }
          @page { size: A4; margin: 12mm 15mm; }
        }
      `}</style>

      <div className="w-full report-doc" style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
        {/* ── Action Bar (hidden on print) ── */}
        <div className="no-print flex items-center justify-between mb-6" style={{ fontFamily: "system-ui, sans-serif" }}>
          <p className="text-xs text-muted-foreground">
            Fill in the fields below, then print or export the report.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadExcel}>
              <Download className="w-4 h-4 mr-1.5" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={downloadCSV}>
              <Download className="w-4 h-4 mr-1.5" />
              Export CSV
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1.5" />
              Print / Save PDF
            </Button>
          </div>
        </div>

        {/* ── TITLE BLOCK ── */}
        <header className="rpt-header border-b-2 border-foreground pb-4 mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-foreground mb-1">
            TCO Repatriation Analysis
          </h1>
          <p className="text-sm text-foreground/60 italic mb-4">
            Cloud-to-Local Infrastructure Cost Comparison &amp; Recommendation
          </p>
          <div className="grid grid-cols-4 gap-5 text-xs" style={{ fontFamily: "system-ui, sans-serif" }}>
            <div className="space-y-1">
              <Label className="text-[9px] font-semibold uppercase tracking-widest text-foreground/50">Company</Label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-semibold uppercase tracking-widest text-foreground/50">Customer</Label>
              <Input value={customer} onChange={(e) => setCustomer(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-semibold uppercase tracking-widest text-foreground/50">Prepared By</Label>
              <Input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)} className={inputCls} />
            </div>
            <div className="space-y-1">
              <Label className="text-[9px] font-semibold uppercase tracking-widest text-foreground/50">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
            </div>
          </div>
        </header>

        {/* ── 1. EXECUTIVE SUMMARY ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
            1. Executive Summary
          </h2>
          <p className="text-xs text-foreground/80 leading-relaxed mb-3">
            This analysis compares the total cost of ownership (TCO) for public cloud infrastructure versus
            on-premises local infrastructure over a <strong>{months}-month projection window</strong>.
            The assessment considers monthly operational costs, one-time capital expenditures, and projected
            annual growth rates to determine the most cost-effective deployment strategy.
          </p>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="text-left font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Metric</th>
                <th className="text-right font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Value</th>
                <th className="text-left font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Assessment</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground/10">
                <td className="py-1.5 px-3 font-medium">Cloud TCO (Total)</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-bold text-blue-700">{fmtFull(cloudTCO)}</td>
                <td className="py-1.5 px-3 text-foreground/60">{fmtFull(Math.round(cloudMonthly))}/mo run-rate</td>
              </tr>
              <tr className="border-b border-foreground/10 bg-foreground/[0.02]">
                <td className="py-1.5 px-3 font-medium">Local TCO (Total)</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-bold text-emerald-700">{fmtFull(localTCO)}</td>
                <td className="py-1.5 px-3 text-foreground/60">{fmtFull(Math.round(localMonthly))}/mo + {fmtFull(localOneTime)} one-time</td>
              </tr>
              <tr className="border-b border-foreground/10">
                <td className="py-1.5 px-3 font-medium">Net Savings</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-bold" style={{ color: savings >= 0 ? "#16a34a" : "#dc2626" }}>
                  {savings >= 0 ? fmtFull(savings) : `(${fmtFull(Math.abs(savings))})`}
                </td>
                <td className="py-1.5 px-3 text-foreground/60">{savingsPct}% of cloud TCO</td>
              </tr>
              <tr className="border-b border-foreground/10 bg-foreground/[0.02]">
                <td className="py-1.5 px-3 font-medium">Break-even Point</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-bold">{result.breakEvenMonth ? `Month ${result.breakEvenMonth}` : "N/A"}</td>
                <td className="py-1.5 px-3 text-foreground/60">{result.breakEvenMonth ? `Within ${months}-month window` : "Not reached in projection"}</td>
              </tr>
              <tr>
                <td className="py-1.5 px-3 font-medium">Recommendation</td>
                <td className="py-1.5 px-3 text-right font-bold" colSpan={2}>{recommendation.label} — {recommendation.confidence} confidence</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── 2. FINANCIAL PERFORMANCE ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
            2. Financial Performance Comparison
          </h2>
          <p className="text-xs text-foreground/80 leading-relaxed mb-3">
            The following table summarizes the principal cost components for each deployment model.
            Public cloud costs include compute, storage, networking, and applicable growth rates.
            Local infrastructure costs include subscription fees, one-time capital expenditure, and operational overhead.
          </p>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="text-left font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Cost Component</th>
                <th className="text-right font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Cloud</th>
                <th className="text-right font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Local</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground/10">
                <td className="py-1.5 px-3 font-medium">Monthly Run-rate</td>
                <td className="py-1.5 px-3 text-right tabular-nums text-blue-700 font-semibold">{fmtFull(Math.round(cloudMonthly))}</td>
                <td className="py-1.5 px-3 text-right tabular-nums text-emerald-700 font-semibold">{fmtFull(Math.round(localMonthly))}</td>
              </tr>
              <tr className="border-b border-foreground/10 bg-foreground/[0.02]">
                <td className="py-1.5 px-3 font-medium">One-time Capital Cost</td>
                <td className="py-1.5 px-3 text-right tabular-nums text-foreground/50">—</td>
                <td className="py-1.5 px-3 text-right tabular-nums text-emerald-700 font-semibold">{fmtFull(localOneTime)}</td>
              </tr>
              <tr className="border-b border-foreground/10">
                <td className="py-1.5 px-3 font-medium">Annual Growth Rate</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-semibold">{result.cloud.annualGrowthRatePct}%</td>
                <td className="py-1.5 px-3 text-right tabular-nums font-semibold">{result.local.annualGrowthRatePct}%</td>
              </tr>
              <tr className="border-t-2 border-foreground/30 font-bold">
                <td className="py-1.5 px-3">Total TCO ({months} months)</td>
                <td className="py-1.5 px-3 text-right tabular-nums text-blue-700">{fmtFull(cloudTCO)}</td>
                <td className="py-1.5 px-3 text-right tabular-nums text-emerald-700">{fmtFull(localTCO)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── 3. QUARTERLY PROJECTION ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
            3. Quarterly Cost Projection
          </h2>
          <p className="text-xs text-foreground/80 leading-relaxed mb-3">
            Cumulative cost comparison at each quarter end. A positive delta indicates that local infrastructure
            delivers cost savings relative to public cloud.
          </p>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="text-center font-semibold py-1.5 px-2" style={{ fontSize: "10px" }}>Quarter</th>
                <th className="text-center font-semibold py-1.5 px-2" style={{ fontSize: "10px" }}>Month</th>
                <th className="text-right font-semibold py-1.5 px-2" style={{ fontSize: "10px" }}>Cloud Cumulative</th>
                <th className="text-right font-semibold py-1.5 px-2" style={{ fontSize: "10px" }}>Local Cumulative</th>
                <th className="text-right font-semibold py-1.5 px-2" style={{ fontSize: "10px" }}>Delta</th>
                <th className="text-center font-semibold py-1.5 px-2" style={{ fontSize: "10px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {quarterlyRows.map((r, i) => (
                <tr key={r.quarter} className={`border-b border-foreground/10 ${i % 2 === 1 ? "bg-foreground/[0.02]" : ""}`}>
                  <td className="py-1 px-2 text-center font-medium">Q{r.quarter}</td>
                  <td className="py-1 px-2 text-center tabular-nums">{r.month}</td>
                  <td className="py-1 px-2 text-right tabular-nums text-blue-700">{fmtFull(r.cloudCum)}</td>
                  <td className="py-1 px-2 text-right tabular-nums text-emerald-700">{fmtFull(r.localCum)}</td>
                  <td className="py-1 px-2 text-right tabular-nums font-semibold" style={{ color: r.delta >= 0 ? "#16a34a" : "#dc2626" }}>
                    {r.delta >= 0 ? fmtFull(r.delta) : `(${fmtFull(Math.abs(r.delta))})`}
                  </td>
                  <td className="py-1 px-2 text-center">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${r.delta > 0 ? "bg-green-100 text-green-800" : r.delta < 0 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"}`}>
                      {r.delta > 0 ? "Local wins" : r.delta < 0 ? "Cloud wins" : "Break even"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 4. YEARLY SUMMARY ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
            4. Annual Summary
          </h2>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="text-center font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Year</th>
                <th className="text-right font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Cloud Annual Cost</th>
                <th className="text-right font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Local Annual Cost</th>
                <th className="text-right font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Cumulative Delta</th>
              </tr>
            </thead>
            <tbody>
              {yearlyRows.map((r, i) => (
                <tr key={r.year} className={`border-b border-foreground/10 ${i % 2 === 1 ? "bg-foreground/[0.02]" : ""}`}>
                  <td className="py-1.5 px-3 text-center font-medium">Year {r.year}</td>
                  <td className="py-1.5 px-3 text-right tabular-nums text-blue-700 font-semibold">{fmtFull(r.cloudAnnual)}</td>
                  <td className="py-1.5 px-3 text-right tabular-nums text-emerald-700 font-semibold">{fmtFull(r.localAnnual)}</td>
                  <td className="py-1.5 px-3 text-right tabular-nums font-bold" style={{ color: r.cumDelta >= 0 ? "#16a34a" : "#dc2626" }}>
                    {r.cumDelta >= 0 ? fmtFull(r.cumDelta) : `(${fmtFull(Math.abs(r.cumDelta))})`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 5. DELL RECOMMENDED STACK ── */}
        <section className="mb-6">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
              5. Dell Recommended Stack
            </h2>
            <div className="no-print flex items-center gap-3 mb-1 shrink-0" style={{ fontFamily: "system-ui, sans-serif" }}>
              <span className="text-[10px] font-semibold uppercase text-muted-foreground">Scenario</span>
              <Select value={selectedScenario} onValueChange={applyScenario}>
                <SelectTrigger className="w-[260px] h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(CUSTOMER_SCENARIOS).map((key) => (
                    <SelectItem key={key} value={key}>{CUSTOMER_SCENARIOS[key].name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-foreground/80 leading-relaxed mb-3">
            Based on the customer profile and workload requirements, the following Dell Technologies solutions
            are recommended for the local infrastructure deployment.
          </p>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="text-left font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Category</th>
                <th className="text-left font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Product</th>
                <th className="text-center font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Score</th>
                <th className="text-center font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Confidence</th>
                <th className="text-left font-semibold py-1.5 px-3" style={{ fontSize: "10px" }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {dellStack.stack.map((item, i) => (
                <tr key={item.product.id} className={`border-b border-foreground/10 ${i % 2 === 1 ? "bg-foreground/[0.02]" : ""}`}>
                  <td className="py-1.5 px-3 font-medium text-foreground/70">{item.product.category}</td>
                  <td className="py-1.5 px-3 font-bold">{item.product.name}</td>
                  <td className="py-1.5 px-3 text-center tabular-nums font-semibold">{item.score}</td>
                  <td className="py-1.5 px-3 text-center">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.confidence === "Strong" ? "bg-green-100 text-green-800" : item.confidence === "Good" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {item.confidence}
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-foreground/60">{item.product.tagline}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── 6. NEXT STEPS ── */}
        <section className="mb-6">
          <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
            6. Recommended Next Steps
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-xs text-foreground/80 leading-relaxed pl-1">
            {notes.split("\n").filter(Boolean).map((note, i) => (
              <li key={i}>
                <Input
                  value={note}
                  onChange={(e) => {
                    const updated = notes.split("\n");
                    updated[i] = e.target.value;
                    setNotes(updated.join("\n"));
                  }}
                  className={inputCls + " w-[85%]"}
                  style={{ fontFamily: "'Georgia', serif" }}
                />
              </li>
            ))}
          </ol>
        </section>

        {/* ── 7. NOTES ── */}
        <section className="mb-4">
          <h2 className="text-sm font-bold text-foreground border-b border-foreground/15 pb-1 mb-3 uppercase tracking-wide">
            7. Notes and Disclaimers
          </h2>
          <ol className="list-decimal list-inside space-y-1 text-[11px] text-foreground/60 leading-relaxed pl-1">
            <li>Validate public cloud values against current billing and committed-use discounts.</li>
            <li>Confirm local subscription pricing with Dell vendor quotes.</li>
            <li>Include migration, support, backup, DR, facility, and operations labor in the local TCO estimate.</li>
            <li>Treat this output as a planning estimate, not a procurement quote.</li>
          </ol>
        </section>

        {/* ── Footer ── */}
        <footer className="border-t border-foreground/15 pt-2 mt-4">
          <p className="text-[9px] text-foreground/40 text-center italic">
            Generated by TCO Repatriation Dashboard — {company} — {date}
          </p>
        </footer>
      </div>
    </>
  );
}
