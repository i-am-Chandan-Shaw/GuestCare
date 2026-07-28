import { cn } from "@/lib/utils";

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
  "h-[80px] w-[120px] shrink-0 rounded-md";

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
        className={cn(PORTFOLIO_CARD_THUMBNAIL_CLASS, "object-cover bg-[#f3f3f1]", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        PORTFOLIO_CARD_THUMBNAIL_CLASS,
        "flex items-center justify-center bg-[#eef1f6] text-[15px] font-semibold text-[#6b7280]",
        className,
      )}
    >
      {initialsFromName(name)}
    </div>
  );
}

export { PORTFOLIO_CARD_TITLE_CLASS } from "@/shared/components/PortfolioCardParts";
