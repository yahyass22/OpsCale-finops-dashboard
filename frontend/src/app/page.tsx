"use client";

import { useState, useMemo, useCallback } from "react";
import { Sidebar, type NavSection } from "@/components/sidebar";
import { DashboardSection } from "@/components/sections/dashboard-section";
import { InputsSection } from "@/components/sections/inputs-section";
import { SolutionRecommenderSection } from "@/components/sections/solution-recommender-section";
import { ReportSection } from "@/components/sections/report-section";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { calculateTCO } from "@/lib/tco/calculator";
import { recommendPlacement } from "@/lib/tco/recommender";
import { PRESETS } from "@/lib/tco/presets";
import type { CloudCostAssumptions, LocalCostAssumptions } from "@/lib/tco/models";

const SECTION_TITLES: Record<NavSection, string> = {
  dashboard: "Dashboard Overview",
  inputs: "Cost Inputs",
  analysis: "Solution Recommender",
  report: "Report",
};

const defaultPreset = PRESETS["Steady VM estate"];

export default function Home() {
  const [activeSection, setActiveSection] = useState<NavSection>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState("Steady VM estate");
  const [months, setMonths] = useState(36);
  const [cloud, setCloud] = useState<CloudCostAssumptions>({ ...defaultPreset.cloud });
  const [local, setLocal] = useState<LocalCostAssumptions>({ ...defaultPreset.local });

  const result = useMemo(() => calculateTCO(cloud, local, months), [cloud, local, months]);
  const recommendation = useMemo(() => recommendPlacement(result), [result]);

  const applyPreset = useCallback((name: string) => {
    const p = PRESETS[name];
    if (!p) return;
    setSelectedPreset(name);
    setCloud({ ...p.cloud });
    setLocal({ ...p.local });
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((p) => !p)}
        />

        <div
          className={cn(
            "flex flex-1 flex-col transition-all duration-300",
            sidebarCollapsed ? "ml-[68px]" : "ml-[240px]"
          )}
        >
          {/* Top bar */}
          <header className="sticky top-0 z-30 flex items-center justify-between gap-4 h-16 px-6 border-b border-border bg-white/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight">{SECTION_TITLES[activeSection]}</h1>
            </div>

            <div className="flex items-center gap-5">
              {/* Preset selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Scenario</span>
                <Select value={selectedPreset} onValueChange={applyPreset}>
                  <SelectTrigger className="w-[200px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(PRESETS).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Projection slider */}
              <div className="flex items-center gap-3 min-w-[220px]">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap">Window</span>
                <Slider
                  value={[months]}
                  onValueChange={(v) => setMonths(v[0])}
                  min={12}
                  max={60}
                  step={6}
                  className="w-[120px]"
                />
                <span className="text-sm font-semibold tabular-nums w-[16px]">{months}</span>
                <span className="text-xs text-muted-foreground">mo</span>
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeSection === "dashboard" && (
              <DashboardSection result={result} recommendation={recommendation} />
            )}
            {activeSection === "inputs" && (
              <InputsSection cloud={cloud} local={local} onCloudChange={setCloud} onLocalChange={setLocal} />
            )}
            {activeSection === "analysis" && <SolutionRecommenderSection />}
            {activeSection === "report" && (
              <ReportSection result={result} recommendation={recommendation} cloud={cloud} local={local} months={months} />
            )}
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}
