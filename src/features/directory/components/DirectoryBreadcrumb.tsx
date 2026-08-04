import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type DirectoryBreadcrumbItem = {
  label: string;
  to?: string;
  params?: Record<string, string>;
};

export function DirectoryBreadcrumb({ items }: { items: DirectoryBreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1 text-lg font-black uppercase tracking-tight text-text-primary">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <ChevronRight className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={2} />
              ) : null}
              <li className="min-w-0 truncate">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    params={item.params}
                    className="text-text-secondary transition-colors hover:text-brand-primary"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-text-primary" : "text-text-secondary"}>
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
