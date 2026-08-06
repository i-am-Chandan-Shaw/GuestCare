import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellClickedEvent, IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { ChevronDown, FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getCustomerById } from "@/features/directory/api/customers.api";
import { getPropertyById } from "@/features/directory/api/properties.api";
import {
  deleteProtocol,
  getProtocolsPaginated,
} from "@/features/directory/api/protocols.api";
import { ConfirmDeleteDialog } from "@/features/directory/components/ConfirmDeleteDialog";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";
import { ProtocolBulkUploadDialog } from "@/features/directory/components/ProtocolBulkUploadDialog";
import { ProtocolFormDialog } from "@/features/directory/components/ProtocolFormDialog";
import { createProtocolsTableColumnDefs } from "@/features/directory/components/protocols-table-columns";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { ProtocolListItem } from "@/features/directory/lib/map-protocol-row";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export function ProtocolsPage() {
  const navigate = useNavigate();
  const { customerId, propertyId } = useParams({
    from: "/_authenticated/_shell/directory/$customerId/$propertyId",
  });
  const { customerName: customerNameFromSearch, propertyName: propertyNameFromSearch } = useSearch({
    from: "/_authenticated/_shell/directory/$customerId/$propertyId",
  });

  const [customerName, setCustomerName] = useState<string | null>(
    () => customerNameFromSearch?.trim() || null,
  );
  const [propertyName, setPropertyName] = useState<string | null>(
    () => propertyNameFromSearch?.trim() || null,
  );
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<ProtocolListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ProtocolListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const nextCustomerName = customerNameFromSearch?.trim() || null;
    const nextPropertyName = propertyNameFromSearch?.trim() || null;
    if (nextCustomerName) setCustomerName(nextCustomerName);
    if (nextPropertyName) setPropertyName(nextPropertyName);

    const needsCustomer = !nextCustomerName;
    const needsProperty = !nextPropertyName;
    if (!needsCustomer && !needsProperty) return;

    let cancelled = false;
    void Promise.all([
      needsCustomer ? getCustomerById(customerId) : Promise.resolve(null),
      needsProperty ? getPropertyById(propertyId) : Promise.resolve(null),
    ])
      .then(([customer, property]) => {
        if (cancelled) return;
        if (property && property.customerId !== customerId) {
          throw new Error("Property does not belong to this customer.");
        }
        if (customer) setCustomerName(customer.name);
        if (property) setPropertyName(property.name);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load property."));
        void navigate({
          to: "/directory/$customerId",
          params: { customerId },
          search: { customerName: customerNameFromSearch },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [
    customerId,
    propertyId,
    customerNameFromSearch,
    propertyNameFromSearch,
    navigate,
  ]);

  const openCreate = () => {
    setDialogMode("create");
    setEditingProtocolId(null);
    setDialogOpen(true);
  };

  const openEdit = useCallback((protocol: ProtocolListItem) => {
    setDialogMode("edit");
    setEditingProtocolId(protocol.id);
    setDialogOpen(true);
  }, []);

  const columnDefs = useMemo(
    () =>
      createProtocolsTableColumnDefs({
        onEdit: openEdit,
        onDelete: setDeleteTarget,
      }),
    [openEdit],
  );

  const handleFetchData = useCallback(
    async (params: IGetRowsParams) => {
      const startRow = params.startRow ?? 0;
      const limit = Math.max(1, (params.endRow ?? startRow + 50) - startRow);
      const page = Math.floor(startRow / limit) + 1;

      const result = await getProtocolsPaginated({
        propertyId,
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
    [propertyId, debouncedSearch],
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gridRef.current?.api?.refreshInfiniteCache();
  }, [debouncedSearch, propertyId]);

  const handleSaved = () => {
    gridRef.current?.api?.refreshInfiniteCache();
  };

  const handleCellClicked = (event: CellClickedEvent<ProtocolListItem>) => {
    if (!event.data) return;
    if (event.column?.getColId() === "actions") return;
    openEdit(event.data);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProtocol(deleteTarget.id);
      toast.success("Protocol deleted.");
      setDeleteTarget(null);
      gridRef.current?.api?.refreshInfiniteCache();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to delete protocol."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DirectoryListLayout
        title={propertyName ?? "…"}
        subtitle={customerName ? `${customerName} · Protocols` : "Protocols"}
        backLabel="Back to properties"
        onBack={() => {
          void navigate({
            to: "/directory/$customerId",
            params: { customerId },
            search: { customerName: customerName ?? undefined },
          });
        }}
        headerActions={
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" size="sm" className="shrink-0">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add protocol
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
            placeholder="Search protocols…"
            onClear={() => setSearch("")}
          />
        }
      >
        <ServerPaginatedTable<ProtocolListItem>
          gridRef={gridRef}
          columnDefs={columnDefs}
          fetchData={handleFetchData}
          getRowId={({ data }) => data.id}
          emptyMessage="No protocols match your search."
          height="100%"
          className="ag-grid-guestcare ag-grid-guestcare--clickable-rows"
          onCellClicked={handleCellClicked}
        />
      </DirectoryListLayout>

      <ProtocolFormDialog
        open={dialogOpen}
        mode={dialogMode}
        customerId={customerId}
        propertyId={propertyId}
        protocolId={editingProtocolId}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />

      <ProtocolBulkUploadDialog
        open={bulkUploadOpen}
        customerId={customerId}
        propertyId={propertyId}
        onOpenChange={setBulkUploadOpen}
        onSaved={handleSaved}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete protocol?"
        description={
          deleteTarget ? `Delete ${deleteTarget.name}? This cannot be undone.` : ""
        }
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
