import { Link } from "@tanstack/react-router";
import type { Customer, Issue, Property } from "@/shared/types";

export function LockedHeader({
  customer,
  property,
  issue,
  onChangeCustomer,
  onChangeProperty,
  onClear,
}: {
  customer: Customer | null;
  property?: Property | null;
  issue?: Issue | null;
  onChangeCustomer?: () => void;
  onChangeProperty?: () => void;
  onClear?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border bg-surface/80 px-5 py-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-[13.5px]">
        {customer ? (
          <>
            <span className="font-semibold text-foreground">{customer.name}</span>
            {property && (
              <>
                <span className="text-muted-foreground">›</span>
                <span className="font-semibold text-foreground">{property.name}</span>
              </>
            )}
            {issue && (
              <>
                <span className="text-muted-foreground">›</span>
                <span className="font-medium text-foreground">{issue.name}</span>
              </>
            )}
          </>
        ) : (
          <span className="font-semibold text-foreground">Customers</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {customer && onChangeCustomer && (
          <button
            type="button"
            onClick={onChangeCustomer}
            className="rounded-sm border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-foreground hover:bg-surface-2"
          >
            Change customer
          </button>
        )}
        {property && onChangeProperty && (
          <button
            type="button"
            onClick={onChangeProperty}
            className="rounded-sm border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-foreground hover:bg-surface-2"
          >
            Change property
          </button>
        )}
        {onClear && (customer || property || issue) && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-sm border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-foreground hover:bg-surface-2"
          >
            Clear
          </button>
        )}
        {customer && (
          <Link
            to="/reports"
            search={{ customerId: customer.id }}
            className="rounded-sm border border-border bg-surface px-2.5 py-1 text-[12px] font-semibold text-primary hover:bg-surface-2"
          >
            View reports
          </Link>
        )}
      </div>
    </div>
  );
}
