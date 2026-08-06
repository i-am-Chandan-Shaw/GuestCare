import { useEffect, useRef, useState } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { LockedHeader } from "@/features/workspace/components/LockedHeader";
import { CustomerBrowsePhase } from "@/features/workspace/components/CustomerBrowsePhase";
import { CustomerLockedPhase } from "@/features/workspace/components/CustomerLockedPhase";
import { ProtocolPhase } from "@/features/workspace/components/ProtocolPhase";
import { useWorkspaceSelection } from "@/features/workspace/hooks/useWorkspace";
import { LoadingState } from "@/shared/components/LoadingState";
import type { WorkspaceSearch } from "@/features/workspace/lib/workspace-url";
import type { Customer, Issue, Property } from "@/shared/types";

const workspaceRoute = getRouteApi("/_authenticated/_shell/");

export function CallWorkspace() {
  const navigate = useNavigate();
  const urlSearch = workspaceRoute.useSearch();
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
  } = useWorkspaceSelection();

  const isInitialMount = useRef(true);
  const [hydrating, setHydrating] = useState(
    () => phase === "browse" && Boolean(urlSearch.customerId),
  );
  const hydrateFromSearchRef = useRef(hydrateFromSearch);
  hydrateFromSearchRef.current = hydrateFromSearch;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (hydrating) {
        void hydrateFromSearchRef.current(urlSearch).finally(() => setHydrating(false));
      } else {
        void hydrateFromSearchRef.current(urlSearch);
      }
      return;
    }
    void hydrateFromSearchRef.current(urlSearch);
  }, [urlSearch]);

  const syncUrl = (search: WorkspaceSearch) => {
    void navigate({ to: "/", search, replace: true });
  };

  const handleSelectCustomer = (next: Customer) => {
    selectCustomer(next);
    syncUrl({ customerId: next.id });
  };

  const handleClearCustomer = () => {
    changeCustomer();
    syncUrl({});
  };

  const handleClearAll = () => {
    changeCustomer();
    syncUrl({});
  };

  const handleClearProperty = () => {
    changeProperty();
    if (customer) syncUrl({ customerId: customer.id });
  };

  const handleClearIssue = () => {
    changeIssue();
    if (customer && property) {
      syncUrl({ customerId: customer.id, propertyId: property.id });
    }
  };

  const handleSelectProperty = (next: Property) => {
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

  const showProtocolLayout = (phase === "property" || phase === "protocol") && customer && property;

  if (hydrating) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden">
        <LoadingState label="Restoring workspace…" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <LockedHeader
        phase={phase}
        customer={customer}
        property={property}
        issue={issue}
        onClearAll={handleClearAll}
        onClearCustomer={handleClearCustomer}
        onClearProperty={handleClearProperty}
        onClearIssue={handleClearIssue}
      />

      {phase === "browse" && <CustomerBrowsePhase onSelect={handleSelectCustomer} />}

      {phase === "customer" && customer && (
        <CustomerLockedPhase
          customer={customer}
          onSelectProperty={handleSelectProperty}
          onBack={handleClearCustomer}
        />
      )}

      {showProtocolLayout && (
        <ProtocolPhase onPickIssue={handlePickIssue} onBack={handleClearProperty} />
      )}
    </div>
  );
}
