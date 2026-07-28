import { Combobox, type ComboItem, Avatar } from "./ui";
import { AGENT, CUSTOMERS, PROPERTIES, ISSUES, type Customer, type Property, type Issue } from "@/data/mock";
import { LifeBuoy, ChevronRight, User2, Building2, AlertTriangle } from "lucide-react";

export function TopBar({
  customer, property, issue, onCustomer, onProperty, onIssue,
}: {
  customer: Customer | null;
  property: Property | null;
  issue: Issue | null;
  onCustomer: (c: Customer) => void;
  onProperty: (p: Property) => void;
  onIssue: (i: Issue) => void;
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

  return (
    <header className="flex h-16 shrink-0 items-center border-b border-border bg-surface/80 px-5 backdrop-blur">
      {/* Logo */}
      <div className="mr-5 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-info shadow-sm">
          <LifeBuoy className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="hidden text-[13px] font-semibold tracking-tight text-foreground md:block">GuestCare</span>
      </div>

      {/* Divider */}
      <div className="mr-4 h-5 w-px bg-border" />

      {/* Breadcrumb-style selectors */}
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

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        <div className="hidden items-center gap-2 rounded-md border border-border bg-surface pl-1 pr-2.5 py-1 md:flex">
          <Avatar initials={AGENT.initials} size="sm" />
          <div className="text-[11px] leading-tight">
            <div className="font-semibold text-foreground">{AGENT.name}</div>
            <div className="text-muted-foreground">{AGENT.role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
