import type { Priority } from "@/shared/types/index";
import type { IsoDateTime, ReportActor } from "@/shared/types/agent";

export type ReportStatus = "OPEN" | "ESCALATED" | "HANDEDOVER" | "RESOLVED";
export type ReportSource = "copilot" | "manual";

export type ReportStatusFilter = "all" | ReportStatus;

export interface ReportListItem {
  id: string;
  issueName: string;
  issueType: string;
  priority: Priority;
  status: ReportStatus;
  propertyName: string;
  customerName: string;
  assignedAgentName: string;
  callerName: string;
  createdAt: IsoDateTime;
  lastActivityAt: IsoDateTime;
  threadCount: number;
}

export interface Report {
  id: string;
  issueName: string;
  issueType: string;
  priority: Priority;
  status: ReportStatus;
  source: ReportSource;

  customerId: string;
  propertyId?: string;
  assignedAgentId: string;
  createdByAgentId: string;

  callerName: string;
  callerContact: string;
  reservationNumber: string;
  nameOnBooking: string;

  callNotes: string;
  actionsTaken: string[];

  protocolIssueId?: string;

  customerName: string;
  propertyName: string;
  assignedAgentName: string;
  createdByAgentName: string;

  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
  lastActivityAt: IsoDateTime;
  resolvedAt?: IsoDateTime;
  version: number;
}

export type ReportThreadEntryType =
  | "comment"
  | "assignment"
  | "status_change"
  | "field_edit"
  | "system";

export interface ReportThreadEntry {
  id: string;
  reportId: string;
  type: ReportThreadEntryType;
  authorAgentId: string;
  authorAgentName: string;
  body?: string;
  /** Present only on replies to a root comment (max depth 1). */
  parentId?: string;
  metadata?: {
    fromAgentId?: string;
    fromAgentName?: string;
    toAgentId?: string;
    toAgentName?: string;
    fromStatus?: ReportStatus;
    toStatus?: ReportStatus;
    changedFields?: string[];
  };
  createdAt: IsoDateTime;
}

export interface ReportsQuery {
  page: number;
  limit: number;
  search?: string;
  status?: ReportStatusFilter;
  customerId?: string;
}

export interface PaginatedReports {
  data: ReportListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ReportDetail {
  report: Report;
  thread: ReportThreadEntry[];
}

export interface CreateReportInput {
  issueName: string;
  issueType: string;
  priority: Priority;
  status?: ReportStatus;
  customerId: string;
  propertyId?: string;
  callerName: string;
  callerContact: string;
  reservationNumber: string;
  nameOnBooking: string;
  callNotes: string;
  actionsTaken: string[];
  protocolIssueId?: string;
  source?: ReportSource;
}

export interface UpdateReportInput extends Partial<CreateReportInput> {
  status?: ReportStatus;
  assignedAgentId?: string;
  version: number;
}

export interface AssignReportInput {
  toAgentId: string;
  note?: string;
}

export interface AddReportCommentInput {
  body: string;
  /** Must reference a root comment (no parent). Max nesting depth is 1. */
  parentId?: string;
}

export interface UpdateReportCommentInput {
  body: string;
}

export type { ReportActor };
