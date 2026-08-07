import type { Priority } from "@/shared/types";

export const PRIORITY_CATEGORIES = [
  "Urgent - Safety / No Habitability",
  "Service Impacting",
  "Inconvenient but Not Critical",
  "Admin / Informational",
] as const;

export type PriorityCategory = (typeof PRIORITY_CATEGORIES)[number];

export const PRIORITIES = ["High", "Medium-High", "Medium", "Low"] as const;

/** Sheet Priority Category → paired Priority (1:1). */
export function priorityFromCategory(category: PriorityCategory): Priority {
  switch (category) {
    case "Urgent - Safety / No Habitability":
      return "High";
    case "Service Impacting":
      return "Medium-High";
    case "Inconvenient but Not Critical":
      return "Medium";
    case "Admin / Informational":
      return "Low";
  }
}

function normalizeKey(value: string): string {
  return value
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const CATEGORY_BY_KEY = new Map(
  PRIORITY_CATEGORIES.map((c) => [normalizeKey(c), c] as const),
);

/** Legacy label still present in some stored rows / older sheets. */
CATEGORY_BY_KEY.set(
  normalizeKey("Service Impacting (Medium-High)"),
  "Service Impacting",
);

const PRIORITY_BY_KEY = new Map(PRIORITIES.map((p) => [normalizeKey(p), p] as const));

/**
 * Map workbook Priority Category + Priority cells to app values.
 * Both columns are required and must be known sheet values (no invented defaults).
 */
export function resolvePriorityFromSheet(
  categoryRaw?: string | null,
  sheetPriorityRaw?: string | null,
): { category: PriorityCategory; priority: Priority } | null {
  if (!categoryRaw || !sheetPriorityRaw) return null;

  const category = CATEGORY_BY_KEY.get(normalizeKey(categoryRaw));
  const priority = PRIORITY_BY_KEY.get(normalizeKey(sheetPriorityRaw));
  if (!category || !priority) return null;

  // Enforce the sheet’s 1:1 pairing
  if (priorityFromCategory(category) !== priority) return null;

  return { category, priority };
}

/** Remap legacy P1–P4 codes if still present in the DB during transition. */
export function mapLegacyPriority(value: string): Priority {
  switch (value) {
    case "P1":
      return "High";
    case "P2":
      return "Medium-High";
    case "P3":
      return "Medium";
    case "P4":
      return "Low";
    default:
      if ((PRIORITIES as readonly string[]).includes(value)) return value as Priority;
      return "Low";
  }
}

export function mapLegacyPriorityCategory(value: string): PriorityCategory {
  const normalized = CATEGORY_BY_KEY.get(normalizeKey(value));
  if (normalized) return normalized;
  if ((PRIORITY_CATEGORIES as readonly string[]).includes(value)) {
    return value as PriorityCategory;
  }
  return "Admin / Informational";
}
