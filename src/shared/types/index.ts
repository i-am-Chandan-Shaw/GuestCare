export type Priority = "P1" | "P2" | "P3" | "P4";

export type EscalationKind =
  "host" | "emergency-then-host" | "next-day-followup" | "cleaning" | { custom: string };

export type SystemKey =
  | "heating"
  | "alarms"
  | "breakIn"
  | "locksmith"
  | "drains"
  | "emergencyLights"
  | "electrical"
  | "gas"
  | "leak"
  | "lifts"
  | "waterSupply";

export type SystemInfo = {
  info?: string;
  escalation?: EscalationKind;
};

export type ReservationVerification = "Required" | "Not Required" | "Required on Escalated";

export type EscalationContactId = "next-day" | "cleaning" | "property";

export type IncidentStatus =
  "Resolved" | "Unresolved - Escalation Handover" | "PM Follow-up Needed" | "In Progress";

export type IncidentType =
  | "Technical Issues"
  | "Property Access Issues"
  | "Reservations + Booking"
  | "Cleaning + Laundry"
  | "Guest-Related Issues"
  | "Other";

export interface CustomerContact {
  id: string;
  label: string;
  name: string;
  phone: string;
  position: number;
}

export interface OrderedStepItem {
  id: string;
  label: string;
  hint?: string;
  position: number;
}

export interface CustomerPms {
  url?: string;
  username?: string;
  password?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  propertyIds: string[];
  imageUrl?: string;
  contacts?: CustomerContact[];
  pms?: CustomerPms;
  guestVerificationSteps?: OrderedStepItem[];
}

export interface Property {
  id: string;
  name: string;
  type: string;
  maxGuests: number;
  buildingNumber?: string;
  unit?: string;
  address: string;
  postalCode?: string;
  area?: string;
  floor?: string;
  guideUrl?: string;
  listingUrl?: string;
  specificInfo: string;
  checkIn: { time: string; instructions: string };
  checkOut: { time: string; instructions: string };
  spareKeys?: string;
  parking?: string;
  wifi: {
    network?: string;
    password?: string;
    location?: string;
    raw: string;
  };
  houseRules: string[];
  laundry?: string;
  laundryEscalation?: EscalationKind;
  waste?: string;
  systems: Partial<Record<SystemKey, SystemInfo>>;
  mediaFolderUrl?: string;
  accessSummary?: {
    lockboxCode?: string;
    keyNest?: string;
    doorCode?: string;
    accessNotes?: string;
  };
  tags: string[];
  imageUrl?: string;
}

export interface ProtocolStep {
  id: string;
  label: string;
  hint?: string;
  branch?: { yes: "resolve" | "escalate"; no: "resolve" | "escalate" };
}

export interface Issue {
  id: string;
  name: string;
  category: string;
  reservationVerification: ReservationVerification;
  steps: ProtocolStep[];
  troubleshootingRaw: string;
  verification: string[];
  escalationContactId: EscalationContactId;
  escalationDetails: string;
  escalation: string;
  priorityCategory: string;
  priority: Priority;
  documents: { title: string; type: string; url?: string }[];
  aiRecommendation: string;
}

export interface GlobalContact {
  id: EscalationContactId | string;
  name: string;
  details: string;
  phones?: string[];
}

export interface IncidentLog {
  id: string;
  callerName: string;
  callerContact: string;
  reservationNumber: string;
  nameOnBooking: string;
  propertyLabel: string;
  propertyId?: string;
  customerId?: string;
  incidentType: IncidentType;
  issueSummary: string;
  protocolIssueId?: string;
  status: IncidentStatus;
  callNotes: string;
  agent: string;
  submittedBy: string;
  timestamp: string;
  priority?: Priority;
}

export interface LastIssueSummary {
  summary: string;
  propertyLabel?: string;
  timestamp: string;
  priority?: Priority;
}

export interface CustomerSummary extends Customer {
  propertyCount: number;
  openReportsCount: number;
  resolvedCount: number;
  totalIssuesCount: number;
  criticalOpenCount: number;
  lastIssue?: LastIssueSummary;
}

export interface PropertySummary extends Property {
  openReportsCount: number;
  resolvedCount: number;
  lastIssue?: Omit<LastIssueSummary, "propertyLabel">;
}

export interface CreateIncidentInput {
  callerName: string;
  callerContact: string;
  reservation: string;
  nameOnBooking: string;
  incidentType: IncidentType;
  issueSummary: string;
  actions: string[];
  priority: Priority;
  status: IncidentStatus;
  callNotes: string;
  customerId?: string;
  propertyId?: string;
  propertyLabel?: string;
  protocolIssueId?: string;
  /** @deprecated Ignored — identity comes from session currentAgent. */
  agentName?: string;
  /** @deprecated Ignored — identity comes from session currentAgent. */
  submittedBy?: string;
}

export interface IncidentLogFilters {
  customerId?: string;
  propertyId?: string;
  protocolIssueId?: string;
  limit?: number;
}

export function protocolToIncidentType(category: string): IncidentType {
  const c = category.toLowerCase();
  if (c.includes("access")) return "Property Access Issues";
  if (c.includes("housekeeping")) return "Cleaning + Laundry";
  if (c.includes("admin") || c.includes("sales")) return "Reservations + Booking";
  if (c.includes("owners")) return "Other";
  if (c.includes("safety")) return "Other";
  if (
    c.includes("utilit") ||
    c.includes("climate") ||
    c.includes("appliance") ||
    c.includes("connect") ||
    c.includes("building")
  ) {
    return "Technical Issues";
  }
  return "Other";
}

export function parseEscalation(raw: string | undefined): EscalationKind | undefined {
  if (!raw || raw.trim() === "" || raw.trim().toUpperCase() === "NA") return undefined;
  const t = raw.trim().toLowerCase();
  if (t.includes("call host") || t === "call host") return "host";
  if (t.includes("emergency services")) return "emergency-then-host";
  return { custom: raw.trim() };
}

export function isPresent(v: string | undefined | null): v is string {
  if (!v) return false;
  const t = v.trim();
  return t !== "" && t.toUpperCase() !== "NA";
}

export type {
  Agent,
  AgentCustomerScope,
  AgentListItem,
  AgentRole,
  IsoDateTime,
  AgentAccess,
} from "./agent";

export type {
  AddReportCommentInput,
  AssignReportInput,
  CreateReportInput,
  PaginatedReports,
  Report,
  ReportDetail,
  ReportListItem,
  ReportSource,
  ReportStatus,
  ReportStatusFilter,
  ReportThreadEntry,
  ReportThreadEntryType,
  ReportsQuery,
  UpdateReportInput,
} from "./report";
