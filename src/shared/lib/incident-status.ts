import type { IncidentLog } from "@/shared/types";

export function isOpenIncident(log: IncidentLog): boolean {
  return log.status !== "Resolved";
}
