import type { IncidentStatus, IncidentType } from "@/shared/types";

export const INCIDENT_TYPES: IncidentType[] = [
  "Technical Issues",
  "Property Access Issues",
  "Reservations + Booking",
  "Cleaning + Laundry",
  "Guest-Related Issues",
  "Other",
];

export const INCIDENT_STATUSES: IncidentStatus[] = [
  "In Progress",
  "Resolved",
  "Unresolved - Escalation Handover",
  "PM Follow-up Needed",
];
