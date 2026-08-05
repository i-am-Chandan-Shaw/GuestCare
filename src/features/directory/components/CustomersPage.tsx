import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellClickedEvent, IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  deleteCustomer,
  getCustomersPaginated,
} from "@/features/directory/api/customers.api";
import { ConfirmDeleteDialog } from "@/features/directory/components/ConfirmDeleteDialog";
import { CustomerFormDialog } from "@/features/directory/components/CustomerFormDialog";
import { createCustomersTableColumnDefs } from "@/features/directory/components/customers-table-columns";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { CustomerListItem } from "@/features/directory/lib/map-customer-row";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";

export function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<CustomerListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CustomerListItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const openProperties = useCallback(
    (customer: CustomerListItem) => {
      void navigate({
        to: "/directory/$customerId",
        params: { customerId: customer.id },
        search: { customerName: customer.name },
      });
    },
    [navigate],
  );

  const openCreate = () => {
    setDialogMode("create");
    setEditingCustomerId(null);
    setDialogOpen(true);
  };

  const openEdit = useCallback((customer: CustomerListItem) => {
    setDialogMode("edit");
    setEditingCustomerId(customer.id);
    setDialogOpen(true);
  }, []);

  const columnDefs = useMemo(
    () =>
      createCustomersTableColumnDefs({
        onEdit: openEdit,
        onDelete: setDeleteTarget,
        onShowProperties: openProperties,
      }),
    [openEdit, openProperties],
  );

  const handleFetchData = useCallback(
    async (params: IGetRowsParams) => {
      const startRow = params.startRow ?? 0;
      const limit = Math.max(1, (params.endRow ?? startRow + 50) - startRow);
      const page = Math.floor(startRow / limit) + 1;

      const result = await getCustomersPaginated({
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
    [debouncedSearch],
  );

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    gridRef.current?.api?.purgeInfiniteCache();
  }, [debouncedSearch]);

  const handleSaved = () => {
    gridRef.current?.api?.purgeInfiniteCache();
  };

  const handleCellClicked = (event: CellClickedEvent<CustomerListItem>) => {
    if (!event.data) return;
    if (event.column?.getColId() === "actions") return;
    openProperties(event.data);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCustomer(deleteTarget.id);
      toast.success("Customer deleted.");
      setDeleteTarget(null);
      gridRef.current?.api?.purgeInfiniteCache();
    } catch (error) {
      toast.error(getClientErrorMessage(error, "Failed to delete customer."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DirectoryListLayout
        title="Directory"
        subtitle="Customers, properties, and protocols"
        addLabel="Add customer"
        onAdd={openCreate}
        toolbar={
          <SearchToolbar
            layout="inline"
            className="w-full max-w-md"
            value={search}
            onChange={setSearch}
            placeholder="Search customers…"
            onClear={() => setSearch("")}
          />
        }
      >
        <ServerPaginatedTable<CustomerListItem>
          gridRef={gridRef}
          columnDefs={columnDefs}
          fetchData={handleFetchData}
          getRowId={({ data }) => data.id}
          emptyMessage="No customers match your search."
          height="100%"
          className="ag-grid-guestcare ag-grid-guestcare--clickable-rows"
          onCellClicked={handleCellClicked}
        />
      </DirectoryListLayout>

      <CustomerFormDialog
        open={dialogOpen}
        mode={dialogMode}
        customerId={editingCustomerId}
        onOpenChange={setDialogOpen}
        onSaved={handleSaved}
      />

      <ConfirmDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete customer?"
        description={
          deleteTarget
            ? `Delete ${deleteTarget.name}? This also removes their contacts and properties.`
            : ""
        }
        loading={deleting}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
}
