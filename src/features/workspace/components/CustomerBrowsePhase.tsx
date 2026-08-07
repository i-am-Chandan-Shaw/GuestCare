import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { FolderOpen, Plus, SearchX } from "lucide-react";
import { useCustomerSummaries } from "@/features/customers/hooks/useCustomers";
import { Button } from "@/components/ui/Button";
import { CustomerPortfolioCard } from "@/shared/components/CustomerPortfolioCard";
import { CustomerListSkeleton } from "@/shared/components/ListSkeletons";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import type { CustomerSummary } from "@/shared/types";

function CustomersEmptyState({
  hasCustomers,
  onClearSearch,
}: {
  hasCustomers: boolean;
  onClearSearch: () => void;
}) {
  const navigate = useNavigate();
  const goToDirectory = () => {
    void navigate({ to: "/directory" });
  };

  if (!hasCustomers) {
    return (
      <div className="m-4 flex flex-col items-center gap-4 rounded-md border border-dashed border-border bg-card px-6 py-10 text-center">
        <div className="flex size-11 items-center justify-center rounded-full bg-app-bg text-text-muted">
          <FolderOpen className="size-5" aria-hidden />
        </div>
        <div className="max-w-sm space-y-1.5">
          <p className="text-[14px] font-semibold text-text-primary">No customers yet</p>
          <p className="text-[13px] text-card-subtext">
            Add customers in the directory before you can start a call workspace.
          </p>
        </div>
        <Button type="button" size="sm" onClick={goToDirectory}>
          <Plus className="size-3.5" aria-hidden />
          Go to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="m-4 flex flex-col items-center gap-4 rounded-md border border-dashed border-border bg-card px-6 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-full bg-app-bg text-text-muted">
        <SearchX className="size-5" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1.5">
        <p className="text-[14px] font-semibold text-text-primary">
          No customers match your search
        </p>
        <p className="text-[13px] text-card-subtext">
          Try a different name, email, or phone — or add a new customer in the directory.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={onClearSearch}>
          Clear search
        </Button>
        <Button type="button" size="sm" onClick={goToDirectory}>
          <Plus className="size-3.5" aria-hidden />
          Go to Directory
        </Button>
      </div>
    </div>
  );
}

export function CustomerBrowsePhase({
  onSelect,
}: {
  onSelect: (customer: CustomerSummary) => void;
}) {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useCustomerSummaries();

  const customers = data ?? [];

  const filtered = useMemo(
    () =>
      filterBySearch(customers, search, (customer) =>
        [customer.name, customer.email, customer.phone].join(" "),
      ),
    [customers, search],
  );

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-app-bg p-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
          <h2 className="text-[14px] font-bold text-text-primary">
            Customers{isLoading ? "" : ` (${customers.length})`}
          </h2>
          <SearchToolbar
            layout="inline"
            className="w-full max-w-[250px]"
            value={search}
            onChange={setSearch}
            placeholder="Search customers…"
            onClear={() => setSearch("")}
            disabled={isLoading}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isLoading ? (
            <CustomerListSkeleton />
          ) : filtered.length === 0 ? (
            <CustomersEmptyState
              hasCustomers={customers.length > 0}
              onClearSearch={() => setSearch("")}
            />
          ) : (
            <ul className="divide-y divide-border-color">
              {filtered.map((customer, index) => (
                <li key={customer.id}>
                  <CustomerPortfolioCard
                    customer={customer}
                    striped={index % 2 === 1}
                    onSelect={() => onSelect(customer)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
