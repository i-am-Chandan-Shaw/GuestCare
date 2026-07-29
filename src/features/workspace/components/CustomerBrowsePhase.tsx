import { useEffect, useMemo, useRef, useState } from "react";
import { useCustomerSummaries } from "@/features/customers/hooks/useCustomers";
import { CustomerPortfolioCard } from "@/shared/components/CustomerPortfolioCard";
import { PortfolioCardList } from "@/shared/components/PortfolioCardList";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import type { CustomerSummary } from "@/shared/types";
import { Info } from "lucide-react";

export function CustomerBrowsePhase({
  onSelect,
}: {
  onSelect: (customer: CustomerSummary) => void;
}) {
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoading, isError, refetch } = useCustomerSummaries();

  const filtered = useMemo(
    () =>
      filterBySearch(data ?? [], search, (customer) =>
        [customer.name, customer.email, customer.phone].join(" "),
      ),
    [data, search],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (isLoading) return <LoadingState label="Loading customers…" />;
  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white">
      <div className="shrink-0 space-y-3 bg-white px-5 pt-3 pb-4">
        <div className="flex items-center gap-2.5 rounded-md border border-brand-primary/10 bg-brand-primary/[0.04] px-3 py-2">
          <span
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white"
            aria-hidden
          >
            <Info className="h-3 w-3" strokeWidth={2.5} />
          </span>
          <p className="text-[13px] font-medium text-brand-primary">
            Select a customer to view their properties and incidents.
          </p>
        </div>

        <SearchToolbar
          className="w-full max-w-[250px]"
          value={search}
          onChange={setSearch}
          placeholder="Search customers…"
          onClear={() => setSearch("")}
          shortcutHint="⌘K"
          inputRef={searchInputRef}
          resultLabel={
            search.trim()
              ? `Showing ${filtered.length} of ${data?.length ?? 0} customers`
              : undefined
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-white p-0">
        {filtered.length === 0 ? (
          <p className="m-5 rounded-md border border-dashed border-border bg-card p-10 text-center text-[13px] text-card-subtext">
            No customers match your search.
          </p>
        ) : (
          <PortfolioCardList>
            {filtered.map((customer) => (
              <CustomerPortfolioCard
                key={customer.id}
                customer={customer}
                onSelect={() => onSelect(customer)}
              />
            ))}
          </PortfolioCardList>
        )}
      </div>
    </div>
  );
}
