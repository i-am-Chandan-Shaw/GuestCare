import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { FileText, Pencil, Trash2 } from "lucide-react";
import { DirectoryRowActionsMenu } from "@/features/directory/components/DirectoryRowActionsMenu";
import type { PropertyListItem } from "@/features/directory/lib/map-property-row";

function ActionsCell({
  data,
  onEdit,
  onDelete,
  onShowProtocols,
}: ICellRendererParams<PropertyListItem> & {
  onEdit: (property: PropertyListItem) => void;
  onDelete: (property: PropertyListItem) => void;
  onShowProtocols: (property: PropertyListItem) => void;
}) {
  if (!data) return null;
  return (
    <DirectoryRowActionsMenu
      ariaLabel={`Actions for ${data.name}`}
      actions={[
        { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(data) },
        {
          id: "protocols",
          label: "Show protocols",
          icon: FileText,
          onSelect: () => onShowProtocols(data),
        },
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

export function createPropertiesTableColumnDefs(handlers: {
  onEdit: (property: PropertyListItem) => void;
  onDelete: (property: PropertyListItem) => void;
  onShowProtocols: (property: PropertyListItem) => void;
}): ColDef<PropertyListItem>[] {
  return [
    {
      headerName: "PROPERTY",
      field: "name",
      colId: "name",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "TYPE",
      field: "type",
      colId: "type",
      width: 140,
      minWidth: 120,
      suppressSizeToFit: true,
    },
    {
      headerName: "MAX GUESTS",
      field: "maxGuests",
      colId: "maxGuests",
      width: 120,
      minWidth: 110,
      suppressSizeToFit: true,
      valueFormatter: ({ value }) => (value == null ? "—" : String(value)),
    },
    {
      headerName: "ADDRESS",
      field: "address",
      colId: "address",
      flex: 1.2,
      minWidth: 200,
      valueFormatter: ({ value }) => (value ? String(value) : "—"),
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
