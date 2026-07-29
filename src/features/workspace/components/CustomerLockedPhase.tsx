import { useMemo, useState } from "react";
import {
  useCustomerSummary,
  usePropertySummaries,
} from "@/features/customers/hooks/useCustomers";
import { CustomerIssueHistoryPanel } from "@/features/workspace/components/CustomerIssueHistoryPanel";
import { CustomerSummaryBanner } from "@/features/workspace/components/CustomerSummaryBanner";
import { PropertyListRow } from "@/features/workspace/components/PropertyListRow";
import { LoadingState } from "@/shared/components/LoadingState";
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
  const summaryQuery = useCustomerSummary(customer.id);
  const propertiesQuery = usePropertySummaries(customer.id);

  const sortedProperties = useMemo(() => {
    const list = [...(propertiesQuery.data ?? [])];
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [propertiesQuery.data]);

  const filtered = useMemo(
    () =>
      filterBySearch(sortedProperties, search, (property) =>
        [property.name, property.address, property.tags.join(" ")].join(" "),
      ),
    [sortedProperties, search],
  );

  const firstProperty = sortedProperties[0];
  const bannerAddress = firstProperty?.address ?? customer.email;

  if (propertiesQuery.isLoading || summaryQuery.isLoading) {
    return <LoadingState label="Loading customer…" />;
  }

  if (propertiesQuery.isError) {
    return <QueryErrorState onRetry={() => propertiesQuery.refetch()} />;
  }

  if (summaryQuery.isError || !summaryQuery.data) {
    return <QueryErrorState onRetry={() => summaryQuery.refetch()} />;
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden bg-app-bg p-4">
      <div className="flex min-h-0 min-w-0 flex-[7] flex-col gap-4 overflow-hidden">
        <CustomerSummaryBanner
          summary={summaryQuery.data}
          address={bannerAddress}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
            <h2 className="text-[14px] font-bold text-text-primary">
              Properties ({sortedProperties.length})
            </h2>
            <SearchToolbar
              layout="inline"
              className="w-full max-w-[250px]"
              value={search}
              onChange={setSearch}
              placeholder="Search properties…"
              onClear={() => setSearch("")}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="m-4 rounded-md border border-dashed border-border bg-card p-8 text-center text-[13px] text-card-subtext">
                No properties match your search.
              </p>
            ) : (
              <ul className="divide-y divide-border-color">
                {filtered.map((property) => (
                  <li key={property.id}>
                    <PropertyListRow
                      property={property}
                      onSelect={() => onSelectProperty(property)}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-[3] flex-col overflow-hidden">
        <CustomerIssueHistoryPanel customerId={customer.id} />
      </div>
    </div>
  );
}
