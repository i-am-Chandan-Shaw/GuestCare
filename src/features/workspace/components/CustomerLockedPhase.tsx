import { useMemo, useState } from "react";
import { useCustomerSummary, usePropertySummaries } from "@/features/customers/hooks/useCustomers";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import { GlanceStats } from "@/shared/components/GlanceStats";
import { LoadingState } from "@/shared/components/LoadingState";
import { PortfolioCard } from "@/shared/components/PortfolioCard";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import { SummaryRow } from "@/shared/components/SummaryRow";
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
  const reportsQuery = useIncidentLogs({ customerId: customer.id, limit: 3 });

  const filtered = useMemo(
    () =>
      filterBySearch(propertiesQuery.data ?? [], search, (property) =>
        [property.name, property.address, property.tags.join(" ")].join(" "),
      ),
    [propertiesQuery.data, search],
  );

  if (summaryQuery.isLoading || propertiesQuery.isLoading) {
    return <LoadingState label="Loading portfolio…" />;
  }

  if (summaryQuery.isError || propertiesQuery.isError) {
    return (
      <QueryErrorState
        onRetry={() => {
          summaryQuery.refetch();
          propertiesQuery.refetch();
        }}
      />
    );
  }

  const summary = summaryQuery.data;

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-5 overflow-y-auto p-6">
      {summary && (
        <GlanceStats
          openCount={summary.openReportsCount}
          resolvedCount={summary.resolvedCount}
          lastIssueLabel={
            summary.lastIssue
              ? `${summary.lastIssue.summary} — ${summary.lastIssue.propertyLabel ?? "Portfolio"}`
              : undefined
          }
        />
      )}

      <div className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Recent reports
        </h2>
        {(reportsQuery.data ?? []).length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No reports yet for this customer.</p>
        ) : (
          <div className="space-y-2">
            {(reportsQuery.data ?? []).map((log) => (
              <SummaryRow
                key={log.id}
                title={log.issueSummary}
                subtitle={`${log.propertyLabel} · ${log.status}`}
                meta={log.timestamp}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Select property
        </h2>
        <SearchToolbar
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
        <div className="space-y-3">
          {filtered.map((property) => (
            <PortfolioCard
              key={property.id}
              title={property.name}
              address={property.address}
              openCount={property.openReportsCount}
              lastIssue={property.lastIssue?.summary}
              badge="Property"
              onClick={() => onSelectProperty(property)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
