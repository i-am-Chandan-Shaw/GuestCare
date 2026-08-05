import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { Building2, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { DirectoryRowActionsMenu } from "@/features/directory/components/DirectoryRowActionsMenu";
import type { CustomerListItem } from "@/features/directory/lib/map-customer-row";

function CustomerNameCell({ data }: ICellRendererParams<CustomerListItem>) {
  if (!data) return null;
  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <Avatar name={data.name} seed={data.id} src={data.imageUrl} size="md" />
      <span className="truncate text-[13px] font-medium text-text-primary">{data.name}</span>
    </span>
  );
}

function ActionsCell({
  data,
  onEdit,
  onDelete,
  onShowProperties,
}: ICellRendererParams<CustomerListItem> & {
  onEdit: (customer: CustomerListItem) => void;
  onDelete: (customer: CustomerListItem) => void;
  onShowProperties: (customer: CustomerListItem) => void;
}) {
  if (!data) return null;
  return (
    <DirectoryRowActionsMenu
      ariaLabel={`Actions for ${data.name}`}
      actions={[
        { id: "edit", label: "Edit", icon: Pencil, onSelect: () => onEdit(data) },
        {
          id: "properties",
          label: "Show properties",
          icon: Building2,
          onSelect: () => onShowProperties(data),
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

export function createCustomersTableColumnDefs(handlers: {
  onEdit: (customer: CustomerListItem) => void;
  onDelete: (customer: CustomerListItem) => void;
  onShowProperties: (customer: CustomerListItem) => void;
}): ColDef<CustomerListItem>[] {
  return [
    {
      headerName: "CUSTOMER",
      field: "name",
      colId: "name",
      flex: 1,
      minWidth: 200,
      cellRenderer: CustomerNameCell,
    },
    {
      headerName: "EMAIL",
      field: "email",
      colId: "email",
      flex: 1,
      minWidth: 180,
    },
    {
      headerName: "PHONE",
      field: "phone",
      colId: "phone",
      width: 160,
      minWidth: 140,
      suppressSizeToFit: true,
    },
    {
      headerName: "CONTACTS",
      field: "contactsCount",
      colId: "contactsCount",
      width: 110,
      minWidth: 110,
      suppressSizeToFit: true,
    },
    {
      headerName: "PROPERTIES",
      field: "propertyCount",
      colId: "propertyCount",
      width: 120,
      minWidth: 110,
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
