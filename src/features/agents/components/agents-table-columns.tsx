import type { ColDef } from "ag-grid-community";
import type { AgentProfile } from "@/shared/types";

export const agentsTableColumnDefs: ColDef<AgentProfile>[] = [
  {
    headerName: "AGENT",
    field: "name",
    colId: "name",
    flex: 1,
    minWidth: 180,
  },
  {
    headerName: "HANDLE",
    field: "handle",
    colId: "handle",
    flex: 1,
    minWidth: 120,
  },
  {
    headerName: "ROLE",
    field: "role",
    colId: "role",
    flex: 1,
    minWidth: 160,
  },
  {
    headerName: "SHIFT",
    field: "shift",
    colId: "shift",
    flex: 1,
    minWidth: 160,
    cellClass: "tabular-nums",
  },
];
