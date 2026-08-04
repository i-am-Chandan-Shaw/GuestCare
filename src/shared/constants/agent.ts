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
  P1: {
    label: "Critical",
    name: "Critical",
    chipTone: "danger",
    tone: "bg-destructive/15 text-destructive border-destructive/30",
    dot: "bg-destructive",
  },
  P2: {
    label: "High",
    name: "High",
    chipTone: "warning",
    tone: "bg-warning/10 text-warning border-warning/30",
    dot: "bg-warning",
  },
  P3: {
    label: "Medium",
    name: "Medium",
    chipTone: "info",
    tone: "bg-info/10 text-info border-info/30",
    dot: "bg-info",
  },
  P4: {
    label: "Low",
    name: "Low",
    chipTone: "muted",
    tone: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
};
