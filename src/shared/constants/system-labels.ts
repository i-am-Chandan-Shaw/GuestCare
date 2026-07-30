import type { SystemKey } from "@/shared/types";

export const SYSTEM_LABELS: Record<SystemKey, string> = {
  heating: "Heating + Hot Water",
  alarms: "Alarms / AOV / Fire",
  breakIn: "Break-in / Theft",
  locksmith: "Locksmiths",
  drains: "Drains",
  emergencyLights: "Emergency Lights",
  electrical: "Electrical",
  gas: "Gas",
  leak: "Leak",
  lifts: "Lifts",
  waterSupply: "Water Supply",
};
