import { useMemo } from "react";
import { useCustomerSummaries } from "@/features/customers/hooks/useCustomers";
import { CustomerPortfolioCard } from "@/shared/components/CustomerPortfolioCard";
import { PortfolioCardList } from "@/shared/components/PortfolioCardList";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { filterBySearch } from "@/shared/components/SearchToolbar";
import type { CustomerSummary } from "@/shared/types";

export function CustomerBrowsePhase({
  search,
  onSelect,
}: {
  search: string;
  onSelect: (customer: CustomerSummary) => void;
}) {
  const { data, isLoading, isError, refetch } = useCustomerSummaries();

  const filtered = useMemo(
    () =>
      filterBySearch(data ?? [], search, (customer) =>
        [customer.name, customer.email, customer.phone].join(" "),
      ),
    [data, search],
  );

  if (isLoading) return <LoadingState label="Loading customers…" />;
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-0">
      {filtered.length === 0 ? (
        <p className="m-5 rounded-md border border-dashed border-border bg-card p-10 text-center text-[13px] text-card-subtext">
          No customers match your search.
        </p>
      ) : (
        <PortfolioCardList>
          {filtered.map((customer, index) => (
            <CustomerPortfolioCard
              key={customer.id}
              customer={customer}
              alternate={index % 2 === 1}
              onSelect={() => onSelect(customer)}
            />
          ))}
        </PortfolioCardList>
      )}
    </div>
  );
}
