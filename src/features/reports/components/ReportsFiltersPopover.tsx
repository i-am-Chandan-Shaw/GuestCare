import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import {
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  CircleCheck,
  Filter,
  Flag,
  Home,
  Search,
  Tag,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import { useAgents } from "@/features/agents/hooks/useAgents";
import { useCustomerSummaries } from "@/features/customers/hooks/useCustomers";
import {
  countActiveReportsFilters,
  EMPTY_REPORTS_LIST_FILTERS,
  toggleIdInList,
  type ReportsListFilters,
} from "@/features/reports/lib/reports-list-filters";
import { REPORT_STATUS_LABELS } from "@/features/reports/lib/report-status";
import { INCIDENT_TYPES } from "@/shared/constants/incident";
import { priorityMeta } from "@/shared/constants/agent";
import { PROPERTIES } from "@/data/properties";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Priority } from "@/shared/types";
import type { ReportStatus } from "@/shared/types/report";

const ALL_STATUSES = Object.keys(REPORT_STATUS_LABELS) as ReportStatus[];
const ALL_PRIORITIES = Object.keys(priorityMeta) as Priority[];
const PANEL_WIDTH = 360;

type AccordionKey =
  | "status"
  | "priority"
  | "agent"
  | "customer"
  | "property"
  | "issueType"
  | "dateRange";

function cloneFilters(filters: ReportsListFilters): ReportsListFilters {
  return {
    search: filters.search,
    statuses: [...filters.statuses],
    priorities: [...filters.priorities],
    assignedAgentIds: [...filters.assignedAgentIds],
    customerIds: [...filters.customerIds],
    propertyIds: [...filters.propertyIds],
    issueTypes: [...filters.issueTypes],
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}

/** Popover draft keeps search from applied (search is edited outside). */
function draftFromApplied(applied: ReportsListFilters): ReportsListFilters {
  return {
    ...cloneFilters(EMPTY_REPORTS_LIST_FILTERS),
    ...cloneFilters(applied),
    search: applied.search,
  };
}

function selectedCountBadge(count: number): string {
  return `${count} selected`;
}

function dateRangeBadge(dateFrom: string, dateTo: string): string {
  if (!dateFrom && !dateTo) return "Not set";
  if (dateFrom && dateTo) return "Set";
  return "1 selected";
}

function FilterCheckbox({
  checked,
  label,
  onToggle,
}: {
  checked: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-md py-1.5 text-left transition-colors hover:bg-app-bg"
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors",
          checked
            ? "border-brand-primary bg-brand-primary text-white"
            : "border-border-color bg-card-bg",
        )}
        aria-hidden
      >
        {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
      <span className="text-[13px] text-text-primary">{label}</span>
    </button>
  );
}

function FilterSection({
  title,
  icon: Icon,
  iconClassName,
  badge,
  open,
  onToggle,
  children,
}: {
  title: string;
  icon: LucideIcon;
  iconClassName: string;
  badge: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-app-bg/60"
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-md",
            iconClassName,
          )}
          aria-hidden
        >
          <Icon className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
        <span className="min-w-0 flex-1 text-[13px] font-semibold text-text-primary">
          {title}
        </span>
        <span className="inline-flex shrink-0 items-center rounded-full bg-app-bg px-2 py-0.5 text-[11px] font-medium text-text-secondary">
          {badge}
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={2} />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={2} />
        )}
      </button>
      {open ? <div className="px-4 pb-3.5">{children}</div> : null}
    </div>
  );
}

function ListSearch({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-md border border-border-color bg-app-bg px-2.5 py-1.5">
      <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={2} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted"
      />
    </div>
  );
}

export function ReportsFiltersPopover({
  applied,
  onApply,
  customerScoped,
}: {
  /** Currently applied filters (search may be present but is not edited here). */
  applied: ReportsListFilters;
  onApply: (next: ReportsListFilters) => void;
  /** When URL customerId is set, hide/disable customer multi-select. */
  customerScoped?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ReportsListFilters>(() => draftFromApplied(applied));
  const [expanded, setExpanded] = useState<AccordionKey | null>("status");
  const [agentQ, setAgentQ] = useState("");
  const [customerQ, setCustomerQ] = useState("");
  const [propertyQ, setPropertyQ] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const { data: agents = [] } = useAgents();
  const { data: customers = [] } = useCustomerSummaries();

  const activeCount = countActiveReportsFilters(applied);

  const openPopover = () => {
    setDraft(draftFromApplied(applied));
    setExpanded("status");
    setAgentQ("");
    setCustomerQ("");
    setPropertyQ("");
    setOpen(true);
  };

  const closePopover = () => {
    setOpen(false);
  };

  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, rect.right - PANEL_WIDTH),
      window.innerWidth - PANEL_WIDTH - 8,
    );
    setPos({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) {
        closePopover();
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const patch = (partial: Partial<ReportsListFilters>) => {
    setDraft((prev) => ({ ...prev, ...partial }));
  };

  const handleApply = () => {
    onApply({ ...draft, search: applied.search });
    closePopover();
  };

  const handleClear = () => {
    const cleared = { ...EMPTY_REPORTS_LIST_FILTERS, search: applied.search };
    setDraft(cleared);
    onApply(cleared);
    closePopover();
  };

  const toggleAccordion = (key: AccordionKey) => {
    setExpanded((prev) => (prev === key ? null : key));
  };

  const filteredAgents = useMemo(() => {
    const q = agentQ.trim().toLowerCase();
    return [...agents]
      .filter((a) => a.isActive)
      .filter((a) => !q || a.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [agents, agentQ]);

  const filteredCustomers = useMemo(() => {
    const q = customerQ.trim().toLowerCase();
    return [...customers]
      .filter((c) => !q || c.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, customerQ]);

  const filteredProperties = useMemo(() => {
    const q = propertyQ.trim().toLowerCase();
    return [...PROPERTIES]
      .filter(
        (p) => !q || p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [propertyQ]);

  const statusAllSelected = draft.statuses.length === 0;
  const priorityAllSelected = draft.priorities.length === 0;

  const panel = open
    ? createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Filters"
          className="flex max-h-[min(72vh,640px)] flex-col overflow-hidden rounded-xl border border-border-color bg-card-bg shadow-lg"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: PANEL_WIDTH,
            zIndex: 9999,
          }}
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border-color px-4 py-3">
            <h2 className="text-[15px] font-bold text-text-primary">Filters</h2>
            <button
              type="button"
              onClick={closePopover}
              aria-label="Close filters"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-app-bg hover:text-text-primary focus:outline-none"
            >
              <X className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          <div className="min-h-0 flex-1 divide-y divide-border-color overflow-y-auto">
            <FilterSection
              title="Status"
              icon={CircleCheck}
              iconClassName="bg-brand-primary/10 text-brand-primary"
              badge={selectedCountBadge(draft.statuses.length)}
              open={expanded === "status"}
              onToggle={() => toggleAccordion("status")}
            >
              <FilterCheckbox
                checked={statusAllSelected}
                label="All"
                onToggle={() => patch({ statuses: [] })}
              />
              {ALL_STATUSES.map((status) => (
                <FilterCheckbox
                  key={status}
                  checked={draft.statuses.includes(status)}
                  label={REPORT_STATUS_LABELS[status]}
                  onToggle={() =>
                    patch({ statuses: toggleIdInList(draft.statuses, status) })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="Priority"
              icon={Flag}
              iconClassName="bg-warning/15 text-warning"
              badge={selectedCountBadge(draft.priorities.length)}
              open={expanded === "priority"}
              onToggle={() => toggleAccordion("priority")}
            >
              <FilterCheckbox
                checked={priorityAllSelected}
                label="All"
                onToggle={() => patch({ priorities: [] })}
              />
              {ALL_PRIORITIES.map((priority) => (
                <FilterCheckbox
                  key={priority}
                  checked={draft.priorities.includes(priority)}
                  label={priorityMeta[priority].name}
                  onToggle={() =>
                    patch({
                      priorities: toggleIdInList(draft.priorities, priority),
                    })
                  }
                />
              ))}
            </FilterSection>

            <FilterSection
              title="Agent"
              icon={User}
              iconClassName="bg-violet-500/10 text-violet-600"
              badge={selectedCountBadge(draft.assignedAgentIds.length)}
              open={expanded === "agent"}
              onToggle={() => toggleAccordion("agent")}
            >
              <ListSearch
                value={agentQ}
                onChange={setAgentQ}
                placeholder="Search agents…"
              />
              <div className="max-h-40 space-y-0.5 overflow-y-auto">
                {filteredAgents.map((agent) => (
                  <FilterCheckbox
                    key={agent.id}
                    checked={draft.assignedAgentIds.includes(agent.id)}
                    label={agent.name}
                    onToggle={() =>
                      patch({
                        assignedAgentIds: toggleIdInList(
                          draft.assignedAgentIds,
                          agent.id,
                        ),
                      })
                    }
                  />
                ))}
                {filteredAgents.length === 0 ? (
                  <p className="py-2 text-[12px] text-text-muted">No agents found</p>
                ) : null}
              </div>
            </FilterSection>

            <FilterSection
              title="Customer"
              icon={Building2}
              iconClassName="bg-emerald-500/10 text-emerald-600"
              badge={selectedCountBadge(draft.customerIds.length)}
              open={expanded === "customer"}
              onToggle={() => toggleAccordion("customer")}
            >
              {customerScoped ? (
                <p className="text-[12px] text-text-secondary">
                  Customer is locked by the current page filter.
                </p>
              ) : (
                <>
                  <ListSearch
                    value={customerQ}
                    onChange={setCustomerQ}
                    placeholder="Search customers…"
                  />
                  <div className="max-h-40 space-y-0.5 overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <FilterCheckbox
                        key={customer.id}
                        checked={draft.customerIds.includes(customer.id)}
                        label={customer.name}
                        onToggle={() =>
                          patch({
                            customerIds: toggleIdInList(draft.customerIds, customer.id),
                          })
                        }
                      />
                    ))}
                    {filteredCustomers.length === 0 ? (
                      <p className="py-2 text-[12px] text-text-muted">No customers found</p>
                    ) : null}
                  </div>
                </>
              )}
            </FilterSection>

            <FilterSection
              title="Property"
              icon={Home}
              iconClassName="bg-sky-500/10 text-sky-600"
              badge={selectedCountBadge(draft.propertyIds.length)}
              open={expanded === "property"}
              onToggle={() => toggleAccordion("property")}
            >
              <ListSearch
                value={propertyQ}
                onChange={setPropertyQ}
                placeholder="Search properties…"
              />
              <div className="max-h-40 space-y-0.5 overflow-y-auto">
                {filteredProperties.map((property) => (
                  <FilterCheckbox
                    key={property.id}
                    checked={draft.propertyIds.includes(property.id)}
                    label={property.name}
                    onToggle={() =>
                      patch({
                        propertyIds: toggleIdInList(draft.propertyIds, property.id),
                      })
                    }
                  />
                ))}
                {filteredProperties.length === 0 ? (
                  <p className="py-2 text-[12px] text-text-muted">No properties found</p>
                ) : null}
              </div>
            </FilterSection>

            <FilterSection
              title="Issue type"
              icon={Tag}
              iconClassName="bg-brand-primary/10 text-brand-primary"
              badge={selectedCountBadge(draft.issueTypes.length)}
              open={expanded === "issueType"}
              onToggle={() => toggleAccordion("issueType")}
            >
              <div className="max-h-40 space-y-0.5 overflow-y-auto">
                {INCIDENT_TYPES.map((type) => (
                  <FilterCheckbox
                    key={type}
                    checked={draft.issueTypes.includes(type)}
                    label={type}
                    onToggle={() =>
                      patch({
                        issueTypes: toggleIdInList(draft.issueTypes, type),
                      })
                    }
                  />
                ))}
              </div>
            </FilterSection>

            <FilterSection
              title="Date range"
              icon={Calendar}
              iconClassName="bg-brand-primary/10 text-brand-primary"
              badge={dateRangeBadge(draft.dateFrom, draft.dateTo)}
              open={expanded === "dateRange"}
              onToggle={() => toggleAccordion("dateRange")}
            >
              <div className="grid grid-cols-1 gap-2">
                <label className="space-y-1">
                  <span className="text-[11px] font-medium text-text-secondary">From</span>
                  <input
                    type="date"
                    value={draft.dateFrom}
                    onChange={(e) => patch({ dateFrom: e.target.value })}
                    className="w-full rounded-md border border-border-color bg-card-bg px-2.5 py-1.5 text-[13px] text-text-primary outline-none"
                  />
                </label>
                <label className="space-y-1">
                  <span className="text-[11px] font-medium text-text-secondary">To</span>
                  <input
                    type="date"
                    value={draft.dateTo}
                    onChange={(e) => patch({ dateTo: e.target.value })}
                    className="w-full rounded-md border border-border-color bg-card-bg px-2.5 py-1.5 text-[13px] text-text-primary outline-none"
                  />
                </label>
              </div>
            </FilterSection>
          </div>

          <div className="flex shrink-0 items-center justify-end gap-3 border-t border-border-color px-4 py-4">
            <Button type="button" variant="secondary" size="lg" onClick={handleClear}>
              Clear
            </Button>
            <Button type="button" size="lg" onClick={handleApply}>
              Apply filters
            </Button>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) closePopover();
          else openPopover();
        }}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex h-9 shrink-0 items-center gap-2 rounded-md border border-border-color bg-card-bg px-3 text-[13px] font-semibold text-text-primary transition-colors hover:bg-app-bg focus:outline-none focus-visible:outline-none focus-visible:ring-0"
      >
        {activeCount > 0 ? (
          <span
            className="inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-text-primary px-1.5 text-[11px] font-bold leading-none text-white"
            aria-label={`${activeCount} filters applied`}
          >
            {activeCount}
          </span>
        ) : null}
        <Filter className="h-4 w-4 shrink-0 text-text-secondary" strokeWidth={2} />
        <span>Filters</span>
      </button>
      {panel}
    </>
  );
}
