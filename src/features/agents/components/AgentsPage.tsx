import { useAgents } from "@/features/agents/hooks/useAgents";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SummaryRow } from "@/shared/components/SummaryRow";

export function AgentsPage() {
  const { data, isLoading, isError, refetch } = useAgents();

  return (
    <div className="mx-auto flex h-full max-w-4xl flex-col gap-4 overflow-y-auto p-6">
      <div>
        <h1 className="text-[20px] font-bold text-foreground">Agents</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Support team roster and shifts.</p>
      </div>

      {isLoading && <LoadingState label="Loading agents…" />}
      {isError && <QueryErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="space-y-2">
          {(data ?? []).map((agent) => (
            <SummaryRow
              key={agent.id}
              title={agent.name}
              subtitle={`${agent.role} · ${agent.handle}`}
              meta={agent.shift}
            />
          ))}
        </div>
      )}
    </div>
  );
}
