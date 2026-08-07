import type { IncidentStatus, IncidentType, Priority } from "@/shared/types";

export interface FormState {
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
}

export function emptyForm(): FormState {
  return {
    callerName: "",
    callerContact: "",
    reservation: "",
    nameOnBooking: "",
    incidentType: "Technical Issues",
    issueSummary: "",
    actions: [],
    priority: "Medium-High",
    status: "In Progress",
    callNotes: "",
  };
}
