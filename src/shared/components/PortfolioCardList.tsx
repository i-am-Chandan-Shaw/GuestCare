import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export const PORTFOLIO_CARD_ROW_CLASS =
  "group w-full cursor-pointer bg-transparent text-left transition-colors hover:bg-accent/60";

export function PortfolioCardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden border-y border-[#e9e9e7] bg-card",
        "[&>article:nth-child(odd)]:bg-card",
        "[&>article:nth-child(even)]:bg-[#fafaf8]",
        "[&>article:not(:last-child)]:border-b [&>article:not(:last-child)]:border-[#e9e9e7]",
        className,
      )}
    >
      {children}
    </div>
  );
}
