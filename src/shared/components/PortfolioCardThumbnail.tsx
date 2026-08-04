import { cn } from "@/lib/utils";

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export const PORTFOLIO_CARD_THUMBNAIL_CLASS = "h-[80px] w-[120px] shrink-0 rounded-md";

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
        className={cn(PORTFOLIO_CARD_THUMBNAIL_CLASS, "bg-app-bg object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        PORTFOLIO_CARD_THUMBNAIL_CLASS,
        "flex items-center justify-center bg-app-bg text-[15px] font-semibold text-text-secondary",
        className,
      )}
    >
      {initialsFromName(name)}
    </div>
  );
}

export { PORTFOLIO_CARD_TITLE_CLASS } from "@/shared/components/PortfolioCardParts";
