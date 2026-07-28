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
    <div className={cn("flex w-full flex-col gap-3 bg-[#f7f7f5] p-4", className)}>
      {children}
    </div>
  );
}
