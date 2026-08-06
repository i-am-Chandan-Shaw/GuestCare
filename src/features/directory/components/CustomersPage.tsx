import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CellClickedEvent, IGetRowsParams } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { useNavigate } from "@tanstack/react-router";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { ChevronDown, FileSpreadsheet, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  deleteCustomer,
  getCustomersPaginated,
} from "@/features/directory/api/customers.api";
import { ConfirmDeleteDialog } from "@/features/directory/components/ConfirmDeleteDialog";
import { CustomerFormDialog } from "@/features/directory/components/CustomerFormDialog";
import { CustomerWorkbookImportDialog } from "@/features/directory/components/CustomerWorkbookImportDialog";
import { createCustomersTableColumnDefs } from "@/features/directory/components/customers-table-columns";
import { DirectoryListLayout } from "@/features/directory/components/DirectoryListLayout";
import { getClientErrorMessage } from "@/features/directory/lib/client-error";
import type { CustomerListItem } from "@/features/directory/lib/map-customer-row";
import {
  ServerPaginatedTable,
  computeInfiniteScrollLastRow,
} from "@/components/table/ServerPaginatedTable";
import { Button } from "@/components/ui/Button";
import { SearchToolbar } from "@/shared/components/SearchToolbar";
import { useDebouncedValue } from "@/shared/hooks/use-debounced-value";
import { cn } from "@/lib/utils";

export function CustomersPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 300);
  const gridRef = useRef<AgGridReact<CustomerListItem>>(null);
  const isMounted = useRef(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);
  const [importOpen, setImportOpen] = useState(false);

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
    gridRef.current?.api?.refreshInfiniteCache();
  }, [debouncedSearch]);

  const handleSaved = () => {
    gridRef.current?.api?.refreshInfiniteCache();
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
      gridRef.current?.api?.refreshInfiniteCache();
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
        headerActions={
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <Button type="button" size="sm" className="shrink-0">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Add customer
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
                  onSelect={() => setImportOpen(true)}
                  className="flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-text-primary outline-none data-[highlighted]:bg-app-bg"
                >
                  <FileSpreadsheet className="h-4 w-4 shrink-0" strokeWidth={2} />
                  Import from Excel
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

      <CustomerWorkbookImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
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
