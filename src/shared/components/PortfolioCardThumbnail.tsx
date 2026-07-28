import { cn } from "@/lib/utils";
import { Clock } from "lucide-react";
import type { ReactNode } from "react";

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Shared thumbnail dimensions for portfolio card headers (120×80). */
export const PORTFOLIO_CARD_THUMBNAIL_CLASS =
  "h-[80px] w-[120px] shrink-0 rounded-sm";

export function PortfolioCardThumbnail({
  name,
  imageUrl,
  className,
}: {
  name: string;
  imageUrl?: string;
  className?: string;
}) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className={cn(PORTFOLIO_CARD_THUMBNAIL_CLASS, "object-cover bg-muted", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        PORTFOLIO_CARD_THUMBNAIL_CLASS,
        "flex items-center justify-center bg-primary/85 text-[15px] font-semibold text-white",
        className,
      )}
    >
      {initialsFromName(name)}
    </div>
  );
}

/** Shared title style for portfolio card headers. */
export const PORTFOLIO_CARD_TITLE_CLASS =
  "text-[17px] font-semibold leading-snug tracking-tight text-card-text";

export function PortfolioCardActivityChip({ children }: { children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1",
        "text-[10px] font-bold uppercase tracking-wide",
        "bg-[#E6F4F0] text-[#0F6B5C]",
      )}
    >
      <Clock className="h-3 w-3 shrink-0" strokeWidth={2.25} />
      {children}
    </span>
  );
}
