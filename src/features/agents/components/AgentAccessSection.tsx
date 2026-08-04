import { type ReactNode } from "react";
import { Check, ChevronDown, Globe2, Search, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/shared/components/Avatar";
import type { AgentFormValues } from "@/features/agents/validations/agent-form.schema";
import type { Customer } from "@/shared/types";

function ScopePill({
  selected,
  icon,
  title,
  onClick,
}: {
  selected: boolean;
  icon: ReactNode;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex flex-1 items-center gap-2.5 rounded-md border px-3.5 py-2.5 text-left transition-colors",
        selected
          ? "border-brand-primary bg-brand-primary/5"
          : "border-border-color bg-card-bg hover:bg-app-bg",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-brand-primary bg-brand-primary" : "border-border-color bg-card-bg",
        )}
        aria-hidden
      >
        {selected ? <span className="h-1.5 w-1.5 rounded-full bg-white" /> : null}
      </span>
      <span className={cn("text-text-secondary", selected && "text-brand-primary")}>{icon}</span>
      <span className="text-[13px] font-semibold text-text-primary">{title}</span>
    </button>
  );
}

export function AgentAccessSection({
  form,
  patch,
  canAll,
  customersDisabled,
  customerQuery,
  setCustomerQuery,
  viewSelectedOnly,
  setViewSelectedOnly,
  assignableCustomers,
  selectedCustomers,
  filteredCustomers,
  toggleCustomer,
}: {
  form: AgentFormValues;
  patch: (partial: Partial<AgentFormValues>) => void;
  canAll: boolean;
  customersDisabled: boolean;
  customerQuery: string;
  setCustomerQuery: (q: string) => void;
  viewSelectedOnly: boolean;
  setViewSelectedOnly: (v: boolean | ((prev: boolean) => boolean)) => void;
  assignableCustomers: Customer[];
  selectedCustomers: Customer[];
  filteredCustomers: Customer[];
  toggleCustomer: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="shrink-0">
        <h3 className="text-[15px] font-bold text-text-primary">Access</h3>
        <p className="mt-1 text-[12px] text-text-secondary">
          Choose which customers this agent can view and manage.
        </p>
      </div>

      <div className={cn("flex shrink-0 flex-col gap-2 sm:flex-row", !canAll && "sm:flex-col")}>
        {canAll ? (
          <ScopePill
            selected={form.scopeType === "all"}
            icon={<Globe2 className="h-4 w-4" strokeWidth={2} />}
            title="All customers"
            onClick={() => {
              patch({ scopeType: "all", customerIds: [] });
              setViewSelectedOnly(false);
            }}
          />
        ) : null}
        <ScopePill
          selected={form.scopeType === "specific"}
          icon={<User className="h-4 w-4" strokeWidth={2} />}
          title="Specific customers"
          onClick={() =>
            patch({
              scopeType: "specific",
              customerIds: form.scopeType === "specific" ? form.customerIds : [],
            })
          }
        />
      </div>

      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border border-border-color transition-opacity",
          customersDisabled && "opacity-50",
        )}
        aria-disabled={customersDisabled}
      >
        <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border-color bg-app-bg px-3 py-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Search className="h-3.5 w-3.5 shrink-0 text-text-muted" strokeWidth={2} />
            <input
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              placeholder="Search customers…"
              disabled={customersDisabled}
              className="w-full min-w-0 bg-transparent text-[12px] text-text-primary outline-none placeholder:text-text-muted disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              disabled={customersDisabled}
              className="text-[11px] font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              onClick={() =>
                patch({
                  customerIds: assignableCustomers.map((c) => c.id),
                })
              }
            >
              Select all
            </button>
            <button
              type="button"
              disabled={customersDisabled}
              className="text-[11px] font-semibold text-text-muted hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-50"
              onClick={() => {
                patch({ customerIds: [] });
                setViewSelectedOnly(false);
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto p-1.5">
          {filteredCustomers.map((customer) => {
            const checked = !customersDisabled && form.customerIds.includes(customer.id);
            return (
              <button
                key={customer.id}
                type="button"
                disabled={customersDisabled}
                onClick={() => toggleCustomer(customer.id)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left hover:bg-app-bg disabled:cursor-not-allowed disabled:hover:bg-transparent"
              >
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                    checked
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-border-color bg-card-bg",
                  )}
                  aria-hidden
                >
                  {checked ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                </span>
                <Avatar name={customer.name} seed={customer.id} src={customer.imageUrl} size="md" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-semibold text-text-primary">
                    {customer.name}
                  </span>
                  <span className="block truncate text-[11px] text-text-muted">
                    {customer.email}
                  </span>
                </span>
              </button>
            );
          })}
          {filteredCustomers.length === 0 ? (
            <p className="px-2 py-3 text-[12px] text-text-muted">
              {viewSelectedOnly ? "No selected customers match your search." : "No customers found"}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border-color px-3 py-2">
          <span className="text-[11px] font-medium text-text-secondary">
            {customersDisabled
              ? "Select Specific customers to choose"
              : `${selectedCustomers.length} customer${
                  selectedCustomers.length === 1 ? "" : "s"
                } selected`}
          </span>
          <button
            type="button"
            disabled={customersDisabled || selectedCustomers.length === 0}
            onClick={() => setViewSelectedOnly((v) => !v)}
            className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-brand-primary hover:underline disabled:cursor-not-allowed disabled:opacity-40"
          >
            {viewSelectedOnly ? "Show all" : `View selected (${selectedCustomers.length})`}
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", viewSelectedOnly && "rotate-180")}
              strokeWidth={2}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
