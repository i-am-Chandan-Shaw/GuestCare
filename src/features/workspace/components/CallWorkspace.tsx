import { useState } from "react";
import { LockedHeader } from "@/features/workspace/components/LockedHeader";
import { CustomerBrowsePhase } from "@/features/workspace/components/CustomerBrowsePhase";
import { CustomerLockedPhase } from "@/features/workspace/components/CustomerLockedPhase";
import { PropertyLockedPhase } from "@/features/workspace/components/PropertyLockedPhase";
import { ProtocolPhase } from "@/features/workspace/components/ProtocolPhase";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import { getIssueById } from "@/features/copilot/api/protocols.api";

export function CallWorkspace() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [issueSearch, setIssueSearch] = useState("");
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
    changeIssue,
  } = workspace;

  const handleSelectCustomer = (next: Parameters<typeof selectCustomer>[0]) => {
    setCustomerSearch("");
    selectCustomer(next);
  };

  const handleClearCustomer = () => {
    setCustomerSearch("");
    setPropertySearch("");
    changeCustomer();
  };

  const handleClearProperty = () => {
    setPropertySearch("");
    setIssueSearch("");
    changeProperty();
  };

  const handleClearIssue = () => {
    setIssueSearch("");
    changeIssue();
  };

  const handleSelectProperty = (next: Parameters<typeof selectProperty>[0]) => {
    setPropertySearch("");
    selectProperty(next);
  };

  const handleSelectIssue = async (issueId: string) => {
    const nextIssue = await getIssueById(issueId);
    if (nextIssue) {
      setIssueSearch("");
      selectIssue(nextIssue);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <LockedHeader
        phase={phase}
        customer={customer}
        property={property}
        issue={issue}
        customerSearch={customerSearch}
        onCustomerSearchChange={setCustomerSearch}
        propertySearch={propertySearch}
        onPropertySearchChange={setPropertySearch}
        issueSearch={issueSearch}
        onIssueSearchChange={setIssueSearch}
        onClearCustomer={handleClearCustomer}
        onClearProperty={handleClearProperty}
        onClearIssue={handleClearIssue}
      />

      {phase === "browse" && (
        <CustomerBrowsePhase search={customerSearch} onSelect={handleSelectCustomer} />
      )}

      {phase === "customer" && customer && (
        <CustomerLockedPhase
          customer={customer}
          search={propertySearch}
          onSelectProperty={handleSelectProperty}
        />
      )}

      {phase === "property" && customer && property && (
        <PropertyLockedPhase
          customer={customer}
          property={property}
          search={issueSearch}
          onSelectIssue={handleSelectIssue}
        />
      )}

      {phase === "protocol" && <ProtocolPhase workspace={workspace} />}
    </div>
  );
}
