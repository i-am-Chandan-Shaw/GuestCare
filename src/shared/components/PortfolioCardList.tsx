import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function PortfolioCardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-3 bg-app-bg px-4 pb-4 pt-0", className)}>
      {children}
    </div>
  );
}
