import type { OrderedStepItem, Priority, ReservationVerification } from "@/shared/types";
import type { PriorityCategory } from "@/features/directory/lib/priority-from-category";
import { PRIORITY_CATEGORIES } from "@/features/directory/lib/priority-from-category";
import { RESERVATION_VERIFICATIONS } from "@/features/directory/validations/protocol-form.schema";

export type ProtocolEscalationKind =
  | "host"
  | "emergency-then-host"
  | "next-day-followup"
  | "cleaning"
  | "custom";

export type ProtocolRow = {
  id: string;
  property_id: string;
  category: string;
  name: string;
  reservation_verification: string;
  priority_category: string;
  priority: string;
  steps: unknown;
  customer_contact_id: string | null;
  escalation_kind: string | null;
  escalation_details: string | null;
  created_at: string;
  updated_at: string;
};

export type DirectoryProtocol = {
  id: string;
  propertyId: string;
  category: string;
  name: string;
  reservationVerification: ReservationVerification;
  priorityCategory: PriorityCategory;
  priority: Priority;
  steps: OrderedStepItem[];
  customerContactId?: string;
  escalationKind?: ProtocolEscalationKind;
  escalationDetails?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProtocolListItem = {
  id: string;
  propertyId: string;
  category: string;
  name: string;
  reservationVerification: ReservationVerification;
  priorityCategory: PriorityCategory;
  priority: Priority;
  stepsCount: number;
  createdAt: string;
};

function mapSteps(raw: unknown): OrderedStepItem[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((item, index) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    const id = typeof row.id === "string" ? row.id : `step-${index}`;
    const label = typeof row.label === "string" ? row.label : "";
    const hint = typeof row.hint === "string" ? row.hint : undefined;
    const position = typeof row.position === "number" ? row.position : index;
    return [{ id, label, hint, position }];
  });
}

function mapVerification(value: string): ReservationVerification {
  if ((RESERVATION_VERIFICATIONS as readonly string[]).includes(value)) {
    return value as ReservationVerification;
  }
  return "Not Required";
}

function mapPriorityCategory(value: string): PriorityCategory {
  if ((PRIORITY_CATEGORIES as readonly string[]).includes(value)) {
    return value as PriorityCategory;
  }
  return "Admin / Informational";
}

function mapPriority(value: string): Priority {
  if (value === "P1" || value === "P2" || value === "P3" || value === "P4") return value;
  return "P4";
}

function mapEscalationKind(value: string | null): ProtocolEscalationKind | undefined {
  if (
    value === "host" ||
    value === "emergency-then-host" ||
    value === "next-day-followup" ||
    value === "cleaning" ||
    value === "custom"
  ) {
    return value;
  }
  return undefined;
}

export function mapProtocolRow(row: ProtocolRow): DirectoryProtocol {
  return {
    id: row.id,
    propertyId: row.property_id,
    category: row.category,
    name: row.name,
    reservationVerification: mapVerification(row.reservation_verification),
    priorityCategory: mapPriorityCategory(row.priority_category),
    priority: mapPriority(row.priority),
    steps: mapSteps(row.steps),
    customerContactId: row.customer_contact_id ?? undefined,
    escalationKind: mapEscalationKind(row.escalation_kind),
    escalationDetails: row.escalation_details?.trim() || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toProtocolListItem(protocol: DirectoryProtocol): ProtocolListItem {
  return {
    id: protocol.id,
    propertyId: protocol.propertyId,
    category: protocol.category,
    name: protocol.name,
    reservationVerification: protocol.reservationVerification,
    priorityCategory: protocol.priorityCategory,
    priority: protocol.priority,
    stepsCount: protocol.steps.length,
    createdAt: protocol.createdAt,
  };
}
