import { AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: "warning" | "success" | "neutral";
}) {
  const accents = {
    warning: "border-warning/25 bg-warning/5 text-warning",
    success: "border-success/25 bg-success/5 text-success",
    neutral: "border-border bg-surface text-muted-foreground",
  };

  return (
    <div className={cn("flex min-w-0 flex-1 flex-col gap-1 rounded-lg border px-3 py-2.5", accents[accent])}>
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide">
        {icon}
        {label}
      </div>
      <p className="truncate text-[14px] font-bold text-foreground">{value}</p>
    </div>
  );
}

export function GlanceStats({
  openCount,
  resolvedCount,
  lastIssueLabel,
}: {
  openCount: number;
  resolvedCount: number;
  lastIssueLabel?: string;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard
        icon={<AlertCircle className="h-3.5 w-3.5" />}
        label="Open"
        value={String(openCount)}
        accent="warning"
      />
      <StatCard
        icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        label="Resolved"
        value={String(resolvedCount)}
        accent="success"
      />
      <StatCard
        icon={<Clock className="h-3.5 w-3.5" />}
        label="Last issue"
        value={lastIssueLabel ?? "—"}
        accent="neutral"
      />
    </div>
  );
}
