import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import { useSuggestedIssues } from "@/features/copilot/hooks/useProtocolData";
import { GlanceStats } from "@/shared/components/GlanceStats";
import { LoadingState } from "@/shared/components/LoadingState";
import { PortfolioCard } from "@/shared/components/PortfolioCard";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SummaryRow } from "@/shared/components/SummaryRow";
import type { Customer, Property, PropertySummary } from "@/shared/types";

export function PropertyLockedPhase({
  customer,
  property,
  onSelectIssue,
}: {
  customer: Customer;
  property: Property | PropertySummary;
  onSelectIssue: (issueId: string) => void;
}) {
  const reportsQuery = useIncidentLogs({
    customerId: customer.id,
    propertyId: property.id,
    limit: 5,
  });
  const suggestedQuery = useSuggestedIssues(property.id);

  if (suggestedQuery.isLoading || reportsQuery.isLoading) {
    return <LoadingState label="Loading property context…" />;
  }

  if (suggestedQuery.isError || reportsQuery.isError) {
    return (
      <QueryErrorState
        onRetry={() => {
          suggestedQuery.refetch();
          reportsQuery.refetch();
        }}
      />
    );
  }

  const openCount =
    "openReportsCount" in property
      ? property.openReportsCount
      : (reportsQuery.data ?? []).filter((log) => log.status !== "Resolved").length;
  const resolvedCount =
    "resolvedCount" in property
      ? property.resolvedCount
      : (reportsQuery.data ?? []).filter((log) => log.status === "Resolved").length;

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-5 overflow-y-auto p-6">
      <GlanceStats
        openCount={openCount}
        resolvedCount={resolvedCount}
        lastIssueLabel={
          "lastIssue" in property && property.lastIssue
            ? property.lastIssue.summary
            : reportsQuery.data?.[0]?.issueSummary
        }
      />

      <div className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Property history
        </h2>
        {(reportsQuery.data ?? []).length === 0 ? (
          <p className="text-[13px] text-muted-foreground">No prior reports for this property.</p>
        ) : (
          (reportsQuery.data ?? []).map((log) => (
            <SummaryRow
              key={log.id}
              title={log.issueSummary}
              subtitle={`${log.status} · ${log.timestamp}`}
            />
          ))
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Suggested issues
        </h2>
        {(suggestedQuery.data ?? []).map(({ issue, reason }) => (
          <PortfolioCard
            key={issue.id}
            title={issue.name}
            subtitle={`${issue.category} · SLA ${issue.slaMinutes}m`}
            badge={issue.priority}
            lastIssue={reason === "history" ? "From property history" : "Recently used"}
            onClick={() => onSelectIssue(issue.id)}
          />
        ))}
      </div>
    </div>
  );
}
