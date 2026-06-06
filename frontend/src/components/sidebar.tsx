"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, SlidersHorizontal, BarChart3, FileText, ChevronLeft, ChevronRight, Zap } from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "inputs", label: "Cost Inputs", icon: SlidersHorizontal },
  { id: "analysis", label: "Solution Recommender", icon: BarChart3 },
  { id: "report", label: "Report", icon: FileText },
] as const;

export type NavSection = (typeof NAV_ITEMS)[number]["id"];

interface SidebarProps {
  activeSection: NavSection;
  onSectionChange: (s: NavSection) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ activeSection, onSectionChange, collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-white border-r border-border transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[68px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center gap-2.5 px-4 h-16 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Zap className="w-4 h-4" />
        </div>
        {!collapsed && <span className="font-bold text-base tracking-tight">TCO Dashboard</span>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn("sidebar-link w-full", activeSection === item.id && "sidebar-link-active")}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="px-3 py-3 border-t border-border">
        <button onClick={onToggle} className="sidebar-link w-full justify-center">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
