import { parsePropertyMatrix, type ParsedPropertyRow } from "@/features/directory/lib/parse-property-sheet";
import { parseProtocolMatrix, type ParsedProtocolRow } from "@/features/directory/lib/parse-protocol-sheet";
import {
  buildHeaderIndex,
  cellText,
  findSheetName,
  getCell,
  getSheetMatrix,
  normalizeHeader,
  optionalText,
  readWorkbook,
  type SheetMatrix,
} from "@/features/directory/lib/sheet-io";
import type { CustomerContact, OrderedStepItem } from "@/shared/types";

/** Exact sheet tabs from the customer workbook (case-insensitive match). */
const SHEET_NAMES = {
  protocol: "Protocol",
  propertyInfo: "Property Info",
  emergencyContact: "Emergency Contact",
  systemDetails: "System details + steps",
} as const;

export type WorkbookSkip = {
  sheet: string;
  sheetRow?: number;
  name?: string;
  reason: string;
};

export type ParsedCustomerWorkbook = {
  contacts: CustomerContact[];
  pmsUrl?: string;
  pmsUsername?: string;
  pmsPassword?: string;
  guestVerificationSteps: OrderedStepItem[];
  properties: ParsedPropertyRow[];
  protocols: ParsedProtocolRow[];
  skipped: WorkbookSkip[];
  warnings: string[];
};

function findHeaderRowIndex(matrix: SheetMatrix, requiredHeaders: string[]): number {
  const required = requiredHeaders.map((h) => normalizeHeader(h));
  for (let i = 0; i < matrix.length; i += 1) {
    const keys = (matrix[i] ?? []).map((cell) => normalizeHeader(cell));
    if (required.every((header) => keys.includes(header))) return i;
  }
  return -1;
}

function parseEmergencyContacts(matrix: SheetMatrix, sheetLabel: string): {
  contacts: CustomerContact[];
  skipped: WorkbookSkip[];
} {
  const headerRowIndex = findHeaderRowIndex(matrix, ["Team", "Name", "Contact"]);
  if (headerRowIndex < 0) {
    return {
      contacts: [],
      skipped: [
        {
          sheet: sheetLabel,
          reason: 'Could not find columns "Team", "Name", and "Contact".',
        },
      ],
    };
  }

  const headerIndex = buildHeaderIndex(matrix[headerRowIndex] ?? []);
  const contacts: CustomerContact[] = [];
  const skipped: WorkbookSkip[] = [];

  for (let i = headerRowIndex + 1; i < matrix.length; i += 1) {
    const row = matrix[i] ?? [];
    const label = optionalText(getCell(row, headerIndex, "Team"));
    const name = optionalText(getCell(row, headerIndex, "Name"));
    const phone = optionalText(getCell(row, headerIndex, "Contact"));
    if (!label && !name && !phone) continue;

    if (!label || !name || !phone) {
      skipped.push({
        sheet: sheetLabel,
        sheetRow: i + 1,
        name: name ?? label,
        reason: "Team, Name, and Contact are all required.",
      });
      continue;
    }

    contacts.push({
      id: crypto.randomUUID(),
      label,
      name,
      phone,
      position: contacts.length,
    });
  }

  return { contacts, skipped };
}

function labelKey(value: string): string {
  return value.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim().toLowerCase().replace(/:$/, "");
}

function parseSystemDetails(matrix: SheetMatrix): {
  pmsUrl?: string;
  pmsUsername?: string;
  pmsPassword?: string;
  guestVerificationSteps: OrderedStepItem[];
} {
  const byLabel = new Map<string, string>();
  const verificationSteps: OrderedStepItem[] = [];
  let collectingVerification = false;

  for (const row of matrix) {
    const left = cellText(row[0]);
    const right = cellText(row[1]);
    if (!left && !right) continue;

    const key = labelKey(left);

    if (key.includes("how to verify") || key === "guest verification") {
      collectingVerification = true;
      continue;
    }

    if (collectingVerification) {
      const stepMatch = key.match(/^step\s*(\d+)$/);
      if (stepMatch) {
        const label = optionalText(right) ?? optionalText(left.replace(/^step\s*\d+\s*:?\s*/i, ""));
        if (label) {
          verificationSteps.push({
            id: crypto.randomUUID(),
            label,
            position: verificationSteps.length,
          });
        }
        continue;
      }
      if (key.startsWith("link to") || key === "username" || key === "password") {
        collectingVerification = false;
      } else {
        const label = optionalText(right) ?? optionalText(left);
        if (label && !key.includes("verify")) {
          verificationSteps.push({
            id: crypto.randomUUID(),
            label,
            position: verificationSteps.length,
          });
        }
        continue;
      }
    }

    if (key.startsWith("link to pms") || key === "pms" || key === "pms url") {
      const value = optionalText(right);
      if (value) byLabel.set("pmsUrl", value);
      continue;
    }
    if (key === "username") {
      const value = optionalText(right);
      if (value) byLabel.set("pmsUsername", value);
      continue;
    }
    if (key === "password") {
      const value = optionalText(right);
      if (value) byLabel.set("pmsPassword", value);
      continue;
    }

    const stepMatch = key.match(/^step\s*(\d+)$/);
    if (stepMatch) {
      const label = optionalText(right);
      if (label) {
        verificationSteps.push({
          id: crypto.randomUUID(),
          label,
          position: verificationSteps.length,
        });
      }
    }
  }

  return {
    pmsUrl: byLabel.get("pmsUrl"),
    pmsUsername: byLabel.get("pmsUsername"),
    pmsPassword: byLabel.get("pmsPassword"),
    guestVerificationSteps: verificationSteps,
  };
}

/**
 * Multi-sheet customer workbook parser (Customers page create-import only).
 */
export async function parseCustomerWorkbook(file: File): Promise<ParsedCustomerWorkbook> {
  const workbook = await readWorkbook(file);
  const skipped: WorkbookSkip[] = [];
  const warnings: string[] = [];

  let properties: ParsedPropertyRow[] = [];
  const propertySheet = findSheetName(workbook, SHEET_NAMES.propertyInfo);
  if (!propertySheet) {
    warnings.push(`Missing sheet "${SHEET_NAMES.propertyInfo}". No properties will be created.`);
  } else {
    try {
      const result = parsePropertyMatrix(getSheetMatrix(workbook, propertySheet));
      properties = result.rows;
      for (const row of result.skipped) {
        skipped.push({
          sheet: propertySheet,
          sheetRow: row.sheetRow,
          name: row.name,
          reason: row.reason,
        });
      }
      for (const name of result.duplicateNames) {
        warnings.push(`Duplicate property name in sheet: ${name}`);
      }
    } catch (error) {
      warnings.push(
        `${propertySheet}: ${error instanceof Error ? error.message : "Failed to parse properties."}`,
      );
    }
  }

  let protocols: ParsedProtocolRow[] = [];
  const protocolSheet = findSheetName(workbook, SHEET_NAMES.protocol);
  if (!protocolSheet) {
    warnings.push(`Missing sheet "${SHEET_NAMES.protocol}". No protocols will be created.`);
  } else {
    try {
      const result = parseProtocolMatrix(getSheetMatrix(workbook, protocolSheet));
      protocols = result.rows;
      for (const row of result.skipped) {
        skipped.push({
          sheet: protocolSheet,
          sheetRow: row.sheetRow,
          name: row.name,
          reason: row.reason,
        });
      }
      for (const name of result.duplicateNames) {
        warnings.push(`Duplicate protocol name in sheet: ${name}`);
      }
    } catch (error) {
      warnings.push(
        `${protocolSheet}: ${error instanceof Error ? error.message : "Failed to parse protocols."}`,
      );
    }
  }

  let contacts: CustomerContact[] = [];
  const emergencySheet = findSheetName(workbook, SHEET_NAMES.emergencyContact);
  if (!emergencySheet) {
    warnings.push(`Missing sheet "${SHEET_NAMES.emergencyContact}". No contacts will be imported.`);
  } else {
    const parsed = parseEmergencyContacts(getSheetMatrix(workbook, emergencySheet), emergencySheet);
    contacts = parsed.contacts;
    skipped.push(...parsed.skipped);
  }

  let pmsUrl: string | undefined;
  let pmsUsername: string | undefined;
  let pmsPassword: string | undefined;
  let guestVerificationSteps: OrderedStepItem[] = [];
  const systemSheet = findSheetName(workbook, SHEET_NAMES.systemDetails);
  if (!systemSheet) {
    warnings.push(
      `Missing sheet "${SHEET_NAMES.systemDetails}". PMS and verification not imported.`,
    );
  } else {
    const parsed = parseSystemDetails(getSheetMatrix(workbook, systemSheet));
    pmsUrl = parsed.pmsUrl;
    pmsUsername = parsed.pmsUsername;
    pmsPassword = parsed.pmsPassword;
    guestVerificationSteps = parsed.guestVerificationSteps;
  }

  return {
    contacts,
    pmsUrl,
    pmsUsername,
    pmsPassword,
    guestVerificationSteps,
    properties,
    protocols,
    skipped,
    warnings,
  };
}
