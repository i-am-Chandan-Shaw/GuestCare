import { parseWifiCell, splitSheetLines } from "@/shared/lib/helpers";
import {
  buildHeaderIndex,
  getCell,
  getFirstSheetMatrix,
  optionalText,
  readWorkbook,
  type SheetMatrix,
} from "@/features/directory/lib/sheet-io";
import type { CreatePropertyInput } from "@/features/directory/validations/property-form.schema";

/**
 * Simplified sheet: one column → one field.
 * House rules and WiFi are normalized only at upload time.
 */
const HEADERS = {
  name: "PROPERTY NAME",
  type: "Type",
  maxGuests: "Max. guest capacity",
  buildingNumber: "Building/house number",
  unit: "Apartment / Unit / Suite number",
  address: "Full Address",
  postalCode: "ZIP / Postal code",
  area: "Area",
  floor: "Floor",
  guideUrl: "Link to Property Guide (please add full url)",
  specificInfo: "PROPERTY SPECIFIC INFO",
  checkIn: "CHECK-IN",
  checkOut: "CHECK-OUT",
  spareKeys: "SPARE KEY TITLES",
  parking: "PARKING",
  wifi: "WIFI",
  houseRules: "HOUSE RULES",
  laundry: "LAUNDRY",
  laundryAlt: "LAUNDRY: INFO",
  waste: "WASTE DISPOSAL",
} as const;

export type ParsedPropertyRow = {
  id: string;
  sheetRow: number;
  name: string;
  payload: Omit<CreatePropertyInput, "customerId">;
};

export type SkippedPropertyRow = {
  sheetRow: number;
  name: string;
  reason: string;
};

export type ParsePropertySheetResult = {
  rows: ParsedPropertyRow[];
  skipped: SkippedPropertyRow[];
  duplicateNames: string[];
};

function optionalMaxGuests(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return Math.floor(value);
  }
  const text = optionalText(value);
  if (!text) return undefined;
  if (!/^\d+$/.test(text)) return undefined;
  return Number.parseInt(text, 10);
}

function rowToPayload(
  row: unknown[],
  headerIndex: Map<string, number>,
): Omit<CreatePropertyInput, "customerId"> | SkippedPropertyRow | null {
  const name = optionalText(getCell(row, headerIndex, HEADERS.name));
  if (!name) return null;

  const type = optionalText(getCell(row, headerIndex, HEADERS.type));
  if (!type) {
    return {
      sheetRow: 0,
      name,
      reason: "Type is required.",
    };
  }

  const wifiText = optionalText(getCell(row, headerIndex, HEADERS.wifi));
  const houseRulesText = optionalText(getCell(row, headerIndex, HEADERS.houseRules));

  return {
    name,
    type,
    maxGuests: optionalMaxGuests(getCell(row, headerIndex, HEADERS.maxGuests)),
    buildingNumber: optionalText(getCell(row, headerIndex, HEADERS.buildingNumber)),
    unit: optionalText(getCell(row, headerIndex, HEADERS.unit)),
    address: optionalText(getCell(row, headerIndex, HEADERS.address)),
    postalCode: optionalText(getCell(row, headerIndex, HEADERS.postalCode)),
    area: optionalText(getCell(row, headerIndex, HEADERS.area)),
    floor: optionalText(getCell(row, headerIndex, HEADERS.floor)),
    guideUrl: optionalText(getCell(row, headerIndex, HEADERS.guideUrl)),
    specificInfo: optionalText(getCell(row, headerIndex, HEADERS.specificInfo)),
    checkInInstructions: optionalText(getCell(row, headerIndex, HEADERS.checkIn)),
    checkOutInstructions: optionalText(getCell(row, headerIndex, HEADERS.checkOut)),
    spareKeys: optionalText(getCell(row, headerIndex, HEADERS.spareKeys)),
    parking: optionalText(getCell(row, headerIndex, HEADERS.parking)),
    wifi: parseWifiCell(wifiText),
    houseRules: splitSheetLines(houseRulesText),
    laundry:
      optionalText(getCell(row, headerIndex, HEADERS.laundry)) ??
      optionalText(getCell(row, headerIndex, HEADERS.laundryAlt)),
    waste: optionalText(getCell(row, headerIndex, HEADERS.waste)),
  };
}

function isSkippedRow(
  value: Omit<CreatePropertyInput, "customerId"> | SkippedPropertyRow | null,
): value is SkippedPropertyRow {
  return value != null && "reason" in value;
}

/** Parse a property data matrix (header row + data). Shared by bulk upload and customer workbook. */
export function parsePropertyMatrix(matrix: SheetMatrix): ParsePropertySheetResult {
  if (matrix.length < 2) {
    throw new Error("The property sheet needs a header row and at least one data row.");
  }

  const headerIndex = buildHeaderIndex(matrix[0] ?? []);
  if (!headerIndex.has(HEADERS.name)) {
    throw new Error('Missing required column "PROPERTY NAME".');
  }

  const rows: ParsedPropertyRow[] = [];
  const skipped: SkippedPropertyRow[] = [];
  const nameCounts = new Map<string, number>();

  for (let i = 1; i < matrix.length; i += 1) {
    const sheetRow = i + 1;
    const result = rowToPayload(matrix[i] ?? [], headerIndex);
    if (result == null) continue;

    if (isSkippedRow(result)) {
      skipped.push({ ...result, sheetRow });
      continue;
    }

    const key = result.name.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);

    rows.push({
      id: `row-${sheetRow}-${rows.length}`,
      sheetRow,
      name: result.name,
      payload: result,
    });
  }

  const duplicateNames = rows
    .filter((row) => (nameCounts.get(row.name.toLowerCase()) ?? 0) > 1)
    .map((row) => row.name)
    .filter((name, index, all) => all.indexOf(name) === index);

  return { rows, skipped, duplicateNames };
}

/**
 * Parse an Excel/CSV property sheet into create payloads (first sheet only).
 * Caller injects `customerId` before calling createProperty.
 */
export async function parsePropertySheet(file: File): Promise<ParsePropertySheetResult> {
  const workbook = await readWorkbook(file);
  return parsePropertyMatrix(getFirstSheetMatrix(workbook));
}

/** Headers expected in the simplified template (for UI copy). */
export const PROPERTY_SHEET_HEADERS = Object.values(HEADERS);
