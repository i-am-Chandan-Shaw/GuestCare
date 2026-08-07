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

/** Priority → paired Priority Category (1:1). */
export function categoryFromPriority(priority: Priority): PriorityCategory {
  switch (priority) {
    case "High":
      return "Urgent - Safety / No Habitability";
    case "Medium-High":
      return "Service Impacting";
    case "Medium":
      return "Inconvenient but Not Critical";
    case "Low":
      return "Admin / Informational";
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

/** Common sheet typo / abbreviated header value. */
CATEGORY_BY_KEY.set(normalizeKey("Service Impacting (Medium-High)"), "Service Impacting");

const PRIORITY_BY_KEY = new Map(PRIORITIES.map((p) => [normalizeKey(p), p] as const));

/**
 * Map workbook Priority Category + Priority cells to app values.
 * Missing Priority defaults to Low; missing Priority Category is inferred from Priority.
 * When only Priority Category is set, Priority is derived from it.
 * When both are set, they must be known and match.
 */
export function resolvePriorityFromSheet(
  categoryRaw?: string | null,
  sheetPriorityRaw?: string | null,
): { category: PriorityCategory; priority: Priority } | null {
  const hasCategory = Boolean(categoryRaw?.trim());
  const hasPriority = Boolean(sheetPriorityRaw?.trim());

  if (!hasCategory && !hasPriority) {
    return { category: "Admin / Informational", priority: "Low" };
  }

  if (hasCategory && !hasPriority) {
    const category = CATEGORY_BY_KEY.get(normalizeKey(categoryRaw!));
    if (!category) return null;
    return { category, priority: priorityFromCategory(category) };
  }

  if (!hasCategory && hasPriority) {
    const priority = PRIORITY_BY_KEY.get(normalizeKey(sheetPriorityRaw!));
    if (!priority) return null;
    return { category: categoryFromPriority(priority), priority };
  }

  const category = CATEGORY_BY_KEY.get(normalizeKey(categoryRaw!));
  const priority = PRIORITY_BY_KEY.get(normalizeKey(sheetPriorityRaw!));
  if (!category || !priority) return null;
  if (priorityFromCategory(category) !== priority) return null;

  return { category, priority };
}

export function parsePriority(value: string): Priority | null {
  return (PRIORITIES as readonly string[]).includes(value) ? (value as Priority) : null;
}

export function parsePriorityCategory(value: string): PriorityCategory | null {
  return CATEGORY_BY_KEY.get(normalizeKey(value)) ?? null;
}
