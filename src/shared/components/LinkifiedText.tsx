import { linkifyTextSegments } from "@/shared/lib/helpers";
import { cn } from "@/lib/utils";

/** Render plain text with http(s) URLs as clickable links. */
export function LinkifiedText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const segments = linkifyTextSegments(text);

  return (
    <span className={cn("whitespace-pre-wrap break-words", className)}>
      {segments.map((segment, index) =>
        segment.type === "url" ? (
          <a
            key={`${segment.value}-${index}`}
            href={segment.value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            {segment.value}
          </a>
        ) : (
          <span key={`t-${index}`}>{segment.value}</span>
        ),
      )}
    </span>
  );
}
