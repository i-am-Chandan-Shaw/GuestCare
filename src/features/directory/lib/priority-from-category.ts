import type { Priority } from "@/shared/types";

export const PRIORITY_CATEGORIES = [
  "Urgent - Safety / No Habitability",
  "Service Impacting (Medium-High)",
  "Inconvenient but Not Critical",
  "Admin / Informational",
] as const;

export type PriorityCategory = (typeof PRIORITY_CATEGORIES)[number];

export function priorityFromCategory(category: PriorityCategory): Priority {
  switch (category) {
    case "Urgent - Safety / No Habitability":
      return "P1";
    case "Service Impacting (Medium-High)":
      return "P2";
    case "Inconvenient but Not Critical":
      return "P3";
    case "Admin / Informational":
      return "P4";
  }
}
