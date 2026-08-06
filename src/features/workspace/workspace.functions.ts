import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAuthSession } from "@/features/auth/server/session";
import { throwHttpError } from "@/features/directory/lib/server-fn-error";
import {
  mapCustomerRow,
  type CustomerContactRow,
  type CustomerRow,
  type DirectoryCustomer,
} from "@/features/directory/lib/map-customer-row";
import {
  mapPropertyRow,
  type PropertyRow,
  type DirectoryProperty,
} from "@/features/directory/lib/map-property-row";
import {
  mapProtocolRow,
  type ProtocolRow,
  type DirectoryProtocol,
} from "@/features/directory/lib/map-protocol-row";
import { reportToIncidentLog } from "@/features/reports/lib/report-legacy";
import {
  mapAssigneeRow,
  mapReportRow,
  type ReportAssigneeRow,
  type ReportRow,
} from "@/features/reports/lib/map-report-row";
import { toAgentAccess } from "@/features/reports/lib/report-scope";
import { createSupabaseAdmin } from "@/shared/lib/supabase/admin";
import { agentCanAccessCustomer } from "@/shared/lib/access";
import { isOpenIncident } from "@/shared/lib/incident-status";
import type {
  Customer,
  CustomerSummary,
  EscalationContactId,
  GlobalContact,
  HostContact,
  Issue,
  LastIssueSummary,
  Property,
  PropertySummary,
  ProtocolStep,
} from "@/shared/types";
import type { AgentAccess } from "@/shared/types/agent";
import type { Report } from "@/shared/types/report";

type SupabaseAdmin = ReturnType<typeof createSupabaseAdmin>;

async function requireSession() {
  const session = await getAuthSession();
  if (!session) throwHttpError("You must be signed in.", 401);
  return session;
}

function scopedCustomerIds(agent: AgentAccess): string[] | null {
  if (agent.role === "admin") return null;
  if (!agent.customerScope || agent.customerScope.type === "all") return null;
  return agent.customerScope.customerIds;
}

function assertCustomerAccess(agent: AgentAccess, customerId: string) {
  if (!agentCanAccessCustomer(agent, customerId)) {
    throwHttpError("You do not have access to this customer.", 403);
  }
}

function directoryCustomerToCustomer(
  customer: DirectoryCustomer,
  propertyIds: string[],
): Customer {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    propertyIds,
    imageUrl: customer.imageUrl,
    contacts: customer.contacts,
    pms: customer.pms,
    guestVerificationSteps: customer.guestVerificationSteps,
  };
}

function directoryPropertyToProperty(property: DirectoryProperty): Property {
  const hasStructuredWifi = Boolean(property.wifi.network || property.wifi.password);
  const wifiRaw = hasStructuredWifi
    ? [
        property.wifi.location,
        property.wifi.network ? `Network: ${property.wifi.network}` : undefined,
        property.wifi.password ? `Password: ${property.wifi.password}` : undefined,
      ]
        .filter(Boolean)
        .join("\n")
    : (property.wifi.location ?? "");

  return {
    id: property.id,
    name: property.name,
    type: property.type,
    maxGuests: property.maxGuests ?? 0,
    buildingNumber: property.buildingNumber,
    unit: property.unit,
    address: property.address,
    postalCode: property.postalCode,
    area: property.area,
    floor: property.floor,
    guideUrl: property.guideUrl,
    listingUrl: property.listingUrl,
    specificInfo: property.specificInfo,
    checkIn: property.checkIn,
    checkOut: property.checkOut,
    spareKeys: property.spareKeys,
    parking: property.parking,
    wifi: {
      network: property.wifi.network,
      password: property.wifi.password,
      location: property.wifi.location,
      raw: wifiRaw,
    },
    houseRules: property.houseRules,
    laundry: property.laundry,
    laundryEscalation: property.laundryEscalation,
    waste: property.waste,
    systems: property.systems,
    hosts: [] as HostContact[],
    mediaFolderUrl: property.mediaFolderUrl,
    accessSummary: property.accessSummary,
    tags: [property.type, property.floor, property.unit].filter(
      (value): value is string => Boolean(value?.trim()),
    ),
    imageUrl: property.imageUrl,
  };
}

function protocolToIssue(
  protocol: DirectoryProtocol,
  verificationSteps: string[] = [],
): Issue {
  const steps: ProtocolStep[] = protocol.steps.map((step) => ({
    id: step.id,
    label: step.label,
    hint: step.hint,
  }));

  const troubleshootingRaw = protocol.steps.map((step) => step.label).join("\n\n");

  let escalationContactId: EscalationContactId = "property";
  let escalationDetails = protocol.escalationDetails ?? "";
  let escalation = "";

  if (protocol.customerContactId) {
    escalationContactId = protocol.customerContactId as EscalationContactId;
    escalation = protocol.escalationDetails ?? "";
  } else if (protocol.escalationKind === "host") {
    escalationContactId = "next-day";
    escalation = "Call Host";
  } else if (protocol.escalationKind === "emergency-then-host") {
    escalationContactId = "property";
    escalation = "Call emergency services then host";
  } else if (protocol.escalationKind === "cleaning") {
    escalationContactId = "cleaning";
    escalation = "Cleaning";
  } else if (protocol.escalationKind === "custom") {
    escalationContactId = "property";
    escalation = protocol.escalationDetails ?? "";
    escalationDetails = protocol.escalationDetails ?? "";
  } else if (protocol.escalationKind === "next-day-followup") {
    escalationContactId = "next-day";
    escalation = "Next-day follow-up";
  }

  return {
    id: protocol.id,
    name: protocol.name,
    category: protocol.category,
    reservationVerification: protocol.reservationVerification,
    steps,
    troubleshootingRaw,
    verification: verificationSteps,
    escalationContactId,
    escalationDetails,
    escalation,
    priorityCategory: protocol.priorityCategory,
    priority: protocol.priority,
    documents: [],
    aiRecommendation: "",
  };
}

async function loadReportsForCustomers(
  supabase: SupabaseAdmin,
  customerIds: string[],
): Promise<Report[]> {
  if (customerIds.length === 0) return [];

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .in("customer_id", customerIds)
    .order("last_activity_at", { ascending: false });

  if (error) throwHttpError(error.message || "Failed to load reports.", 500);
  const rows = (data ?? []) as ReportRow[];
  if (rows.length === 0) return [];

  const reportIds = rows.map((row) => row.id);
  const { data: assigneeData, error: assigneeError } = await supabase
    .from("report_assignees")
    .select("*")
    .in("report_id", reportIds);

  if (assigneeError) {
    throwHttpError(assigneeError.message || "Failed to load assignees.", 500);
  }

  const assigneesByReport = new Map<string, ReturnType<typeof mapAssigneeRow>[]>();
  for (const row of (assigneeData ?? []) as ReportAssigneeRow[]) {
    const list = assigneesByReport.get(row.report_id) ?? [];
    list.push(mapAssigneeRow(row));
    assigneesByReport.set(row.report_id, list);
  }

  return rows.map((row) => mapReportRow(row, assigneesByReport.get(row.id) ?? []));
}

function lastIssueFromReport(report: Report): LastIssueSummary {
  const log = reportToIncidentLog(report);
  return {
    summary: log.issueSummary,
    propertyLabel: log.propertyLabel,
    timestamp: log.timestamp,
    priority: log.priority,
  };
}

function summarizeCustomer(
  customer: Customer,
  reports: Report[],
): CustomerSummary {
  const propertyIds = new Set(customer.propertyIds);
  const customerReports = reports.filter(
    (report) =>
      report.customerId === customer.id ||
      (report.propertyId != null && propertyIds.has(report.propertyId)),
  );
  const logs = customerReports.map(reportToIncidentLog);
  const openReportsCount = logs.filter(isOpenIncident).length;
  const resolvedCount = logs.filter((log) => log.status === "Resolved").length;
  const criticalOpenCount = logs.filter(
    (log) => isOpenIncident(log) && log.priority === "P1",
  ).length;
  const newest = customerReports[0];

  return {
    ...customer,
    propertyCount: customer.propertyIds.length,
    openReportsCount,
    resolvedCount,
    totalIssuesCount: customerReports.length,
    criticalOpenCount,
    lastIssue: newest ? lastIssueFromReport(newest) : undefined,
  };
}

function summarizeProperty(property: Property, reports: Report[]): PropertySummary {
  const propertyReports = reports.filter((report) => report.propertyId === property.id);
  const logs = propertyReports.map(reportToIncidentLog);
  const openReportsCount = logs.filter(isOpenIncident).length;
  const resolvedCount = logs.filter((log) => log.status === "Resolved").length;
  const newest = propertyReports[0];

  return {
    ...property,
    openReportsCount,
    resolvedCount,
    lastIssue: newest
      ? {
          summary: newest.issueName,
          timestamp: reportToIncidentLog(newest).timestamp,
          priority: newest.priority,
        }
      : undefined,
  };
}

export const listWorkspaceCustomerSummariesFn = createServerFn({ method: "GET" }).handler(
  async (): Promise<CustomerSummary[]> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();
    const allowedIds = scopedCustomerIds(agent);

    let query = supabase.from("customers").select("*").order("name");
    if (allowedIds) {
      if (allowedIds.length === 0) return [];
      query = query.in("id", allowedIds);
    }

    const { data, error } = await query;
    if (error) throwHttpError(error.message || "Failed to load customers.", 500);

    const customerRows = (data ?? []) as CustomerRow[];
    if (customerRows.length === 0) return [];

    const ids = customerRows.map((row) => row.id);
    const [contactsResult, propertiesResult, reports] = await Promise.all([
      supabase.from("customer_contacts").select("*").in("customer_id", ids),
      supabase.from("properties").select("id, customer_id").in("customer_id", ids),
      loadReportsForCustomers(supabase, ids),
    ]);

    if (contactsResult.error) {
      throwHttpError(contactsResult.error.message || "Failed to load contacts.", 500);
    }
    if (propertiesResult.error) {
      throwHttpError(propertiesResult.error.message || "Failed to load properties.", 500);
    }

    const contactsByCustomer = new Map<string, CustomerContactRow[]>();
    for (const row of (contactsResult.data ?? []) as CustomerContactRow[]) {
      const list = contactsByCustomer.get(row.customer_id) ?? [];
      list.push(row);
      contactsByCustomer.set(row.customer_id, list);
    }

    const propertyIdsByCustomer = new Map<string, string[]>();
    for (const row of propertiesResult.data ?? []) {
      const customerId = (row as { customer_id: string; id: string }).customer_id;
      const list = propertyIdsByCustomer.get(customerId) ?? [];
      list.push((row as { id: string }).id);
      propertyIdsByCustomer.set(customerId, list);
    }

    return customerRows.map((row) => {
      const directory = mapCustomerRow(row, contactsByCustomer.get(row.id) ?? []);
      const customer = directoryCustomerToCustomer(
        directory,
        propertyIdsByCustomer.get(row.id) ?? [],
      );
      return summarizeCustomer(customer, reports);
    });
  },
);

export const listWorkspacePropertySummariesFn = createServerFn({ method: "POST" })
  .validator(z.object({ customerId: z.string().uuid() }))
  .handler(async ({ data }): Promise<PropertySummary[]> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    assertCustomerAccess(agent, data.customerId);

    const supabase = createSupabaseAdmin();
    const { data: rows, error } = await supabase
      .from("properties")
      .select("*")
      .eq("customer_id", data.customerId)
      .order("name");

    if (error) throwHttpError(error.message || "Failed to load properties.", 500);
    const propertyRows = (rows ?? []) as PropertyRow[];
    if (propertyRows.length === 0) return [];

    const reports = await loadReportsForCustomers(supabase, [data.customerId]);

    return propertyRows.map((row) => {
      const property = directoryPropertyToProperty(mapPropertyRow(row));
      return summarizeProperty(property, reports);
    });
  });

export const getWorkspaceCustomerFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }): Promise<Customer | null> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    assertCustomerAccess(agent, data.id);

    const supabase = createSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load customer.", 500);
    if (!row) return null;

    const [contactsResult, propertiesResult] = await Promise.all([
      supabase.from("customer_contacts").select("*").eq("customer_id", data.id),
      supabase.from("properties").select("id").eq("customer_id", data.id),
    ]);

    if (contactsResult.error) {
      throwHttpError(contactsResult.error.message || "Failed to load contacts.", 500);
    }
    if (propertiesResult.error) {
      throwHttpError(propertiesResult.error.message || "Failed to load properties.", 500);
    }

    const directory = mapCustomerRow(
      row as CustomerRow,
      (contactsResult.data ?? []) as CustomerContactRow[],
    );
    const propertyIds = (propertiesResult.data ?? []).map(
      (item) => (item as { id: string }).id,
    );
    return directoryCustomerToCustomer(directory, propertyIds);
  });

export const getWorkspacePropertyFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }): Promise<Property | null> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const { data: row, error } = await supabase
      .from("properties")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load property.", 500);
    if (!row) return null;

    const property = mapPropertyRow(row as PropertyRow);
    assertCustomerAccess(agent, property.customerId);
    return directoryPropertyToProperty(property);
  });

export const listWorkspaceIssuesFn = createServerFn({ method: "POST" })
  .validator(z.object({ propertyId: z.string().uuid() }))
  .handler(async ({ data }): Promise<Issue[]> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const { data: propertyRow, error: propertyError } = await supabase
      .from("properties")
      .select("customer_id")
      .eq("id", data.propertyId)
      .maybeSingle();

    if (propertyError) {
      throwHttpError(propertyError.message || "Failed to load property.", 500);
    }
    if (!propertyRow) throwHttpError("Property not found.", 404);

    const customerId = (propertyRow as { customer_id: string }).customer_id;
    assertCustomerAccess(agent, customerId);

    const [{ data: protocolRows, error: protocolError }, { data: customerRow, error: customerError }] =
      await Promise.all([
        supabase
          .from("protocols")
          .select("*")
          .eq("property_id", data.propertyId)
          .order("name"),
        supabase
          .from("customers")
          .select("guest_verification_steps")
          .eq("id", customerId)
          .maybeSingle(),
      ]);

    if (protocolError) {
      throwHttpError(protocolError.message || "Failed to load protocols.", 500);
    }
    if (customerError) {
      throwHttpError(customerError.message || "Failed to load customer.", 500);
    }

    const verificationSteps = mapCustomerRow(
      {
        id: customerId,
        name: "",
        email: null,
        phone: null,
        image_url: null,
        pms_url: null,
        pms_username: null,
        pms_password: null,
        guest_verification_steps:
          (customerRow as { guest_verification_steps?: unknown } | null)
            ?.guest_verification_steps ?? [],
        created_at: "",
        updated_at: "",
      },
      [],
    ).guestVerificationSteps.map((step) => step.label).filter(Boolean);

    return ((protocolRows ?? []) as ProtocolRow[]).map((row) =>
      protocolToIssue(mapProtocolRow(row), verificationSteps),
    );
  });

export const getWorkspaceIssueFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }): Promise<Issue | null> => {
    const session = await requireSession();
    const agent = toAgentAccess(session.agent);
    const supabase = createSupabaseAdmin();

    const { data: row, error } = await supabase
      .from("protocols")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load protocol.", 500);
    if (!row) return null;

    const protocol = mapProtocolRow(row as ProtocolRow);

    const { data: propertyRow, error: propertyError } = await supabase
      .from("properties")
      .select("customer_id")
      .eq("id", protocol.propertyId)
      .maybeSingle();

    if (propertyError) {
      throwHttpError(propertyError.message || "Failed to load property.", 500);
    }
    if (!propertyRow) return null;

    const customerId = (propertyRow as { customer_id: string }).customer_id;
    assertCustomerAccess(agent, customerId);

    const { data: customerRow } = await supabase
      .from("customers")
      .select("guest_verification_steps")
      .eq("id", customerId)
      .maybeSingle();

    const verificationSteps = mapCustomerRow(
      {
        id: customerId,
        name: "",
        email: null,
        phone: null,
        image_url: null,
        pms_url: null,
        pms_username: null,
        pms_password: null,
        guest_verification_steps:
          (customerRow as { guest_verification_steps?: unknown } | null)
            ?.guest_verification_steps ?? [],
        created_at: "",
        updated_at: "",
      },
      [],
    ).guestVerificationSteps.map((step) => step.label).filter(Boolean);

    return protocolToIssue(protocol, verificationSteps);
  });

export const getWorkspaceContactFn = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().min(1), customerId: z.string().uuid().optional() }))
  .handler(async ({ data }): Promise<GlobalContact | null> => {
    await requireSession();

    if (
      data.id === "next-day" ||
      data.id === "cleaning" ||
      data.id === "property"
    ) {
      const labels: Record<string, GlobalContact> = {
        "next-day": {
          id: "next-day",
          name: "Next-day follow-up",
          details: "Follow up with the host the next day.",
        },
        cleaning: {
          id: "cleaning",
          name: "Cleaning contact",
          details: "Escalate to the cleaning team.",
        },
        property: {
          id: "property",
          name: "Property / host contact",
          details: "Escalate using the property or host contact details.",
        },
      };
      return labels[data.id] ?? null;
    }

    if (!data.customerId) return null;

    const supabase = createSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("customer_contacts")
      .select("*")
      .eq("id", data.id)
      .eq("customer_id", data.customerId)
      .maybeSingle();

    if (error) throwHttpError(error.message || "Failed to load contact.", 500);
    if (!row) return null;

    const contact = row as CustomerContactRow;
    return {
      id: contact.id,
      name: contact.name || contact.label || "Contact",
      details: [contact.label, contact.phone].filter(Boolean).join(" · "),
      phones: contact.phone ? [contact.phone] : undefined,
    };
  });
