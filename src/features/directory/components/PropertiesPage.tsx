import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellClickedEvent, IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ChevronDown, FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getCustomerById } from "@/features/directory/api/customers.api";
import {
  deleteProperty,
  getPropertiesPaginated,
} from "@/features/directory/api/properties.api";
import { ConfirmDeleteDialog } from "@/features/directory/components/ConfirmDeleteDialog";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";
import { PropertyBulkUploadDialog } from "@/features/directory/components/PropertyBulkUploadDialog";
import { PropertyFormDialog } from "@/features/directory/components/PropertyFormDialog";
import { createPropertiesTableColumnDefs } from "@/features/directory/components/properties-table-columns";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { PropertyListItem } from "@/features/directory/lib/map-property-row";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export function PropertiesPage() {
  const navigate = useNavigate();
  const { customerId } = useParams({ from: "/_authenticated/_shell/directory/$customerId/" });
  const { customerName: customerNameFromSearch } = useSearch({
    from: "/_authenticated/_shell/directory/$customerId/",
  });

  const [customerName, setCustomerName] = useState<string | null>(
    () => customerNameFromSearch?.trim() || null,
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<PropertyListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PropertyListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fromSearch = customerNameFromSearch?.trim() || null;
    if (fromSearch) {
      setCustomerName(fromSearch);
      return;
    }

    let cancelled = false;
    void getCustomerById(customerId)
      .then((customer) => {
        if (!cancelled) setCustomerName(customer.name);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load customer."));
        void navigate({ to: "/directory" });
      });
    return () => {
      cancelled = true;
    };
  }, [customerId, customerNameFromSearch, navigate]);

  const openProtocols = useCallback(
    (property: PropertyListItem) => {
      void navigate({
        to: "/directory/$customerId/$propertyId",
        params: { customerId, propertyId: property.id },
        search: {
          customerName: customerName ?? undefined,
          propertyName: property.name,
        },
      });
    },
    [customerId, customerName, navigate],
  );

  const openCreate = () => {
    setDialogMode("create");
    setEditingPropertyId(null);
    setDialogOpen(true);
  };

  const openEdit = useCallback((property: PropertyListItem) => {
    setDialogMode("edit");
    setEditingPropertyId(property.id);
    setDialogOpen(true);
  }, []);

  const columnDefs = useMemo(
    () =>
      createPropertiesTableColumnDefs({
        onEdit: openEdit,
        onDelete: setDeleteTarget,
        onShowProtocols: openProtocols,
      }),
    [openEdit, openProtocols],
  );

  const handleFetchData = useCallback(
    async (params: IGetRowsParams) => {
      const startRow = params.startRow ?? 0;
      const limit = Math.max(1, (params.endRow ?? startRow + 50) - startRow);
      const page = Math.floor(startRow / limit) + 1;

      const result = await getPropertiesPaginated({
        customerId,
        page,
        limit,
        search: debouncedSearch,
      });

      const lastRow = computeInfiniteScrollLastRow({
        startRow,
        rows: result.data,
        pageSize: limit,
        totalCountFromApi: result.pagination.total,
      });

      return { data: result.data, lastRow };
    },
    [customerId, debouncedSearch],
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gridRef.current?.api?.refreshInfiniteCache();
  }, [debouncedSearch, customerId]);

  const handleSaved = () => {
    gridRef.current?.api?.refreshInfiniteCache();
  };

  const handleCellClicked = (event: CellClickedEvent<PropertyListItem>) => {
    if (!event.data) return;
    if (event.column?.getColId() === "actions") return;
    openProtocols(event.data);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProperty(deleteTarget.id);
      toast.success("Property deleted.");
      setDeleteTarget(null);
      gridRef.current?.api?.refreshInfiniteCache();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to delete property."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DirectoryListLayout
        title={customerName ?? "…"}
        subtitle="Properties"
        backLabel="Back to directory"
        onBack={() => {
          void navigate({ to: "/directory" });
        }}
        headerActions={
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" size="sm" className="shrink-0">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add property
                <ChevronDown className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                side="bottom"
                align="end"
                sideOffset={6}
                className={cn(
                  "z-[100] min-w-[200px] rounded-lg bg-card-bg p-1",
                  "[filter:drop-shadow(0_8px_20px_rgba(42,38,34,0.14))_drop-shadow(0_0_0.6px_var(--kn-color-border))]",
                  "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
                )}
              >
                <DropdownMenu.Item
                  onSelect={() => setBulkUploadOpen(true)}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-text-primary outline-none data-[highlighted]:bg-app-bg"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0" strokeWidth={2} />
                  Upload Excel
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={openCreate}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-text-primary outline-none data-[highlighted]:bg-app-bg"
                >
                  <Plus className="h-4 w-4 shrink-0" strokeWidth={2} />
                  Add manually
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        }
        toolbar={
          <SearchToolbar
            layout="inline"
            className="w-full max-w-md"
            value={search}
            onChange={setSearch}
            placeholder="Search properties…"
            onClear={() => setSearch("")}
          />
        }
      >
        <ServerPaginatedTable<PropertyListItem>
          gridRef={gridRef}
          columnDefs={columnDefs}
          fetchData={handleFetchData}
          getRowId={({ data }) => data.id}
          emptyMessage="No properties match your search."
          height="100%"
          className="ag-grid-guestcare ag-grid-guestcare--clickable-rows"
          onCellClicked={handleCellClicked}
        />
      </DirectoryListLayout>

      <PropertyFormDialog
        open={dialogOpen}
        mode={dialogMode}
        customerId={customerId}
        propertyId={editingPropertyId}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />

      <PropertyBulkUploadDialog
        open={bulkUploadOpen}
        customerId={customerId}
        onOpenChange={setBulkUploadOpen}
        onSaved={handleSaved}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete property?"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This also removes protocols for this property.`
            : ""
        }
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
