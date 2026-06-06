import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { TCOResult } from "./tco/models";
import type { PlacementRecommendation } from "./tco/recommender";
import type { RecommendationResult } from "./solutions/solution-recommender";
import {
  getCloudMonthlyTotalAfterDiscount,
  getLocalMonthlyTotal,
  getLocalOneTimeTotal,
} from "./tco/models";

interface ReportData {
  company: string;
  customer: string;
  preparedBy: string;
  date: string;
  result: TCOResult;
  recommendation: PlacementRecommendation;
  dellStack: RecommendationResult;
  notes: string;
  months: number;
}

const BLUE = "3B82F6";
const GREEN = "16A34A";
const RED = "DC2626";
const HEADER_BG = "1E293B";
const HEADER_FG = "FFFFFF";

function setHeaderRow(ws: ExcelJS.Worksheet, row: number, headers: string[], widths?: number[]) {
  const hr = ws.getRow(row);
  headers.forEach((h, i) => {
    const cell = hr.getCell(i + 1);
    cell.value = h;
    cell.font = { bold: true, color: { argb: HEADER_FG }, size: 10 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: HEADER_BG } };
    cell.alignment = { horizontal: i === 0 ? "left" : "center" };
    cell.border = { bottom: { style: "thin", color: { argb: "E2E8F0" } } };
  });
  if (widths) widths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });
}

export async function exportExcel(data: ReportData) {
  const wb = new ExcelJS.Workbook();
  wb.creator = data.preparedBy;
  wb.created = new Date();

  const { result, recommendation, dellStack, months } = data;
  const cloudTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].cloudCumulative : 0;
  const localTCO = result.rows.length > 0 ? result.rows[result.rows.length - 1].localCumulative : 0;
  const savings = cloudTCO - localTCO;
  const savingsPct = cloudTCO > 0 ? ((savings / cloudTCO) * 100).toFixed(1) : "0";
  const cloudMonthly = getCloudMonthlyTotalAfterDiscount(result.cloud);
  const localMonthly = getLocalMonthlyTotal(result.local);
  const localOneTime = getLocalOneTimeTotal(result.local);

  // ── Sheet 1: Executive Summary ──
  const summary = wb.addWorksheet("Summary", { views: [{ showGridLines: false }] });
  summary.getColumn(1).width = 24;
  summary.getColumn(2).width = 42;

  summary.mergeCells("A1:B1");
  const titleCell = summary.getCell("A1");
  titleCell.value = "TCO Repatriation Analysis";
  titleCell.font = { size: 18, bold: true, color: { argb: HEADER_BG } };
  titleCell.alignment = { horizontal: "left" };
  summary.getRow(1).height = 30;

  summary.mergeCells("A2:B2");
  summary.getCell("A2").value = "Cloud-to-Local Infrastructure Cost Comparison & Recommendation";
  summary.getCell("A2").font = { size: 10, italic: true, color: { argb: "64748B" } };

  const meta = [
    ["Company", data.company],
    ["Customer", data.customer],
    ["Prepared By", data.preparedBy],
    ["Date", data.date],
    ["Projection", `${months} months`],
  ];
  meta.forEach(([label, value], i) => {
    const row = summary.getRow(i + 4);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, size: 10, color: { argb: "64748B" } };
    row.getCell(2).value = value;
    row.getCell(2).font = { size: 10 };
  });

  const findingsStart = 4 + meta.length + 1;
  summary.mergeCells(`A${findingsStart}:B${findingsStart}`);
  const fh = summary.getCell(`A${findingsStart}`);
  fh.value = "KEY FINDINGS";
  fh.font = { size: 12, bold: true, color: { argb: HEADER_BG } };

  const findings = [
    ["Cloud TCO (Total)", `$${cloudTCO.toLocaleString()}`],
    ["Local TCO (Total)", `$${localTCO.toLocaleString()}`],
    ["Net Savings", `$${savings.toLocaleString()} (${savingsPct}%)`],
    ["Break-even Month", result.breakEvenMonth ? `Month ${result.breakEvenMonth}` : "Not reached"],
    ["Cloud Run-rate", `$${Math.round(cloudMonthly).toLocaleString()}/mo`],
    ["Local Run-rate", `$${Math.round(localMonthly).toLocaleString()}/mo`],
    ["Local One-time", `$${localOneTime.toLocaleString()}`],
    ["Recommendation", `${recommendation.label} (${recommendation.confidence} confidence)`],
  ];
  findings.forEach(([label, value], i) => {
    const row = summary.getRow(findingsStart + 1 + i);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, size: 10, color: { argb: "64748B" } };
    row.getCell(2).value = value;
    row.getCell(2).font = { size: 10, bold: true };
  });

  const stackStart = findingsStart + findings.length + 2;
  summary.mergeCells(`A${stackStart}:B${stackStart}`);
  summary.getCell(`A${stackStart}`).value = "DELL RECOMMENDED STACK";
  summary.getCell(`A${stackStart}`).font = { size: 12, bold: true, color: { argb: HEADER_BG } };

  dellStack.stack.forEach((item, i) => {
    const row = summary.getRow(stackStart + 1 + i);
    row.getCell(1).value = item.product.category;
    row.getCell(1).font = { bold: true, size: 10, color: { argb: "64748B" } };
    row.getCell(2).value = `${item.product.name} (Score: ${item.score}, ${item.confidence})`;
    row.getCell(2).font = { size: 10 };
  });

  const notesStart = stackStart + dellStack.stack.length + 2;
  summary.mergeCells(`A${notesStart}:B${notesStart}`);
  summary.getCell(`A${notesStart}`).value = "NEXT STEPS";
  summary.getCell(`A${notesStart}`).font = { size: 12, bold: true, color: { argb: HEADER_BG } };

  data.notes.split("\n").filter(Boolean).forEach((note, i) => {
    const row = summary.getRow(notesStart + 1 + i);
    summary.mergeCells(`A${notesStart + 1 + i}:B${notesStart + 1 + i}`);
    row.getCell(1).value = `• ${note}`;
    row.getCell(1).font = { size: 10 };
  });

  // ── Sheet 2: Cost Comparison ──
  const costSheet = wb.addWorksheet("Cost Comparison");
  setHeaderRow(costSheet, 1, ["Cost Component", "Cloud", "Local"], [22, 18, 18]);

  const costData = [
    ["Monthly Run-rate", Math.round(cloudMonthly), Math.round(localMonthly)],
    ["One-time Capital Cost", 0, localOneTime],
    ["Annual Growth Rate", result.cloud.annualGrowthRatePct / 100, result.local.annualGrowthRatePct / 100],
  ];
  costData.forEach((d, i) => {
    const row = costSheet.getRow(i + 2);
    row.getCell(1).value = d[0] as string;
    row.getCell(1).font = { bold: true, size: 10 };
    row.getCell(2).value = d[1] as number;
    row.getCell(2).numFmt = i === 2 ? "0.0%" : "$#,##0";
    row.getCell(2).font = { size: 10, color: { argb: BLUE } };
    row.getCell(2).alignment = { horizontal: "center" };
    row.getCell(3).value = d[2] as number;
    row.getCell(3).numFmt = i === 2 ? "0.0%" : "$#,##0";
    row.getCell(3).font = { size: 10, color: { argb: GREEN } };
    row.getCell(3).alignment = { horizontal: "center" };
  });

  // Total row
  const totalRow = costSheet.getRow(costData.length + 2);
  totalRow.getCell(1).value = `Total TCO (${months} months)`;
  totalRow.getCell(1).font = { bold: true, size: 10 };
  totalRow.getCell(2).value = Math.round(cloudTCO);
  totalRow.getCell(2).numFmt = "$#,##0";
  totalRow.getCell(2).font = { bold: true, size: 10, color: { argb: BLUE } };
  totalRow.getCell(2).alignment = { horizontal: "center" };
  totalRow.getCell(3).value = Math.round(localTCO);
  totalRow.getCell(3).numFmt = "$#,##0";
  totalRow.getCell(3).font = { bold: true, size: 10, color: { argb: GREEN } };
  totalRow.getCell(3).alignment = { horizontal: "center" };
  const topBorder = { top: { style: "medium" as const, color: { argb: HEADER_BG } } };
  totalRow.getCell(1).border = topBorder;
  totalRow.getCell(2).border = topBorder;
  totalRow.getCell(3).border = topBorder;

  // ── Sheet 3: Quarterly Projection ──
  const qSheet = wb.addWorksheet("Quarterly Projection");
  setHeaderRow(qSheet, 1, ["Quarter", "Month", "Cloud Cumulative", "Local Cumulative", "Delta", "Status"], [10, 10, 18, 18, 16, 14]);

  for (let q = 1; q <= Math.ceil(months / 3); q++) {
    const m = Math.min(q * 3, months);
    const row = result.rows[m - 1];
    if (!row) continue;
    const delta = row.cloudCumulative - row.localCumulative;
    const status = delta > 0 ? "Local wins" : delta < 0 ? "Cloud wins" : "Break even";
    const r = qSheet.getRow(q + 1);
    r.getCell(1).value = `Q${q}`;
    r.getCell(1).alignment = { horizontal: "center" };
    r.getCell(2).value = m;
    r.getCell(2).alignment = { horizontal: "center" };
    r.getCell(3).value = Math.round(row.cloudCumulative);
    r.getCell(3).numFmt = "$#,##0";
    r.getCell(3).font = { color: { argb: BLUE } };
    r.getCell(4).value = Math.round(row.localCumulative);
    r.getCell(4).numFmt = "$#,##0";
    r.getCell(4).font = { color: { argb: GREEN } };
    r.getCell(5).value = Math.round(delta);
    r.getCell(5).numFmt = "$#,##0";
    r.getCell(5).font = { color: { argb: delta >= 0 ? GREEN : RED }, bold: true };
    r.getCell(6).value = status;
    r.getCell(6).alignment = { horizontal: "center" };
    r.getCell(6).font = { size: 9, bold: true, color: { argb: delta > 0 ? GREEN : delta < 0 ? RED : "64748B" } };
    if (q % 2 === 0) {
      [1, 2, 3, 4, 5, 6].forEach((c) => {
        r.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
      });
    }
  }

  // ── Sheet 4: Yearly Summary ──
  const ySheet = wb.addWorksheet("Yearly Summary");
  setHeaderRow(ySheet, 1, ["Year", "Cloud Annual Cost", "Local Annual Cost", "Cumulative Delta"], [10, 20, 20, 20]);

  for (let y = 1; y <= Math.ceil(months / 12); y++) {
    const endM = Math.min(y * 12, months);
    const startM = (y - 1) * 12 + 1;
    const endRow = result.rows[endM - 1];
    const startRow = startM > 1 ? result.rows[startM - 2] : null;
    if (!endRow) continue;
    const cloudAnnual = endRow.cloudCumulative - (startRow?.cloudCumulative ?? 0);
    const localAnnual = endRow.localCumulative - (startRow?.localCumulative ?? 0);
    const cumDelta = endRow.cloudCumulative - endRow.localCumulative;

    const r = ySheet.getRow(y + 1);
    r.getCell(1).value = `Year ${y}`;
    r.getCell(1).alignment = { horizontal: "center" };
    r.getCell(1).font = { bold: true };
    r.getCell(2).value = Math.round(cloudAnnual);
    r.getCell(2).numFmt = "$#,##0";
    r.getCell(2).font = { color: { argb: BLUE }, bold: true };
    r.getCell(3).value = Math.round(localAnnual);
    r.getCell(3).numFmt = "$#,##0";
    r.getCell(3).font = { color: { argb: GREEN }, bold: true };
    r.getCell(4).value = Math.round(cumDelta);
    r.getCell(4).numFmt = "$#,##0";
    r.getCell(4).font = { color: { argb: cumDelta >= 0 ? GREEN : RED }, bold: true };
  }

  // ── Sheet 5: Monthly Projection (full data) ──
  const projSheet = wb.addWorksheet("Monthly Projection");
  setHeaderRow(projSheet, 1, ["Month", "Cloud Monthly", "Local Monthly", "Cloud Cumulative", "Local Cumulative", "Delta"], [10, 16, 16, 18, 18, 14]);

  result.rows.forEach((r, i) => {
    const row = projSheet.getRow(i + 2);
    row.getCell(1).value = r.month;
    row.getCell(1).alignment = { horizontal: "center" };
    row.getCell(2).value = Math.round(r.cloudMonthly);
    row.getCell(2).numFmt = "$#,##0";
    row.getCell(3).value = Math.round(r.localMonthly);
    row.getCell(3).numFmt = "$#,##0";
    row.getCell(4).value = Math.round(r.cloudCumulative);
    row.getCell(4).numFmt = "$#,##0";
    row.getCell(5).value = Math.round(r.localCumulative);
    row.getCell(5).numFmt = "$#,##0";
    row.getCell(6).value = Math.round(r.cloudCumulative - r.localCumulative);
    row.getCell(6).numFmt = "$#,##0";
    row.getCell(6).font = { color: { argb: r.cloudCumulative - r.localCumulative >= 0 ? GREEN : RED } };
    if (i % 2 === 0) {
      [1, 2, 3, 4, 5, 6].forEach((c) => {
        row.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "F8FAFC" } };
      });
    }
  });

  // ── Save ──
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `tco-brief-${data.customer.replace(/\s+/g, "-").toLowerCase()}-${data.date}.xlsx`);
}
