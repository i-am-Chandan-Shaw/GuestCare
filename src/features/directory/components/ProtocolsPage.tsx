import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellClickedEvent, IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { getCustomerById } from "@/features/directory/api/customers.api";
import { getPropertyById } from "@/features/directory/api/properties.api";
import {
  deleteProtocol,
  getProtocolsPaginated,
} from "@/features/directory/api/protocols.api";
import { ConfirmDeleteDialog } from "@/features/directory/components/ConfirmDeleteDialog";
import { DirectoryBreadcrumb } from "@/features/directory/components/DirectoryBreadcrumb";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";
import { ProtocolFormDialog } from "@/features/directory/components/ProtocolFormDialog";
import { ProtocolViewDialog } from "@/features/directory/components/ProtocolViewDialog";
import { createProtocolsTableColumnDefs } from "@/features/directory/components/protocols-table-columns";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { ProtocolListItem } from "@/features/directory/lib/map-protocol-row";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function ProtocolsPage() {
  const navigate = useNavigate();
  const { customerId, propertyId } = useParams({
    from: "/_authenticated/_shell/directory/$customerId/$propertyId",
  });

  const [customerName, setCustomerName] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<ProtocolListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingProtocolId, setEditingProtocolId] = useState<string | null>(null);

  const [viewProtocolId, setViewProtocolId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProtocolListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([getCustomerById(customerId), getPropertyById(propertyId)])
      .then(([customer, property]) => {
        if (cancelled) return;
        if (property.customerId !== customerId) {
          throw new Error("Property does not belong to this customer.");
        }
        setCustomerName(customer.name);
        setPropertyName(property.name);
      })
      .catch((error) => {
        if (cancelled) return;
        toast.error(getClientErrorMessage(error, "Failed to load property."));
        void navigate({
          to: "/directory/$customerId",
          params: { customerId },
        });
      });
    return () => {
      cancelled = true;
    };
  }, [customerId, propertyId, navigate]);

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

  const openView = useCallback((protocol: ProtocolListItem) => {
    setViewProtocolId(protocol.id);
  }, []);

  const columnDefs = useMemo(
    () =>
      createProtocolsTableColumnDefs({
        onView: openView,
        onEdit: openEdit,
        onDelete: setDeleteTarget,
      }),
    [openEdit, openView],
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
    gridRef.current?.api?.purgeInfiniteCache();
  }, [debouncedSearch, propertyId]);

  const handleSaved = () => {
    gridRef.current?.api?.purgeInfiniteCache();
  };

  const handleCellClicked = (event: CellClickedEvent<ProtocolListItem>) => {
    if (!event.data) return;
    if (event.column?.getColId() === "actions") return;
    openView(event.data);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteProtocol(deleteTarget.id);
      toast.success("Protocol deleted.");
      setDeleteTarget(null);
      gridRef.current?.api?.purgeInfiniteCache();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to delete protocol."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DirectoryListLayout
        breadcrumb={
          <DirectoryBreadcrumb
            items={[
              { label: "Directory", to: "/directory" },
              {
                label: customerName ?? "…",
                to: "/directory/$customerId",
                params: { customerId },
              },
              { label: propertyName ?? "…" },
            ]}
          />
        }
        addLabel="Add protocol"
        onAdd={openCreate}
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

      <ProtocolViewDialog
        open={Boolean(viewProtocolId)}
        protocolId={viewProtocolId}
        customerId={customerId}
        onOpenChange={(open) => {
          if (!open) setViewProtocolId(null);
        }}
        onEdit={(id) => {
          setDialogMode("edit");
          setEditingProtocolId(id);
          setDialogOpen(true);
        }}
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
