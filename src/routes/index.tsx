import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShellFrame } from "@/components/copilot/ui";
import { TopBar } from "@/components/copilot/TopBar";
import { PropertyPanel } from "@/components/copilot/PropertyPanel";
import { IssuePanel } from "@/components/copilot/IssuePanel";
import { IncidentDrawer, emptyForm, type FormState } from "@/components/copilot/IncidentPanel";
import type { Customer, Issue, Property } from "@/data/mock";
import { CUSTOMERS, PROPERTIES, ISSUES, protocolToIncidentType } from "@/data/mock";

export const Route = createFileRoute("/")({
  component: Workspace,
});

const defaultCustomer = CUSTOMERS[0];
const defaultProperty =
  PROPERTIES.find((p) => defaultCustomer.propertyIds.includes(p.id)) ?? PROPERTIES[0];
const defaultIssue = ISSUES.find((i) => i.id === "i-unable-checkin") ?? ISSUES[0];

function Workspace() {
  const [customer, setCustomer] = useState<Customer | null>(defaultCustomer);
  const [property, setProperty] = useState<Property | null>(defaultProperty);
  const [issue, setIssue] = useState<Issue | null>(defaultIssue);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [verificationChecked, setVerificationChecked] = useState<Record<string, boolean>>({});
  const [outcome, setOutcome] = useState<"resolve" | "escalate" | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState<FormState>(() => ({
    ...emptyForm(),
    issueSummary: defaultIssue.name,
    incidentType: protocolToIncidentType(defaultIssue.category),
    priority: defaultIssue.priority,
  }));

  const handleCustomer = (c: Customer) => {
    setCustomer(c);
    setProperty(null);
    setIssue(null);
  };

  const handleProperty = (p: Property) => {
    setProperty(p);
    setIssue(null);
  };

  const handleClearForm = () => {
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
    setForm({
      ...emptyForm(),
      issueSummary: issue?.name ?? "",
      incidentType: issue ? protocolToIncidentType(issue.category) : "Other",
      priority: issue?.priority ?? "P2",
    });
  };

  useEffect(() => {
    if (!issue) return;
    setForm((f) => ({
      ...f,
      issueSummary: issue.name,
      incidentType: protocolToIncidentType(issue.category),
      priority: issue.priority,
    }));
    setChecked({});
    setVerificationChecked({});
    setOutcome(null);
  }, [issue]);

  useEffect(() => {
    if (!issue) return;
    const doneLabels = issue.steps
      .filter((s) => checked[s.id])
      .map((s) => `• ${s.label}`)
      .join("\n");
    if (!doneLabels) return;
    setForm((f) => ({
      ...f,
      callNotes: f.callNotes.includes(doneLabels) ? f.callNotes : [f.callNotes, doneLabels].filter(Boolean).join("\n"),
    }));
  }, [checked, issue]);

  useEffect(() => {
    if (!outcome) return;
    setForm((f) => ({
      ...f,
      status: outcome === "resolve" ? "Resolved" : "Unresolved - Escalation Handover",
    }));
  }, [outcome]);

  const toggleStep = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));
  const toggleVerification = (id: string) => setVerificationChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <ShellFrame>
      <TopBar
        customer={customer}
        property={property}
        issue={issue}
        onCustomer={handleCustomer}
        onProperty={handleProperty}
        onIssue={setIssue}
      />
      <main className="grid min-h-0 flex-1 grid-cols-[320px_minmax(0,1fr)]">
        <div className="min-h-0 border-r border-border bg-surface/60">
          <PropertyPanel property={property} onPick={setProperty} />
        </div>
        <div className="min-h-0 bg-background">
          <IssuePanel
            issue={issue}
            property={property}
            onPick={setIssue}
            checked={checked}
            onToggle={toggleStep}
            verificationChecked={verificationChecked}
            onToggleVerification={toggleVerification}
            outcome={outcome}
            setOutcome={setOutcome}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        </div>
      </main>

      <IncidentDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        form={form}
        setForm={setForm}
        onClear={handleClearForm}
        customer={customer}
        property={property}
        issue={issue}
      />
    </ShellFrame>
  );
}
