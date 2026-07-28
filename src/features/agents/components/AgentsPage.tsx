import { useMemo, useState } from "react";
import { useAgents } from "@/features/agents/hooks/useAgents";
import { AgentRow } from "@/features/agents/components/AgentRow";
import { LoadingState } from "@/shared/components/LoadingState";
import { QueryErrorState } from "@/shared/components/QueryErrorState";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";

export function AgentsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, refetch } = useAgents();

  const filtered = useMemo(
    () =>
      filterBySearch(data ?? [], search, (agent) =>
        [agent.name, agent.role, agent.handle, agent.shift].join(" "),
      ),
    [data, search],
  );

  return (
    <div className="flex h-full w-full flex-col gap-5 overflow-y-auto p-6">
      <div>
        <h1 className="text-[22px] font-bold tracking-tight text-foreground">Agents</h1>
        <p className="mt-1.5 text-[13.5px] text-muted-foreground">
          Support team roster and shifts.
        </p>
      </div>

      <SearchToolbar
        value={search}
        onChange={setSearch}
        placeholder="Search agents…"
        onClear={() => setSearch("")}
        resultLabel={
          search.trim() ? `Showing ${filtered.length} of ${data?.length ?? 0} agents` : undefined
        }
      />

      {isLoading && <LoadingState label="Loading agents…" />}
      {isError && <QueryErrorState onRetry={() => refetch()} />}

      {!isLoading && !isError && (
        <div className="flex w-full flex-col gap-2">
          {filtered.map((agent) => (
            <AgentRow key={agent.id} agent={agent} />
          ))}
          {filtered.length === 0 && (
            <p className="rounded-sm border border-dashed border-border bg-card p-10 text-center text-[13px] text-muted-foreground">
              No agents match your search.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
