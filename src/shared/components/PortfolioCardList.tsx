import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function portfolioCardClassName({ alternate = false }: { alternate?: boolean } = {}) {
  return cn(
    "group w-full cursor-pointer rounded-md border border-[#e9e9e7] text-left transition-[border-color] hover:border-[#d8d8d6]",
    alternate ? "bg-[#fafaf8]" : "bg-card",
  );
}

export function PortfolioCardList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-2 p-4", className)}>
      {children}
    </div>
  );
}
