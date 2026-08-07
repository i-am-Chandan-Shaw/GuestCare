import type { Priority } from "@/shared/types";

export const priorityMeta: Record<
  Priority,
  {
    label: string;
    name: string;
    chipTone: "danger" | "warning" | "info" | "muted";
    tone: string;
    dot: string;
  }
> = {
  High: {
    label: "High",
    name: "High",
    chipTone: "danger",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
  "Medium-High": {
    label: "Medium-High",
    name: "Medium-High",
    chipTone: "warning",
    tone: "bg-warning/10 text-warning border-warning/30",
    dot: "bg-warning",
  },
  Medium: {
    label: "Medium",
    name: "Medium",
    chipTone: "info",
    tone: "bg-info/10 text-info border-info/30",
    dot: "bg-info",
  },
  Low: {
    label: "Low",
    name: "Low",
    chipTone: "muted",
    tone: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};
