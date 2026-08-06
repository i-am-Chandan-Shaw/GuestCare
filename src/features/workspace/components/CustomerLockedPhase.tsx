import { useMemo, useState } from "react";
import { usePropertySummaries } from "@/features/customers/hooks/useCustomers";
import { IssueHistoryPanel } from "@/features/workspace/components/IssueHistoryPanel";
import { PropertyListRow } from "@/features/workspace/components/PropertyListRow";
import { PropertyListSkeleton } from "@/shared/components/ListSkeletons";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import type { Customer, PropertySummary } from "@/shared/types";
import { ChevronLeft } from "lucide-react";

export function CustomerLockedPhase({
  customer,
  onSelectProperty,
  onBack,
}: {
  customer: Customer;
  onSelectProperty: (property: PropertySummary) => void;
  onBack: () => void;
}) {
  const [search, setSearch] = useState("");
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

  if (propertiesQuery.isError) {
    return <QueryErrorState onRetry={() => propertiesQuery.refetch()} />;
  }

  const isLoading = propertiesQuery.isLoading;

  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden bg-app-bg p-4">
      <div className="flex min-h-0 min-w-0 flex-[7] flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <button
                type="button"
                onClick={onBack}
                aria-label="Back to customers"
                className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <h2 className="text-[14px] font-bold text-text-primary">
                Properties{isLoading ? "" : ` (${sortedProperties.length})`}
              </h2>
            </div>
            <SearchToolbar
              layout="inline"
              className="w-full max-w-[250px]"
              value={search}
              onChange={setSearch}
              placeholder="Search properties…"
              onClear={() => setSearch("")}
              disabled={isLoading}
            />
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {isLoading ? (
              <PropertyListSkeleton />
            ) : filtered.length === 0 ? (
              <p className="m-4 rounded-md border border-dashed border-border bg-card p-8 text-center text-[13px] text-card-subtext">
                No properties match your search.
              </p>
            ) : (
              <ul className="divide-y divide-border-color">
                {filtered.map((property, index) => (
                  <li key={property.id}>
                    <PropertyListRow
                      property={property}
                      striped={index % 2 === 1}
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
        <IssueHistoryPanel customerId={customer.id} />
      </div>
    </div>
  );
}
