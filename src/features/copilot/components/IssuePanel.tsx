import { IssueHistoryPanel } from "@/features/workspace/components/IssueHistoryPanel";
import { Building2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Chip, Tabs } from "@/components/ui/UiKit";
import { priorityMeta } from "@/shared/constants/agent";
import { useGlobalContact } from "@/features/copilot/hooks/useProtocolData";
import { useIncidentComposeActions } from "@/features/incidents/context/IncidentComposeProvider";
import { useIncidentLogs } from "@/features/incidents/hooks/useIncidents";
import type { CustomerContact, Issue, Property } from "@/shared/types";
import {
  IssueDocumentsSection,
  IssueEscalationsSection,
  IssueHistorySection,
  IssuePickerSection,
} from "./IssueMetaTabs";
import { IssueProtocolTab } from "./IssueProtocolTab";

export function IssuePanel({
  issue,
  property,
  customerId,
  contacts = [],
  onPick,
  onBack,
  checked,
  onToggle,
  verificationChecked,
  onToggleVerification,
  outcome,
  setOutcome,
}: {
  issue: Issue | null;
  property: Property | null;
  customerId?: string | null;
  contacts?: CustomerContact[];
  onPick: (i: Issue) => void;
  onBack?: () => void;
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

  const { openIncidentPanel } = useIncidentComposeActions();
  const { data: globalContact } = useGlobalContact(
    issue?.escalationContactId,
    customerId,
  );
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
      <div className="grid h-full min-h-0 grid-cols-[minmax(0,1fr)_minmax(280px,340px)] overflow-hidden bg-app-bg">
        <div className="min-h-0 border-r border-border-color p-4 pr-2">
          <IssuePickerSection layout="fill" property={property} onPick={onPick} onBack={onBack} />
        </div>
        <div className="min-h-0 p-4 pl-2">
          <IssueHistoryPanel
            variant="section"
            propertyId={property.id}
            emptyLabel="No reports recorded for this property."
          />
        </div>
      </div>
    );
  }

  const pMeta = priorityMeta[issue.priority];
  const docs = issue.documents;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="sticky top-0 z-10 bg-background/95 pt-5 backdrop-blur border-b border-border">
        <div className="flex flex-col px-6">
          <div className="mb-2 flex min-w-0 flex-wrap items-center gap-3">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground">{issue.name}</h1>
            <Chip
              className={cn(
                "rounded-md border px-2.5 py-1 text-[12px] font-semibold",
                pMeta.tone,
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", pMeta.dot)} />
              {pMeta.name}
            </Chip>
          </div>
          <p className="mb-4 text-[12.5px] font-medium text-text-secondary">
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
              onOutcomeSelected={() => openIncidentPanel("expanded")}
            />
          )}
          {activeTab === "escalations" && (
            <IssueEscalationsSection
              issue={issue}
              contacts={contacts}
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
