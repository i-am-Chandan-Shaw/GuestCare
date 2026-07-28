import { LockedHeader } from "@/features/workspace/components/LockedHeader";
import { CustomerBrowsePhase } from "@/features/workspace/components/CustomerBrowsePhase";
import { CustomerLockedPhase } from "@/features/workspace/components/CustomerLockedPhase";
import { PropertyLockedPhase } from "@/features/workspace/components/PropertyLockedPhase";
import { ProtocolPhase } from "@/features/workspace/components/ProtocolPhase";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { getIssueById } from "@/features/copilot/api/protocols.api";

export function CallWorkspace() {
  const workspace = useWorkspace();
  const {
    phase,
    customer,
    property,
    issue,
    selectCustomer,
    selectProperty,
    selectIssue,
    changeCustomer,
    changeProperty,
    clearAll,
  } = workspace;

  const handleSelectIssue = async (issueId: string) => {
    const nextIssue = await getIssueById(issueId);
    if (nextIssue) selectIssue(nextIssue);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <LockedHeader
        customer={customer}
        property={property}
        issue={issue}
        onChangeCustomer={phase !== "browse" ? changeCustomer : undefined}
        onChangeProperty={phase === "protocol" ? changeProperty : undefined}
        onClear={phase === "protocol" ? clearAll : undefined}
      />

      {phase === "browse" && <CustomerBrowsePhase onSelect={selectCustomer} />}

      {phase === "customer" && customer && (
        <CustomerLockedPhase customer={customer} onSelectProperty={selectProperty} />
      )}

      {phase === "property" && customer && property && (
        <PropertyLockedPhase
          customer={customer}
          property={property}
          onSelectIssue={handleSelectIssue}
        />
      )}

      {phase === "protocol" && <ProtocolPhase workspace={workspace} />}
    </div>
  );
}
