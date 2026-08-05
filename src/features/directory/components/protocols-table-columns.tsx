import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { DirectoryRowActionsMenu } from "@/features/directory/components/DirectoryRowActionsMenu";
import type { ProtocolListItem } from "@/features/directory/lib/map-protocol-row";

function ActionsCell({
  data,
  onView,
  onEdit,
  onDelete,
}: ICellRendererParams<ProtocolListItem> & {
  onView: (protocol: ProtocolListItem) => void;
  onEdit: (protocol: ProtocolListItem) => void;
  onDelete: (protocol: ProtocolListItem) => void;
}) {
  if (!data) return null;
  return (
    <DirectoryRowActionsMenu
      ariaLabel={`Actions for ${data.name}`}
      actions={[
        { id: "view", label: "View", icon: Eye, onSelect: () => onView(data) },
        { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(data) },
        {
          id: "delete",
          label: "Delete",
          icon: Trash2,
          onSelect: () => onDelete(data),
          danger: true,
        },
      ]}
    />
  );
}

export function createProtocolsTableColumnDefs(handlers: {
  onView: (protocol: ProtocolListItem) => void;
  onEdit: (protocol: ProtocolListItem) => void;
  onDelete: (protocol: ProtocolListItem) => void;
}): ColDef<ProtocolListItem>[] {
  return [
    {
      headerName: "CATEGORY",
      field: "category",
      colId: "category",
      width: 160,
      minWidth: 140,
      suppressSizeToFit: true,
    },
    {
      headerName: "PROTOCOL",
      field: "name",
      colId: "name",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "VERIFICATION",
      field: "reservationVerification",
      colId: "reservationVerification",
      width: 170,
      minWidth: 150,
      suppressSizeToFit: true,
    },
    {
      headerName: "PRIORITY",
      field: "priority",
      colId: "priority",
      width: 100,
      minWidth: 90,
      suppressSizeToFit: true,
    },
    {
      headerName: "",
      colId: "actions",
      pinned: "right",
      width: 52,
      minWidth: 52,
      maxWidth: 52,
      sortable: false,
      filter: false,
      resizable: false,
      suppressSizeToFit: true,
      cellRenderer: ActionsCell,
      cellRendererParams: handlers,
      onCellClicked: (params) => {
        params.event?.stopPropagation();
      },
    },
  ];
}
