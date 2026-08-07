import { avatarToneClass, initialsFromName } from "@/shared/components/Avatar";
import { cn } from "@/lib/utils";

export const PORTFOLIO_CARD_THUMBNAIL_CLASS = "h-[80px] w-[120px] shrink-0 rounded-md";

export function PortfolioCardThumbnail({
  name,
  imageUrl,
  seed,
  className,
}: {
  name: string;
  imageUrl?: string;
  /** Stable id for fallback color (defaults to name). */
  seed?: string;
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
        "flex items-center justify-center text-[15px] font-semibold",
        avatarToneClass(seed ?? name),
        className,
      )}
    >
      {initialsFromName(name)}
    </div>
  );
}

export { PORTFOLIO_CARD_TITLE_CLASS } from "@/shared/components/PortfolioCardParts";
