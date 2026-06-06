import { Badge } from "@/components/ui/badge";
import { Database, Server, Globe, BarChart3, Wrench } from "lucide-react";

interface WorkloadPriority {
  name: string;
  potentialSavings: number;
  confidence: number;
  priority: "High" | "Medium" | "Low";
}

const WORKLOAD_ICONS: Record<string, React.ReactNode> = {
  "Legacy Databases": <Database className="w-4 h-4" />,
  "Batch Processing": <Server className="w-4 h-4" />,
  "Web Services": <Globe className="w-4 h-4" />,
  Analytics: <BarChart3 className="w-4 h-4" />,
  "Internal Tools": <Wrench className="w-4 h-4" />,
};

interface Props {
  data: WorkloadPriority[];
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "#159a74",
  Medium: "#c88116",
  Low: "#8a9499",
};

export function RecommendationPriorityTable({ data }: Props) {
  return (
    <div className="chart-container h-full flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">Recommendation Priority</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Workload migration ranking</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        {data.map((item, i) => (
          <div
            key={item.name}
            className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0 hover:bg-secondary/30 rounded-md px-1 -mx-1 transition-colors"
          >
            {/* Rank */}
            <span className="text-[10px] font-bold text-muted-foreground w-4 text-center shrink-0 tabular-nums">
              {i + 1}
            </span>
            {/* Icon */}
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
              style={{ background: `${PRIORITY_COLORS[item.priority] || "#8a9499"}15` }}
            >
              <span style={{ color: PRIORITY_COLORS[item.priority] || "#8a9499" }}>
                {WORKLOAD_ICONS[item.name] || <Server className="w-3.5 h-3.5" />}
              </span>
            </div>
            {/* Name + confidence */}
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-medium text-foreground truncate leading-tight">{item.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{item.confidence}% confidence</p>
            </div>
            {/* Savings */}
            <p className="text-[12px] font-semibold text-foreground tabular-nums shrink-0">
              ${item.potentialSavings.toLocaleString()}<span className="text-[10px] font-normal text-muted-foreground">/mo</span>
            </p>
            {/* Priority badge */}
            <Badge
              variant={
                item.priority === "High" ? "success" : item.priority === "Medium" ? "warning" : "outline"
              }
            >
              {item.priority}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
