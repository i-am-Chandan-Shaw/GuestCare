import * as XLSX from "xlsx";

export type SheetMatrix = (string | number | null | undefined)[][];

export async function readWorkbook(file: File): Promise<XLSX.WorkBook> {
  const buffer = await file.arrayBuffer();
  return XLSX.read(buffer, { type: "array", cellDates: false, raw: false });
}

export function sheetToMatrix(sheet: XLSX.WorkSheet): SheetMatrix {
  return XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    blankrows: false,
    raw: false,
  });
}

function normalizeSheetName(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

/** Find a sheet by name (case-insensitive, trimmed). */
export function findSheetName(
  workbook: XLSX.WorkBook,
  candidates: string | string[],
): string | null {
  const wanted = (Array.isArray(candidates) ? candidates : [candidates]).map(normalizeSheetName);
  for (const name of workbook.SheetNames) {
    if (wanted.includes(normalizeSheetName(name))) return name;
  }
  return null;
}

export function getSheetMatrix(
  workbook: XLSX.WorkBook,
  candidates: string | string[],
): SheetMatrix {
  const sheetName = findSheetName(workbook, candidates);
  if (!sheetName) {
    const labels = Array.isArray(candidates) ? candidates.join('" / "') : candidates;
    throw new Error(`Missing sheet "${labels}".`);
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error(`Could not read sheet "${sheetName}".`);
  }
  return sheetToMatrix(sheet);
}

/** First sheet only — used by property/protocol single-sheet bulk upload. */
export function getFirstSheetMatrix(workbook: XLSX.WorkBook): SheetMatrix {
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    throw new Error("The file has no sheets.");
  }
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) {
    throw new Error("Could not read the first sheet.");
  }
  return sheetToMatrix(sheet);
}

export function normalizeHeader(value: unknown): string {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cellText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return String(value).replace(/\u00a0/g, " ").trim();
}

export function isEmptyOrNa(value: string): boolean {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return normalized === "na" || normalized === "n/a" || normalized === "-";
}

export function optionalText(value: unknown): string | undefined {
  const text = cellText(value);
  if (isEmptyOrNa(text)) return undefined;
  return text;
}

export function buildHeaderIndex(headerRow: unknown[]): Map<string, number> {
  const index = new Map<string, number>();
  headerRow.forEach((cell, i) => {
    const key = normalizeHeader(cell);
    if (key && !index.has(key)) index.set(key, i);
  });
  return index;
}

export function getCell(
  row: unknown[],
  headerIndex: Map<string, number>,
  header: string,
): unknown {
  const i = headerIndex.get(header);
  if (i == null) return undefined;
  return row[i];
}
