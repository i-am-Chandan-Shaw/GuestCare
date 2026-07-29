import { useMemo, useState } from "react";
import { usePropertySummaries } from "@/features/customers/hooks/useCustomers";
import { LoadingState } from "@/shared/components/LoadingState";
import { PropertyPortfolioCard } from "@/shared/components/PropertyPortfolioCard";
import { PortfolioCardList } from "@/shared/components/PortfolioCardList";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import type { Customer, PropertySummary } from "@/shared/types";

export function CustomerLockedPhase({
  customer,
  onSelectProperty,
}: {
  customer: Customer;
  onSelectProperty: (property: PropertySummary) => void;
}) {
  const [search, setSearch] = useState("");
  const propertiesQuery = usePropertySummaries(customer.id);

  const filtered = useMemo(
    () =>
      filterBySearch(propertiesQuery.data ?? [], search, (property) =>
        [property.name, property.address, property.tags.join(" ")].join(" "),
      ),
    [propertiesQuery.data, search],
  );

  if (propertiesQuery.isLoading) {
    return <LoadingState label="Loading properties…" />;
  }

  if (propertiesQuery.isError) {
    return <QueryErrorState onRetry={() => propertiesQuery.refetch()} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="shrink-0 bg-app-bg px-5 pt-3 pb-4">
        <SearchToolbar
          className="max-w-xl"
          value={search}
          onChange={setSearch}
          placeholder="Search properties…"
          onClear={() => setSearch("")}
          resultLabel={
            search.trim()
              ? `Showing ${filtered.length} of ${propertiesQuery.data?.length ?? 0} properties`
              : undefined
          }
        />
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-0">
        {filtered.length === 0 ? (
          <p className="m-5 rounded-md border border-dashed border-border bg-card p-10 text-center text-[13px] text-card-subtext">
            No properties match your search.
          </p>
        ) : (
          <PortfolioCardList>
            {filtered.map((property) => (
              <PropertyPortfolioCard
                key={property.id}
                property={property}
                onSelect={() => onSelectProperty(property)}
              />
            ))}
          </PortfolioCardList>
        )}
      </div>
    </div>
  );
}
