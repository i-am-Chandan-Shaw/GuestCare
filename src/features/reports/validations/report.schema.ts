import { z } from "zod";

const prioritySchema = z.enum(["P1", "P2", "P3", "P4"]);
const reportStatusSchema = z.enum(["OPEN", "ESCALATED", "HANDEDOVER", "RESOLVED"]);
const reportSourceSchema = z.enum(["copilot", "manual"]);

export const reportsQuerySchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive().max(100),
  search: z.string().optional(),
  customerId: z.string().uuid().optional(),
  statuses: z.array(reportStatusSchema).optional(),
  priorities: z.array(prioritySchema).optional(),
  assignedAgentIds: z.array(z.string().uuid()).optional(),
  customerIds: z.array(z.string().uuid()).optional(),
  propertyIds: z.array(z.string().uuid()).optional(),
  issueTypes: z.array(z.string()).optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const reportIdSchema = z.object({
  id: z.string().uuid("Invalid report id."),
});

export const createReportSchema = z.object({
  issueName: z.string().trim().min(1, "Issue name is required."),
  issueType: z.string().trim().min(1, "Issue type is required."),
  priority: prioritySchema,
  status: reportStatusSchema.optional(),
  customerId: z.string().uuid("Invalid customer id."),
  propertyId: z.string().uuid().optional(),
  callerName: z.string(),
  callerContact: z.string(),
  reservationNumber: z.string(),
  nameOnBooking: z.string(),
  callNotes: z.string(),
  actionsTaken: z.array(z.string()),
  protocolIssueId: z.string().uuid().optional(),
  source: reportSourceSchema.optional(),
});

export const updateReportSchema = z.object({
  id: z.string().uuid("Invalid report id."),
  version: z.number().int().positive(),
  issueName: z.string().trim().min(1).optional(),
  issueType: z.string().trim().min(1).optional(),
  priority: prioritySchema.optional(),
  status: reportStatusSchema.optional(),
  customerId: z.string().uuid().optional(),
  propertyId: z.string().uuid().nullable().optional(),
  callerName: z.string().optional(),
  callerContact: z.string().optional(),
  reservationNumber: z.string().optional(),
  nameOnBooking: z.string().optional(),
  callNotes: z.string().optional(),
  actionsTaken: z.array(z.string()).optional(),
  protocolIssueId: z.string().uuid().nullable().optional(),
  assignedAgentId: z.string().uuid().optional(),
  source: reportSourceSchema.optional(),
});

export const addReportAssigneeSchema = z.object({
  id: z.string().uuid("Invalid report id."),
  agentId: z.string().uuid("Invalid agent id."),
  note: z.string().optional(),
});

export const removeReportAssigneeSchema = z.object({
  id: z.string().uuid("Invalid report id."),
  agentId: z.string().uuid("Invalid agent id."),
});

export const addReportCommentSchema = z.object({
  id: z.string().uuid("Invalid report id."),
  body: z.string().trim().min(1, "Comment body is required."),
  parentId: z.string().uuid().optional(),
});

export const updateReportCommentSchema = z.object({
  reportId: z.string().uuid("Invalid report id."),
  commentId: z.string().uuid("Invalid comment id."),
  body: z.string().trim().min(1, "Comment body is required."),
});

export const listIncidentLogsSchema = z.object({
  customerId: z.string().uuid().optional(),
  propertyId: z.string().uuid().optional(),
  protocolIssueId: z.string().uuid().optional(),
  limit: z.number().int().positive().max(500).optional(),
});

export type ReportsQueryInput = z.infer<typeof reportsQuerySchema>;
export type CreateReportSchemaInput = z.infer<typeof createReportSchema>;
export type UpdateReportSchemaInput = z.infer<typeof updateReportSchema>;
