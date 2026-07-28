import { Combobox, type ComboItem } from "./ui";
import { CUSTOMERS, PROPERTIES, ISSUES, type Customer, type Property, type Issue } from "@/data/mock";
import { ChevronRight, User2, Building2, AlertTriangle, RotateCcw } from "lucide-react";

export function TopBar({
  customer,
  property,
  issue,
  onCustomer,
  onProperty,
  onIssue,
  onClearFilters,
}: {
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  onCustomer: (c: Customer) => void;
  onProperty: (p: Property) => void;
  onIssue: (i: Issue) => void;
  onClearFilters: () => void;
}) {
  const scopedProperties = customer
    ? PROPERTIES.filter((p) => customer.propertyIds.includes(p.id))
    : [];

  const customerItems: ComboItem[] = CUSTOMERS.map((c) => ({
    id: c.id,
    label: c.name,
    sublabel: `${c.email} · ${c.phone}`,
  }));
  const propertyItems: ComboItem[] = scopedProperties.map((p) => ({
    id: p.id,
    label: p.name,
    sublabel: p.address,
  }));
  const issueItems: ComboItem[] = ISSUES.map((i) => ({
    id: i.id,
    label: i.name,
    sublabel: `${i.category} · ${i.priority} · SLA ${i.slaMinutes}m`,
    meta: i.priority,
  }));

  const hasFilters = Boolean(customer || property || issue);

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface/80 px-5 backdrop-blur">
      <nav className="flex items-center gap-1.5">
        <Combobox
          placeholder="Customer"
          icon={<User2 className="h-3.5 w-3.5" />}
          items={customerItems}
          value={customer ? { id: customer.id, label: customer.name } : null}
          onSelect={(i) => {
            const c = CUSTOMERS.find((x) => x.id === i.id)!;
            onCustomer(c);
          }}
          width="w-56"
        />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <Combobox
          placeholder="Property"
          icon={<Building2 className="h-3.5 w-3.5" />}
          items={propertyItems}
          value={property ? { id: property.id, label: property.name } : null}
          onSelect={(i) => {
            const p = scopedProperties.find((x) => x.id === i.id)!;
            onProperty(p);
          }}
          width="w-52"
          disabled={!customer}
        />
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />
        <Combobox
          placeholder="Issue"
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          items={issueItems}
          value={issue ? { id: issue.id, label: issue.name } : null}
          onSelect={(i) => {
            const it = ISSUES.find((x) => x.id === i.id)!;
            onIssue(it);
          }}
          width="w-64"
          disabled={!property}
        />
      </nav>

      <div className="ml-auto">
        <button
          type="button"
          onClick={onClearFilters}
          disabled={!hasFilters}
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-surface px-3 text-[12.5px] font-semibold text-foreground transition-colors hover:bg-surface-2 disabled:pointer-events-none disabled:opacity-40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Clear filters
        </button>
      </div>
    </header>
  );
}
