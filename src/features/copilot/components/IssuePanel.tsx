import { Building2, Check, Key, Phone, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { copyText } from "@/lib/copy-to-clipboard";
import { Chip, Tabs } from "@/shared/components/ui-kit";
import { priorityMeta } from "@/shared/constants/agent";
import { useGlobalContact, useRecentIssues } from "@/features/copilot/hooks/useProtocolData";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import type { Issue, Property } from "@/shared/types";
import {
  IssueDocumentsSection,
  IssueEscalationsSection,
  IssueHistorySection,
  IssuePickerSection,
} from "./IssueMetaTabs";
import { IssueProtocolTab } from "./IssueProtocolTab";

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
        "inline-flex h-9 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold transition-colors shadow-sm",
        active
          ? "border-success/30 bg-success/10 text-success"
          : "border-border-color bg-card-bg text-text-primary hover:bg-app-bg",
      )}
    >
      <span className={cn(active ? "text-success" : "text-brand-primary")}>{icon}</span>
      {label}
    </button>
  );
}

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
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (k: string) => setCollapsed((c) => ({ ...c, [k]: !c[k] }));
  const [activeTab, setActiveTab] = useState("protocol");
  const [stepExpanded, setStepExpanded] = useState<Record<string, boolean>>({});
  const [wifiCopied, setWifiCopied] = useState(false);
  const [accessCopied, setAccessCopied] = useState(false);

  const { data: recentIssues = [] } = useRecentIssues();
  const { data: globalContact } = useGlobalContact(issue?.escalationContactId);
  const { data: incidentLogs = [] } = useIncidentLogs(
    { propertyId: property?.id, limit: 20 },
    { enabled: Boolean(property && issue) },
  );

  const historyLogs = useMemo(() => {
    if (!property || !issue) return [];
    const issueKeyword = issue.name.split("–")[0]?.trim().toLowerCase() ?? "";
    return incidentLogs
      .filter(
        (log) =>
          log.propertyId === property.id ||
          log.protocolIssueId === issue.id ||
          log.issueSummary.toLowerCase().includes(issueKeyword),
      )
      .slice(0, 6);
  }, [incidentLogs, issue, property]);

  useEffect(() => {
    setStepExpanded({});
    setWifiCopied(false);
    setAccessCopied(false);
  }, [issue?.id, property?.id]);

  if (!property) {
    return (
      <div className="mx-auto flex h-full max-w-2xl flex-col gap-4 overflow-y-auto scrollbar-thin p-6">
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <Building2 className="mx-auto h-7 w-7 text-muted-foreground" />
          <h2 className="mt-3 text-[15px] font-semibold text-foreground">
            Select a property first
          </h2>
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
            Protocols can differ by property. Pick a property before choosing an issue.
          </p>
        </div>
      </div>
    );
  }

  if (!issue) {
    return (
      <IssuePickerSection
        property={property}
        recentIssues={recentIssues}
        onPick={onPick}
      />
    );
  }

  const pMeta = priorityMeta[issue.priority];
  const docs = issue.documents;
  const wifiText =
    [property.wifi.network, property.wifi.password].filter(Boolean).join(" / ") ||
    property.wifi.raw ||
    "";
  const accessText =
    property.accessSummary?.lockboxCode ||
    property.accessSummary?.doorCode ||
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
              <Chip
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[12px] font-semibold",
                  pMeta.tone,
                )}
              >
                <span className={cn("h-1.5 w-1.5 rounded-full", pMeta.dot)} />
                {pMeta.label}
              </Chip>
              <Chip
                tone="success"
                className="rounded-md border border-success/40 bg-success/15 px-2.5 py-1 text-[12px] font-semibold text-success"
              >
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
            {issue.category} · {issue.priorityCategory} · Verification:{" "}
            {issue.reservationVerification}
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
            <IssueProtocolTab
              issue={issue}
              checked={checked}
              onToggle={onToggle}
              verificationChecked={verificationChecked}
              onToggleVerification={onToggleVerification}
              collapsed={collapsed}
              toggleCollapsed={toggle}
              stepExpanded={stepExpanded}
              setStepExpanded={setStepExpanded}
              outcome={outcome}
              setOutcome={setOutcome}
            />
          )}
          {activeTab === "escalations" && (
            <IssueEscalationsSection
              issue={issue}
              property={property}
              globalContact={globalContact}
            />
          )}
          {activeTab === "documents" && <IssueDocumentsSection issue={issue} />}
          {activeTab === "history" && <IssueHistorySection logs={historyLogs} />}
        </div>
      </div>
    </div>
  );
}
