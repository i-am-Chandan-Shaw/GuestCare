import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellClickedEvent, IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { toast } from "sonner";
import { getCustomerById } from "@/features/directory/api/customers.api";
import {
  deleteProperty,
  getPropertiesPaginated,
} from "@/features/directory/api/properties.api";
import { ConfirmDeleteDialog } from "@/features/directory/components/ConfirmDeleteDialog";
import { DirectoryBreadcrumb } from "@/features/directory/components/DirectoryBreadcrumb";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";
import { PropertyFormDialog } from "@/features/directory/components/PropertyFormDialog";
import { PropertyViewDialog } from "@/features/directory/components/PropertyViewDialog";
import { createPropertiesTableColumnDefs } from "@/features/directory/components/properties-table-columns";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { PropertyListItem } from "@/features/directory/lib/map-property-row";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function PropertiesPage() {
  const navigate = useNavigate();
  const { customerId } = useParams({ from: "/_authenticated/_shell/directory/$customerId/" });

  const [customerName, setCustomerName] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<PropertyListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingPropertyId, setEditingPropertyId] = useState<string | null>(null);
  const [viewPropertyId, setViewPropertyId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<PropertyListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
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
  }, [customerId, navigate]);

  const openProtocols = useCallback(
    (property: PropertyListItem) => {
      void navigate({
        to: "/directory/$customerId/$propertyId",
        params: { customerId, propertyId: property.id },
      });
    },
    [customerId, navigate],
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

  const openView = useCallback((property: PropertyListItem) => {
    setViewPropertyId(property.id);
  }, []);

  const columnDefs = useMemo(
    () =>
      createPropertiesTableColumnDefs({
        onView: openView,
        onEdit: openEdit,
        onDelete: setDeleteTarget,
        onShowProtocols: openProtocols,
      }),
    [openEdit, openProtocols, openView],
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
    gridRef.current?.api?.purgeInfiniteCache();
  }, [debouncedSearch, customerId]);

  const handleSaved = () => {
    gridRef.current?.api?.purgeInfiniteCache();
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
      gridRef.current?.api?.purgeInfiniteCache();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to delete property."));
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
              { label: customerName ?? "…" },
            ]}
          />
        }
        addLabel="Add property"
        onAdd={openCreate}
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

      <PropertyViewDialog
        open={Boolean(viewPropertyId)}
        propertyId={viewPropertyId}
        onOpenChange={(open) => {
          if (!open) setViewPropertyId(null);
        }}
        onEdit={(id) => {
          setDialogMode("edit");
          setEditingPropertyId(id);
          setDialogOpen(true);
        }}
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
