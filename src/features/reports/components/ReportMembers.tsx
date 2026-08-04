import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { cn } from "@/lib/utils";
import type { Agent } from "@/shared/types/agent";
import type { ReportAssignee } from "@/shared/types/report";

const STACK_VISIBLE_LIMIT = 3;

type MembersPanel =
  null | { type: "manage" } | { type: "member"; agentId: string } | { type: "overflow" };

export function ReportMembers({
  assignees,
  agents,
  canAssign,
  pending,
  onAdd,
  onRemove,
  variant = "default",
}: {
  assignees: ReportAssignee[];
  agents: Agent[];
  canAssign: boolean;
  pending?: boolean;
  onAdd: (agentId: string) => void;
  onRemove: (agentId: string) => void;
  /** `header` hides the Members label for placement beside tag pills. */
  variant?: "default" | "header";
}) {
  const [panel, setPanel] = useState<MembersPanel>(null);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);

  const overlaps = assignees.length > STACK_VISIBLE_LIMIT;
  const visible = overlaps ? assignees.slice(0, STACK_VISIBLE_LIMIT) : assignees;
  const hidden = overlaps ? assignees.slice(STACK_VISIBLE_LIMIT) : [];

  useEffect(() => {
    if (!panel) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setPanel(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  useEffect(() => {
    if (panel?.type !== "manage") setQuery("");
  }, [panel]);

  const memberIds = useMemo(() => new Set(assignees.map((a) => a.agentId)), [assignees]);

  const agentsById = useMemo(() => new Map(agents.map((a) => [a.id, a])), [agents]);

  const q = query.trim().toLowerCase();

  const members = useMemo(() => {
    if (!q) return assignees;
    return assignees.filter(
      (a) => a.agentName.toLowerCase().includes(q) || a.agentId.toLowerCase().includes(q),
    );
  }, [assignees, q]);

  const available = useMemo(() => {
    return agents
      .filter((a) => !memberIds.has(a.id))
      .filter((a) => !q || a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q));
  }, [agents, memberIds, q]);

  const selectedMember =
    panel?.type === "member" ? assignees.find((a) => a.agentId === panel.agentId) : undefined;
  const selectedAgent = selectedMember ? agentsById.get(selectedMember.agentId) : undefined;

  const toggleManage = () => {
    setPanel((current) => (current?.type === "manage" ? null : { type: "manage" }));
  };

  const toggleMember = (agentId: string) => {
    setPanel((current) =>
      current?.type === "member" && current.agentId === agentId
        ? null
        : { type: "member", agentId },
    );
  };

  const toggleOverflow = () => {
    setPanel((current) => (current?.type === "overflow" ? null : { type: "overflow" }));
  };

  const handleRemoveMember = (agentId: string) => {
    onRemove(agentId);
    setPanel(null);
  };

  return (
    <div ref={rootRef} className={cn("relative", variant === "default" && "space-y-2")}>
      {variant === "default" ? (
        <p className="text-[12px] font-semibold text-text-primary">Members</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-1.5">
        <div className={cn("flex items-center", overlaps ? "-space-x-2" : "gap-1.5")}>
          {visible.map((member) => (
            <button
              key={member.agentId}
              type="button"
              onClick={() => toggleMember(member.agentId)}
              aria-label={member.agentName}
              aria-expanded={panel?.type === "member" && panel.agentId === member.agentId}
              className={cn(
                "rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
                overlaps && "ring-2 ring-card-bg",
              )}
            >
              <Avatar
                name={member.agentName}
                seed={member.agentId}
                src={agentsById.get(member.agentId)?.imageUrl}
                size="md"
              />
            </button>
          ))}
          {hidden.length > 0 ? (
            <button
              type="button"
              onClick={toggleOverflow}
              aria-label={`Show ${hidden.length} more members`}
              aria-expanded={panel?.type === "overflow"}
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-full bg-app-bg text-[11px] font-bold text-text-secondary ring-2 ring-card-bg transition-colors",
                "hover:bg-border-color/40 hover:text-text-primary",
                "focus-visible:outline-none focus-visible:ring-brand-primary/40",
                panel?.type === "overflow" && "bg-brand-primary/10 text-brand-primary",
              )}
            >
              +{hidden.length}
            </button>
          ) : null}
        </div>

        {canAssign ? (
          <button
            type="button"
            onClick={toggleManage}
            disabled={pending}
            aria-expanded={panel?.type === "manage"}
            aria-label="Manage members"
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-border-color text-text-secondary transition-colors",
              "hover:border-brand-primary hover:bg-brand-primary/5 hover:text-brand-primary",
              "disabled:cursor-not-allowed disabled:opacity-50",
              panel?.type === "manage" &&
                "border-brand-primary bg-brand-primary/5 text-brand-primary",
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
          </button>
        ) : null}
        {assignees.length === 0 && !canAssign ? (
          <span className="text-[12px] text-text-muted">No members</span>
        ) : null}
      </div>

      {panel?.type === "member" && selectedMember ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-md border border-border-color bg-card-bg shadow-lg">
          <div className="flex items-start gap-2.5 px-3 py-3">
            <Avatar
              name={selectedMember.agentName}
              seed={selectedMember.agentId}
              src={selectedAgent?.imageUrl}
              size="md"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-text-primary">
                {selectedMember.agentName}
              </p>
              {selectedAgent?.email ? (
                <p className="truncate text-[12px] text-text-muted">{selectedAgent.email}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close"
              className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-app-bg hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          {canAssign ? (
            <div className="border-t border-border-color py-1">
              <button
                type="button"
                onClick={() => handleRemoveMember(selectedMember.agentId)}
                disabled={pending}
                className="flex w-full px-3 py-2 text-left text-[13px] font-medium text-destructive transition-colors hover:bg-app-bg disabled:opacity-50"
              >
                Remove from report
              </button>
            </div>
          ) : null}
        </div>
      ) : null}

      {panel?.type === "overflow" ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-72 overflow-hidden rounded-md border border-border-color bg-card-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-border-color px-3 py-2">
            <p className="text-[13px] font-semibold text-text-primary">More members</p>
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-app-bg hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
          <ul className="max-h-64 space-y-0.5 overflow-y-auto p-2">
            {hidden.map((member) => {
              const agent = agentsById.get(member.agentId);
              return (
                <li
                  key={member.agentId}
                  className="flex items-center gap-2 rounded-md px-1.5 py-1.5"
                >
                  <Avatar
                    name={member.agentName}
                    seed={member.agentId}
                    src={agent?.imageUrl}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-text-primary">
                      {member.agentName}
                    </p>
                    {agent?.email ? (
                      <p className="truncate text-[11px] text-text-muted">{agent.email}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {panel?.type === "manage" ? (
        <div className="absolute left-0 top-full z-30 mt-2 w-80 overflow-hidden rounded-md border border-border-color bg-card-bg shadow-lg">
          <div className="flex items-center justify-between border-b border-border-color px-3 py-2">
            <p className="text-[13px] font-semibold text-text-primary">Members</p>
            <button
              type="button"
              onClick={() => setPanel(null)}
              aria-label="Close members"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-app-bg hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>

          <div className="border-b border-border-color px-3 py-2">
            <div className="flex items-center gap-2 rounded-md border border-border-color bg-app-bg px-2.5 py-1.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={2} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search members…"
                className="w-full min-w-0 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-72 space-y-3 overflow-y-auto p-3">
            <section className="space-y-1">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-text-muted">
                On this report
              </p>
              {members.length === 0 ? (
                <p className="px-1 py-2 text-[12px] text-text-muted">No members yet</p>
              ) : (
                members.map((member) => (
                  <div
                    key={member.agentId}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-app-bg"
                  >
                    <Avatar
                      name={member.agentName}
                      seed={member.agentId}
                      src={agentsById.get(member.agentId)?.imageUrl}
                      size="sm"
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-primary">
                      {member.agentName}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(member.agentId)}
                      disabled={pending}
                      aria-label={`Remove ${member.agentName}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-card-bg hover:text-destructive disabled:opacity-50"
                    >
                      <X className="h-3.5 w-3.5" strokeWidth={2} />
                    </button>
                  </div>
                ))
              )}
            </section>

            <section className="space-y-1">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wide text-text-muted">
                Available agents
              </p>
              {available.length === 0 ? (
                <p className="px-1 py-2 text-[12px] text-text-muted">
                  {q ? "No agents match your search." : "Everyone available is already a member."}
                </p>
              ) : (
                available.map((agent) => (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onAdd(agent.id)}
                    disabled={pending}
                    className="flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left hover:bg-app-bg disabled:opacity-50"
                  >
                    <Avatar name={agent.name} seed={agent.id} src={agent.imageUrl} size="sm" />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-primary">
                      {agent.name}
                    </span>
                  </button>
                ))
              )}
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}
