import { useEffect, useState } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { LockedHeader } from "@/features/workspace/components/LockedHeader";
import { CustomerBrowsePhase } from "@/features/workspace/components/CustomerBrowsePhase";
import { CustomerLockedPhase } from "@/features/workspace/components/CustomerLockedPhase";
import { ProtocolPhase } from "@/features/workspace/components/ProtocolPhase";
import { useWorkspace } from "@/features/workspace/hooks/useWorkspace";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import type { Customer, Issue, Property } from "@/shared/types";

const workspaceRoute = getRouteApi("/");

export function CallWorkspace() {
  const [customerSearch, setCustomerSearch] = useState("");
  const [propertySearch, setPropertySearch] = useState("");
  const [issueSearch, setIssueSearch] = useState("");
  const navigate = useNavigate();
  const urlSearch = workspaceRoute.useSearch();
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
    hydrateFromSearch,
  } = workspace;

  useEffect(() => {
    void hydrateFromSearch(urlSearch);
  }, [hydrateFromSearch, urlSearch]);

  const syncUrl = (search: WorkspaceSearch) => {
    void navigate({ to: "/", search, replace: true });
  };

  const handleSelectCustomer = (next: Customer) => {
    setCustomerSearch("");
    selectCustomer(next);
    syncUrl({ customerId: next.id });
  };

  const handleClearCustomer = () => {
    setCustomerSearch("");
    setPropertySearch("");
    changeCustomer();
    syncUrl({});
  };

  const handleClearProperty = () => {
    setPropertySearch("");
    setIssueSearch("");
    changeProperty();
    if (customer) syncUrl({ customerId: customer.id });
  };

  const handleClearIssue = () => {
    setIssueSearch("");
    changeIssue();
    if (customer && property) {
      syncUrl({ customerId: customer.id, propertyId: property.id });
    }
  };

  const handleSelectProperty = (next: Property) => {
    setPropertySearch("");
    selectProperty(next);
    if (customer) {
      syncUrl({ customerId: customer.id, propertyId: next.id });
    }
  };

  const handlePickIssue = (nextIssue: Issue) => {
    selectIssue(nextIssue);
    if (customer && property) {
      syncUrl({
        customerId: customer.id,
        propertyId: property.id,
        issueId: nextIssue.id,
      });
    }
  };

  const showProtocolLayout =
    (phase === "property" || phase === "protocol") && customer && property;

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

      {showProtocolLayout && (
        <ProtocolPhase
          workspace={workspace}
          issueSearch={issueSearch}
          onPickIssue={handlePickIssue}
        />
      )}
    </div>
  );
}
