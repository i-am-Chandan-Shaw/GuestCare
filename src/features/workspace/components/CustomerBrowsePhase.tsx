import { useMemo, useState } from "react";
import { useCustomerSummaries } from "@/features/customers/hooks/useCustomers";
import { CustomerPortfolioCard } from "@/shared/components/CustomerPortfolioCard";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import type { CustomerSummary } from "@/shared/types";

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

  if (isLoading) return <LoadingState label="Loading customers…" />;
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-app-bg p-4">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
          <h2 className="text-[14px] font-bold text-text-primary">
            Customers ({customers.length})
          </h2>
          <SearchToolbar
            layout="inline"
            className="w-full max-w-[250px]"
            value={search}
            onChange={setSearch}
            placeholder="Search customers…"
            onClear={() => setSearch("")}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="m-4 rounded-md border border-dashed border-border bg-card p-8 text-center text-[13px] text-card-subtext">
              No customers match your search.
            </p>
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
