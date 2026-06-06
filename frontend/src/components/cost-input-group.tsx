"use client";

import { type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface CostInputGroupProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  helpText?: string;
  step?: number;
  prefix?: string;
  suffix?: string;
  icon?: ReactNode;
  /** 0–100 — drives the subtle background tint intensity */
  weight?: number;
  className?: string;
}

export function CostInputGroup({
  label,
  value,
  onChange,
  helpText,
  step = 250,
  prefix = "$",
  suffix,
  icon,
  weight = 0,
  className,
}: CostInputGroupProps) {
  // Map weight to a subtle background opacity (0–12%)
  const tintOpacity = Math.min(12, Math.round((weight / 100) * 12));

  return (
    <div
      className={cn("rounded-lg p-2.5 space-y-1.5 transition-colors", className)}
      style={{ background: tintOpacity > 0 ? `rgba(59,130,246,${tintOpacity / 100})` : "transparent" }}
    >
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-muted-foreground/70 shrink-0">{icon}</span>}
        <Label className="text-xs font-semibold text-foreground/80 leading-none">{label}</Label>
        {helpText && (
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="w-3 h-3 text-muted-foreground/40 cursor-help" />
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-[220px]">
              {helpText}
            </TooltipContent>
          </Tooltip>
        )}
        {weight > 0 && (
          <span className="ml-auto text-[10px] font-bold tabular-nums text-muted-foreground/60">{weight}%</span>
        )}
      </div>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
            {prefix}
          </span>
        )}
        <Input
          type="number"
          value={value || ""}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className={cn("h-8 text-sm", prefix && "pl-6", suffix && "pr-7")}
          step={step}
          min={0}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
