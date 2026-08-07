import { resolvePriorityFromSheet } from "@/features/directory/lib/priority-from-category";
import {
  buildHeaderIndex,
  getCell,
  getFirstSheetMatrix,
  hasHeader,
  optionalText,
  readWorkbook,
  type SheetMatrix,
} from "@/features/directory/lib/sheet-io";
import { splitSheetLines } from "@/shared/lib/helpers";
import {
  RESERVATION_VERIFICATIONS,
  type CreateProtocolInput,
} from "@/features/directory/validations/protocol-form.schema";

/**
 * Protocol sheet: one column → one field.
 * Reads Priority Category + Priority (High / Medium-High / Medium / Low).
 * Accepts typo header "Priority Cateory" and "Escalation Contact [Name/Info]".
 */
const HEADERS = {
  category: "Category",
  issue: "Issue",
  reservationVerification: "Reservation Verification",
  troubleshooting: "Troubleshooting",
  escalationContact: "Escalation Contact",
  escalationContactDetails: "Escalation Contact Details",
  escalationContactDetailsAlt: "Escalation Contact [Name/Info]",
  priorityCategory: "Priority Category",
  priorityCategoryTypo: "Priority Cateory",
  priority: "Priority",
} as const;

const VERIFICATION_SET = new Set<string>(RESERVATION_VERIFICATIONS);

export type ParsedProtocolPayload = Omit<CreateProtocolInput, "propertyId">;

export type ParsedProtocolRow = {
  id: string;
  sheetRow: number;
  name: string;
  /** Sheet Priority column — display only. */
  sheetPriority?: string;
  payload: ParsedProtocolPayload;
};

export type SkippedProtocolRow = {
  sheetRow: number;
  name: string;
  reason: string;
};

export type ParseProtocolSheetResult = {
  rows: ParsedProtocolRow[];
  skipped: SkippedProtocolRow[];
  duplicateNames: string[];
};

function rowToPayload(
  row: unknown[],
  headerIndex: Map<string, number>,
):
  | { ok: true; name: string; sheetPriority?: string; payload: ParsedProtocolPayload }
  | { ok: false; skip: SkippedProtocolRow }
  | null {
  const name = optionalText(getCell(row, headerIndex, HEADERS.issue));
  if (!name) return null;

  const category = optionalText(getCell(row, headerIndex, HEADERS.category));
  if (!category) {
    return { ok: false, skip: { sheetRow: 0, name, reason: "Category is required." } };
  }

  const verificationRaw = optionalText(
    getCell(row, headerIndex, HEADERS.reservationVerification),
  );
  const reservationVerification =
    verificationRaw && VERIFICATION_SET.has(verificationRaw)
      ? (verificationRaw as (typeof RESERVATION_VERIFICATIONS)[number])
      : "Not Required";

  const priorityCategoryRaw =
    optionalText(getCell(row, headerIndex, HEADERS.priorityCategory)) ??
    optionalText(getCell(row, headerIndex, HEADERS.priorityCategoryTypo));
  const sheetPriority = optionalText(getCell(row, headerIndex, HEADERS.priority));
  const resolved = resolvePriorityFromSheet(priorityCategoryRaw, sheetPriority);
  if (!resolved) {
    const reason =
      !priorityCategoryRaw && !sheetPriority
        ? "Priority Category and Priority are required."
        : !priorityCategoryRaw
          ? "Priority Category is required."
          : !sheetPriority
            ? "Priority is required (High, Medium-High, Medium, or Low)."
            : `Unknown or mismatched Priority Category / Priority ("${priorityCategoryRaw}" / "${sheetPriority}").`;
    return {
      ok: false,
      skip: { sheetRow: 0, name, reason },
    };
  }

  const escalationContact = optionalText(getCell(row, headerIndex, HEADERS.escalationContact));
  const escalationDetails =
    optionalText(getCell(row, headerIndex, HEADERS.escalationContactDetails)) ??
    optionalText(getCell(row, headerIndex, HEADERS.escalationContactDetailsAlt));
  const escalationText = [escalationContact, escalationDetails].filter(Boolean).join("\n");

  const troubleshooting = optionalText(getCell(row, headerIndex, HEADERS.troubleshooting));
  const steps = splitSheetLines(troubleshooting).map((label, position) => ({
    id: crypto.randomUUID(),
    label,
    position,
  }));

  return {
    ok: true,
    name,
    sheetPriority: resolved.priority,
    payload: {
      category,
      name,
      reservationVerification,
      priorityCategory: resolved.category,
      steps,
      customerContactId: null,
      escalationKind: escalationText ? "custom" : null,
      escalationDetails: escalationText || undefined,
    },
  };
}

/** Parse a protocol data matrix (header row + data). Shared by bulk upload and customer workbook. */
export function parseProtocolMatrix(matrix: SheetMatrix): ParseProtocolSheetResult {
  if (matrix.length < 2) {
    throw new Error("The protocol sheet needs a header row and at least one data row.");
  }

  const headerIndex = buildHeaderIndex(matrix[0] ?? []);
  if (!hasHeader(headerIndex, HEADERS.issue)) {
    throw new Error('Missing required column "Issue".');
  }

  const rows: ParsedProtocolRow[] = [];
  const skipped: SkippedProtocolRow[] = [];
  const nameCounts = new Map<string, number>();

  for (let i = 1; i < matrix.length; i += 1) {
    const sheetRow = i + 1;
    const result = rowToPayload(matrix[i] ?? [], headerIndex);
    if (result == null) continue;

    if (!result.ok) {
      skipped.push({ ...result.skip, sheetRow });
      continue;
    }

    const key = result.name.toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);

    rows.push({
      id: `row-${sheetRow}-${rows.length}`,
      sheetRow,
      name: result.name,
      sheetPriority: result.sheetPriority,
      payload: result.payload,
    });
  }

  const duplicateNames = rows
    .filter((row) => (nameCounts.get(row.name.toLowerCase()) ?? 0) > 1)
    .map((row) => row.name)
    .filter((name, index, all) => all.indexOf(name) === index);

  return { rows, skipped, duplicateNames };
}

/**
 * Parse an Excel/CSV protocol sheet into create payloads (first sheet only).
 * Caller injects `propertyId` before calling createProtocol.
 */
export async function parseProtocolSheet(file: File): Promise<ParseProtocolSheetResult> {
  const workbook = await readWorkbook(file);
  return parseProtocolMatrix(getFirstSheetMatrix(workbook));
}
