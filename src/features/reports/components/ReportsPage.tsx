import { useMemo } from "react";
import { useIncidentLogs } from "@/features/copilot/hooks/useCopilotData";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SummaryRow } from "@/shared/components/SummaryRow";
import { priorityMeta } from "@/shared/constants/agent";

export function ReportsPage({ customerId }: { customerId?: string }) {
  const filters = useMemo(() => ({ customerId }), [customerId]);
  const { data, isLoading, isError, refetch } = useIncidentLogs(filters);

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 overflow-y-auto p-6">
      <div>
        <h1 className="text-[20px] font-bold text-foreground">Reports</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {customerId ? "Incidents for the selected customer." : "All logged incidents across customers."}
        </p>
      </div>

      {isLoading && <LoadingState label="Loading reports…" />}
      {isError && <QueryErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {(data ?? []).map((log) => (
            <SummaryRow
              key={log.id}
              title={log.issueSummary}
              subtitle={`${log.propertyLabel} · ${log.agent}`}
              meta={`${log.timestamp}${log.priority ? ` · ${priorityMeta[log.priority].label}` : ""}`}
              statusTone={log.status === "Resolved" ? "resolved" : "open"}
            />
          ))}
          {(data ?? []).length === 0 && (
            <p className="rounded-sm border border-dashed border-border bg-card p-8 text-center text-[13px] text-muted-foreground">
              No reports found.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
