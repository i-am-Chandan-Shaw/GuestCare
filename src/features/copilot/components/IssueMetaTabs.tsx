import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  History,
  Phone,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useIssues } from "@/features/copilot/hooks/useProtocolData";
import { Chip, SectionCard } from "@/shared/components/ui-kit";
import { SearchToolbar, filterBySearch } from "@/shared/components/SearchToolbar";
import { priorityMeta } from "@/shared/constants/agent";
import type { GlobalContact, IncidentLog, Issue, Property } from "@/shared/types";

export function IssueEscalationsSection({
  issue,
  property,
  globalContact,
}: {
  issue: Issue;
  property: Property;
  globalContact: GlobalContact | null | undefined;
}) {
  return (
    <div className="space-y-4">
      <SectionCard
        title={
          <span className="flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-warning" /> Escalation Contact
          </span>
        }
        className="shadow-sm border border-warning/20 bg-warning/5 rounded-sm"
      >
        <p className="text-[14px] font-bold text-foreground">
          {globalContact?.name ?? issue.escalationContactId}
        </p>
        <p className="text-[13px] leading-relaxed text-foreground mt-1">{issue.escalationDetails}</p>
        {globalContact?.details && (
          <p className="text-[12.5px] text-muted-foreground mt-2">{globalContact.details}</p>
        )}
        {globalContact?.phones?.map((ph) => (
          <a
            key={ph}
            href={`tel:${ph.replace(/\s/g, "")}`}
            className="mt-2 inline-flex items-center gap-2 text-[13px] font-semibold text-primary"
          >
            <Phone className="h-3.5 w-3.5" /> {ph}
          </a>
        ))}
      </SectionCard>

      {issue.escalationContactId === "property" && (
        <SectionCard title={`Hosts — ${property.name}`} className="shadow-sm border border-border rounded-sm">
          {property.hosts.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No hosts on file for this property.</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {property.hosts.map((h) => (
                <li key={h.phone} className="flex items-center justify-between py-2.5">
                  <span className="text-[13.5px] font-semibold">{h.name}</span>
                  <a
                    href={`tel:${h.phone.replace(/\s/g, "")}`}
                    className="inline-flex items-center gap-2 font-mono text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    {h.phone} <Phone className="h-3.5 w-3.5" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      )}
    </div>
  );
}

export function IssueDocumentsSection({ issue }: { issue: Issue }) {
  const docs = issue.documents;

  return (
    <SectionCard title="Related Documents" className="shadow-sm border border-border rounded-sm">
      {docs.length === 0 ? (
        <p className="text-[13px] text-muted-foreground py-2">
          No protocol documents — use Property Guide on the left.
        </p>
      ) : (
        <ul className="divide-y divide-border/60">
          {docs.map((d) => (
            <li key={d.title} className="flex items-center justify-between ">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <span className="text-[13.5px] font-semibold text-foreground">{d.title}</span>
              </div>
              <div className="flex items-center gap-2">
                <Chip tone="outline" className="text-[11px] bg-surface">
                  {d.type}
                </Chip>
                {"url" in d && d.url ? (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="cursor-pointer h-7 w-7 flex items-center justify-center rounded hover:bg-surface-2 transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </a>
                ) : (
                  <button className="cursor-pointer h-7 w-7 flex items-center justify-center rounded hover:bg-surface-2 transition-colors">
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function IssueHistorySection({ logs }: { logs: IncidentLog[] }) {
  return (
    <SectionCard title="Related Incidents" className="shadow-sm border border-border rounded-sm">
      {logs.length === 0 ? (
        <p className="text-[13px] text-muted-foreground py-2">No prior incidents for this property/issue.</p>
      ) : (
        <ul className="space-y-4">
          {logs.map((log) => (
            <li key={log.id} className="flex gap-4">
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground border border-border">
                <History className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-[13.5px] font-semibold text-foreground">{log.issueSummary}</h4>
                <p className="text-[12.5px] text-muted-foreground mt-0.5 line-clamp-2">{log.callNotes}</p>
                <p className="text-[11.5px] text-muted-foreground/70 mt-1">
                  {log.timestamp} · {log.status} · {log.submittedBy}
                </p>
                <Link
                  to="/reports"
                  search={{
                    reportId: log.id,
                    ...(log.customerId ? { customerId: log.customerId } : {}),
                  }}
                  className="mt-2 inline-flex items-center gap-1 text-[12px] font-semibold text-brand-primary transition-colors hover:text-brand-secondary"
                >
                  View full report
                  <ChevronRight className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

export function IssuePickerSection({
  property,
  onPick,
  onBack,
  layout = "page",
}: {
  property: Property;
  /** @deprecated Kept for call-site compatibility; all issues are shown by default. */
  recentIssues?: Issue[];
  onPick: (issue: Issue) => void;
  onBack?: () => void;
  /** `page` = full centered column; `fill` = stretch to parent height with one scroll */
  layout?: "page" | "stacked" | "fill";
}) {
  const [search, setSearch] = useState("");
  const allIssuesQuery = useIssues();
  const trimmedSearch = search.trim();
  const allIssues = allIssuesQuery.data ?? [];

  const issueCount = allIssues.length;

  const displayIssues = useMemo(() => {
    if (!trimmedSearch) return allIssues;
    return filterBySearch(allIssues, trimmedSearch, (issue) =>
      [issue.name, issue.category, issue.priority].join(" "),
    );
  }, [trimmedSearch, allIssues]);

  const sectionLabel = trimmedSearch ? "Search results" : "All issues";

  const card = (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-md border border-border-color bg-card-bg">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
        <div className="flex min-w-0 items-center gap-1.5">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              aria-label="Back to properties"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-app-bg hover:text-text-primary"
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={2} />
            </button>
          ) : null}
          <h2 className="text-[14px] font-bold text-text-primary">Issues ({issueCount})</h2>
        </div>
        <SearchToolbar
          layout="inline"
          className="w-full max-w-[250px]"
          value={search}
          onChange={setSearch}
          placeholder="Search issues…"
          onClear={() => setSearch("")}
        />
      </div>

      <div className="shrink-0 space-y-1 px-5 pt-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <h3 className="text-[15px] font-semibold text-foreground">
            What&apos;s the guest calling about?
          </h3>
        </div>
        <p className="text-[12.5px] text-muted-foreground">
          Pick an issue to load the guided protocol for {property.name}.
        </p>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col px-5 pb-5">
        <div className="mb-2 shrink-0 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">
          {sectionLabel}
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin pr-0.5">
          {allIssuesQuery.isLoading ? (
            <p className="rounded-md border border-dashed border-border bg-card p-8 text-center text-[13px] text-card-subtext">
              Loading issues…
            </p>
          ) : displayIssues.length === 0 ? (
            <p className="rounded-md border border-dashed border-border bg-card p-8 text-center text-[13px] text-card-subtext">
              {trimmedSearch ? "No issues match your search." : "No issues available."}
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {displayIssues.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => onPick(i)}
                  className="group cursor-pointer rounded-md border border-border bg-surface/60 p-3 text-left transition-all hover:border-primary/40 hover:bg-surface-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="line-clamp-2 text-[13px] font-medium text-foreground">
                      {i.name}
                    </span>
                    <Chip
                      tone={
                        priorityMeta[i.priority].chipTone === "muted"
                          ? "outline"
                          : priorityMeta[i.priority].chipTone
                      }
                      className="shrink-0"
                    >
                      {priorityMeta[i.priority].name}
                    </Chip>
                  </div>
                  <div className="mt-1 text-[11px] text-muted-foreground">{i.category}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (layout === "stacked" || layout === "fill") {
    return <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">{card}</div>;
  }

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col p-6">
      {card}
    </div>
  );
}
