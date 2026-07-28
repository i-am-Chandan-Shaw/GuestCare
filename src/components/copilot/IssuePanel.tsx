import { Chip, SectionCard, Tabs } from "./ui";
import {
  ISSUES,
  RECENT_ISSUE_IDS,
  INCIDENT_LOGS,
  priorityMeta,
  getGlobalContact,
  getPropertyAccessCode,
  type Issue,
  type Property,
} from "@/data/mock";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Sparkles,
  ArrowUpRight,
  Check,
  ShieldAlert,
  History,
  FilePlus2,
  Phone,
  ExternalLink,
  Building2,
  Wifi,
  Key,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-to-clipboard";

export function IssuePanel({
  issue,
  property,
  onPick,
  checked,
  onToggle,
  verificationChecked,
  onToggleVerification,
  outcome,
  setOutcome,
  onOpenDrawer,
}: {
  issue: Issue | null;
  property: Property | null;
  onPick: (i: Issue) => void;
  checked: Record<string, boolean>;
  onToggle: (id: string) => void;
  verificationChecked: Record<string, boolean>;
  onToggleVerification: (id: string) => void;
  outcome: "resolve" | "escalate" | null;
  setOutcome: (o: "resolve" | "escalate") => void;
  onOpenDrawer: () => void;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));
  const [activeTab, setActiveTab] = useState("protocol");
  const [stepExpanded, setStepExpanded] = useState<Record<string, boolean>>({});
  const [wifiCopied, setWifiCopied] = useState(false);
  const [accessCopied, setAccessCopied] = useState(false);

  useEffect(() => {
    setStepExpanded({});
    setWifiCopied(false);
    setAccessCopied(false);
  }, [issue?.id, property?.id]);

  const progress = useMemo(() => {
    if (!issue) return 0;
    const total = issue.steps.length;
    const done = issue.steps.filter((s) => checked[s.id]).length;
    return total ? Math.round((done / total) * 100) : 0;
  }, [issue, checked]);

  if (!property) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto scrollbar-thin p-6">
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Building2 className="mx-auto h-7 w-7 text-muted-foreground" />
          <h2 className="mt-3 text-[15px] font-semibold text-foreground">Select a property first</h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Protocols can differ by property. Pick a property in the top bar before choosing an issue.
          </p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto scrollbar-thin p-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-[15px] font-semibold text-foreground">What's the guest calling about?</h2>
          </div>
          <p className="mt-1 text-[12.5px] text-muted-foreground">
            Pick a recent issue or search from the top bar to load the guided protocol for {property.name}.
          </p>

          <div className="mt-5">
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground">Recently used</div>
            <div className="grid grid-cols-2 gap-2">
              {RECENT_ISSUE_IDS.map((id) => {
                const i = ISSUES.find((x) => x.id === id)!;
                return (
                  <button
                    key={i.id}
                    type="button"
                    onClick={() => onPick(i)}
                    className="cursor-pointer group rounded-md border border-border bg-surface/60 p-3 text-left transition-all hover:border-primary/40 hover:bg-surface-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-foreground line-clamp-2">{i.name}</span>
                      <Chip tone={i.priority === "P1" ? "danger" : i.priority === "P2" ? "warning" : "info"} className="shrink-0">
                        {i.priority}
                      </Chip>
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">{i.category} · SLA {i.slaMinutes}m</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const pMeta = priorityMeta[issue.priority];
  const firstUncheckedIdx = issue.steps.findIndex((s) => !checked[s.id]);
  const activeStepIdx = firstUncheckedIdx === -1 ? issue.steps.length : firstUncheckedIdx;
  const verificationRequired = issue.reservationVerification === "Required";
  const verificationOptional = issue.reservationVerification === "Required on Escalated";
  const verificationDone = issue.verification.filter((_, i) => verificationChecked[`v${i}`]).length;
  const globalContact = getGlobalContact(issue.escalationContactId);
  const historyLogs = INCIDENT_LOGS.filter(
    (l) =>
      (property && l.propertyId === property.id) ||
      l.protocolIssueId === issue.id ||
      l.issueSummary.toLowerCase().includes(issue.name.split("–")[0]?.trim().toLowerCase() ?? "___"),
  ).slice(0, 6);

  const docs = issue.documents;

  const wifiText =
    [property.wifi.network, property.wifi.password].filter(Boolean).join(" / ") ||
    property.wifi.raw ||
    "";
  const accessText =
    getPropertyAccessCode(property) ||
    property.accessSummary?.keyNest ||
    property.spareKeys ||
    "";

  const copyWifi = async () => {
    const ok = await copyText(wifiText, "WiFi details copied");
    if (!ok) return;
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 1200);
  };
  const copyAccess = async () => {
    const ok = await copyText(accessText, "Access code copied");
    if (!ok) return;
    setAccessCopied(true);
    setTimeout(() => setAccessCopied(false), 1200);
  };
  const callHost = () => {
    const phone = property.hosts[0]?.phone;
    if (phone) window.open(`tel:${phone.replace(/\s/g, "")}`, "_self");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="sticky top-0 z-10 bg-background/95 pt-5 backdrop-blur border-b border-border">
        <div className="flex flex-col px-6">
          <div className="flex items-start gap-3 mb-2">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
              <h1 className="text-[22px] font-bold tracking-tight text-foreground">{issue.name}</h1>
              <Chip className={cn("rounded-md border px-2.5 py-1 text-[12px] font-semibold", pMeta.tone)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", pMeta.dot)} />
                {pMeta.label}
              </Chip>
              <Chip tone="success" className="rounded-md border border-success/40 bg-success/15 px-2.5 py-1 text-[12px] font-semibold text-success">
                <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                SLA {issue.slaMinutes} min
              </Chip>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <QuickActionPill
                icon={<Wifi className="h-3.5 w-3.5" />}
                label="WiFi"
                onClick={copyWifi}
                active={wifiCopied}
              />
              <QuickActionPill
                icon={<Key className="h-3.5 w-3.5" />}
                label="Access"
                onClick={copyAccess}
                active={accessCopied}
              />
              <QuickActionPill
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Host"
                onClick={callHost}
              />
            </div>
          </div>
          <p className="mb-4 text-[12.5px] font-medium text-foreground/65">
            {issue.category} · {issue.priorityCategory} · Verification: {issue.reservationVerification}
          </p>

          <Tabs
            tabs={[
              { id: "protocol", label: "Protocol" },
              { id: "escalations", label: "Escalations" },
              { id: "documents", label: `Documents (${docs.length})` },
              { id: "history", label: "History" },
            ]}
            active={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin bg-background">
        <div className="mx-auto max-w-[850px] space-y-5 p-6">
          {activeTab === "protocol" && (
            <>
              {issue.reservationVerification === "Not Required" ? (
                <SectionCard title="Verification" className="shadow-sm border border-border rounded-lg">
                  <p className="text-[13px] text-muted-foreground py-1">Verification not required for this issue type.</p>
                </SectionCard>
              ) : (
                <CollapsibleCard
                  title="Verification"
                  badge={
                    verificationRequired || verificationOptional
                      ? `${verificationDone} / ${issue.verification.length} checks`
                      : undefined
                  }
                  open={!collapsed.verify}
                  onToggle={() => toggle("verify")}
                >
                  {verificationOptional && (
                    <p className="text-[12px] text-muted-foreground mb-3">Required when escalating if guest cannot wait.</p>
                  )}
                  <ul className="space-y-3.5">
                    {issue.verification.map((v, i) => {
                      const id = `v${i}`;
                      const done = !!verificationChecked[id];
                      return (
                        <li key={id}>
                          <button
                            onClick={() => onToggleVerification(id)}
                            className="cursor-pointer flex items-center gap-3 text-[13.5px] text-foreground font-medium text-left w-full"
                          >
                            <span
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full shadow-sm border",
                                done ? "bg-success text-white border-success" : "bg-white border-border text-transparent",
                              )}
                            >
                              <Check className="h-3 w-3" strokeWidth={3} />
                            </span>
                            {v}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </CollapsibleCard>
              )}

              <CollapsibleCard
                title="Troubleshooting Steps"
                badge={`${issue.steps.filter((s) => checked[s.id]).length} / ${issue.steps.length} done`}
                open={!collapsed.proto}
                onToggle={() => toggle("proto")}
              >
                <ul className="flex flex-col relative">
                  {issue.steps.map((step, idx) => {
                    const isCompleted = checked[step.id];
                    const isCurrent = idx === activeStepIdx;
                    const bodyOpen =
                      stepExpanded[step.id] !== undefined
                        ? stepExpanded[step.id]
                        : isCurrent;
                    const hasBody = Boolean(step.hint);
                    return (
                      <li
                        key={step.id}
                        className={cn(
                          "relative flex items-start justify-between gap-4 p-4 rounded-lg border transition-all mb-2",
                          isCurrent ? "bg-[#f4f7fe] border-primary/20" : "bg-white border-transparent",
                        )}
                      >
                        {idx < issue.steps.length - 1 && (
                          <span className="absolute left-[30px] -translate-x-1/2 top-[30px] bottom-[-38px] w-[1.5px] bg-border/80 z-10" />
                        )}
                        <div className="relative flex items-start gap-3.5 z-20 flex-1 min-w-0">
                          <div
                            className={cn(
                              "relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-[1.5px] font-semibold text-[13px] transition-all",
                              isCurrent
                                ? "bg-primary border-primary text-white"
                                : isCompleted
                                  ? "bg-success border-success text-white"
                                  : "bg-white border-border-strong text-muted-foreground",
                            )}
                          >
                            {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : idx + 1}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col mt-[3px]">
                            <div className="flex items-start gap-2">
                              <span
                                className={cn(
                                  "text-[14px] font-bold flex-1",
                                  isCurrent
                                    ? "text-primary"
                                    : isCompleted
                                      ? "text-foreground line-through opacity-70"
                                      : "text-foreground",
                                )}
                              >
                                {step.label}
                              </span>
                              {hasBody && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setStepExpanded((prev) => ({
                                      ...prev,
                                      [step.id]: !bodyOpen,
                                    }))
                                  }
                                  className="cursor-pointer shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                                  aria-label={bodyOpen ? "Collapse step details" : "Expand step details"}
                                >
                                  {bodyOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </button>
                              )}
                            </div>
                            {hasBody && bodyOpen && (
                              <p
                                className={cn(
                                  "mt-2 text-[13px] leading-relaxed whitespace-pre-wrap",
                                  isCurrent ? "text-primary/80" : "text-muted-foreground",
                                )}
                              >
                                {step.hint}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="shrink-0 z-10">
                          {isCurrent ? (
                            <button
                              onClick={() => onToggle(step.id)}
                              className="cursor-pointer flex items-center gap-1.5 rounded-md bg-[#eef3ff] border border-primary/10 px-3.5 py-2 text-[12px] font-bold text-primary hover:bg-[#e4ebfc] transition-colors shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" strokeWidth={3} /> Done <ArrowUpRight className="h-3.5 w-3.5 rotate-45" />
                            </button>
                          ) : isCompleted ? (
                            <button
                              onClick={() => onToggle(step.id)}
                              className="cursor-pointer flex items-center gap-1.5 rounded-md border border-border bg-surface px-3.5 py-2 text-[12px] font-bold text-muted-foreground shadow-sm hover:bg-surface-2 transition-colors"
                            >
                              Undo
                            </button>
                          ) : (
                            <button
                              onClick={() => onToggle(step.id)}
                              className="cursor-pointer flex items-center gap-1 rounded-md border border-border bg-white px-3.5 py-2 text-[12px] font-bold text-foreground shadow-sm hover:bg-surface-2 transition-colors"
                            >
                              Mark Done <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="mt-4 flex items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setOutcome("resolve");
                      onOpenDrawer();
                    }}
                    className={cn(
                      "cursor-pointer flex-1 rounded-md bg-[#ebf8f1] border border-[#a3e2c3] px-4 py-2.5 text-[13.5px] font-bold text-[#1f874c] hover:bg-[#dcf3e7] transition-colors flex items-center justify-center gap-2 shadow-sm",
                      outcome === "resolve" && "ring-2 ring-[#1f874c]/40",
                    )}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                    Yes, resolved
                  </button>
                  <button
                    onClick={() => {
                      setOutcome("escalate");
                      onOpenDrawer();
                    }}
                    className={cn(
                      "cursor-pointer flex-1 rounded-md bg-[#feeeee] border border-[#f5b8b8] px-4 py-2.5 text-[13.5px] font-bold text-[#d83b3b] hover:bg-[#fde2e2] transition-colors flex items-center justify-center gap-2 shadow-sm",
                      outcome === "escalate" && "ring-2 ring-[#d83b3b]/40",
                    )}
                  >
                    <AlertTriangle className="h-4 w-4" strokeWidth={3} />
                    No, escalate
                  </button>
                </div>
              </CollapsibleCard>
            </>
          )}

          {activeTab === "escalations" && (
            <div className="space-y-4">
              <SectionCard
                title={
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="h-4 w-4 text-warning" /> Escalation Contact
                  </span>
                }
                className="shadow-sm border border-warning/20 bg-warning/5 rounded-lg"
              >
                <p className="text-[14px] font-bold text-foreground">{globalContact?.name ?? issue.escalationContactId}</p>
                <p className="text-[13px] leading-relaxed text-foreground mt-1">{issue.escalationDetails}</p>
                {globalContact?.details && (
                  <p className="text-[12.5px] text-muted-foreground mt-2">{globalContact.details}</p>
                )}
                {globalContact?.phones?.map((ph) => (
                  <a key={ph} href={`tel:${ph.replace(/\s/g, "")}`} className="mt-2 inline-flex items-center gap-2 text-[13px] font-semibold text-primary">
                    <Phone className="h-3.5 w-3.5" /> {ph}
                  </a>
                ))}
              </SectionCard>

              {issue.escalationContactId === "property" && property && (
                <SectionCard title={`Hosts — ${property.name}`} className="shadow-sm border border-border rounded-lg">
                  {property.hosts.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground">No hosts on file for this property.</p>
                  ) : (
                    <ul className="divide-y divide-border/60">
                      {property.hosts.map((h) => (
                        <li key={h.phone} className="flex items-center justify-between py-2.5">
                          <span className="text-[13.5px] font-semibold">{h.name}</span>
                          <a href={`tel:${h.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 font-mono text-[13px] text-muted-foreground hover:text-foreground">
                            {h.phone} <Phone className="h-3.5 w-3.5" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </SectionCard>
              )}
            </div>
          )}

          {activeTab === "documents" && (
            <SectionCard title="Related Documents" className="shadow-sm border border-border rounded-lg">
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
                        <Chip tone="outline" className="text-[11px] bg-surface">{d.type}</Chip>
                        {"url" in d && d.url ? (
                          <a href={d.url} target="_blank" rel="noreferrer" className="cursor-pointer h-7 w-7 flex items-center justify-center rounded hover:bg-surface-2 transition-colors">
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
          )}

          {activeTab === "history" && (
            <SectionCard title="Related Incidents" className="shadow-sm border border-border rounded-lg">
              {historyLogs.length === 0 ? (
                <p className="text-[13px] text-muted-foreground py-2">No prior incidents for this property/issue.</p>
              ) : (
                <ul className="space-y-4">
                  {historyLogs.map((log) => (
                    <li key={log.id} className="flex gap-4">
                      <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted-foreground border border-border">
                        <History className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-[13.5px] font-semibold text-foreground">{log.issueSummary}</h4>
                        <p className="text-[12.5px] text-muted-foreground mt-0.5 line-clamp-2">{log.callNotes}</p>
                        <p className="text-[11.5px] text-muted-foreground/70 mt-1">
                          {log.timestamp} · {log.status} · {log.submittedBy}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/95 backdrop-blur mt-auto p-4 px-6 border-t border-border">
        <button
          onClick={onOpenDrawer}
          className="flex h-[52px] w-full items-center justify-center gap-2 rounded-md bg-primary text-[15px] font-bold text-primary-foreground transition-transform hover:scale-[0.99] active:scale-[0.98] shadow-sm"
        >
          <FilePlus2 className="h-[18px] w-[18px]" />
          Create Report
        </button>
      </div>
    </div>
  );
}

function QuickActionPill({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-[12px] font-semibold transition-colors shadow-sm",
        active
          ? "border-success/30 bg-success/10 text-success"
          : "border-border bg-surface text-foreground hover:bg-surface-2",
      )}
    >
      <span className={cn(active ? "text-success" : "text-primary")}>{icon}</span>
      {label}
    </button>
  );
}

function CollapsibleCard({
  title,
  badge,
  children,
  open,
  onToggle,
}: {
  title: React.ReactNode;
  badge?: string;
  children: React.ReactNode;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <SectionCard
      padded={false}
      className="shadow-sm border border-border rounded-lg"
      title={
        <button className="flex w-full items-center gap-2.5 text-left" onClick={onToggle}>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-foreground transition-transform", !open && "-rotate-90")} />
          <span className="text-[14.5px] font-bold text-foreground">{title}</span>
          {badge && (
            <span className="ml-auto text-[12px] font-medium text-muted-foreground">{badge}</span>
          )}
        </button>
      }
    >
      {open && <div className="p-4">{children}</div>}
    </SectionCard>
  );
}
