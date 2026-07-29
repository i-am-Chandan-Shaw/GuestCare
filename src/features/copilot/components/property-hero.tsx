import { ExternalLink, MapPin, Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import type { Property } from "@/shared/types";

const PROPERTY_HERO_IMAGE =
  "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&q=80&w=1600&h=1000";

export function PropertyHero({ property }: { property: Property }) {
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="relative h-40 w-full shrink-0 overflow-hidden rounded-xl bg-muted shadow-sm">
        <img src={PROPERTY_HERO_IMAGE} alt={property.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
        <button
          type="button"
          onClick={() => setImagePreviewOpen(true)}
          className="cursor-pointer absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm text-foreground hover:bg-white transition-colors"
          aria-label="View full image"
        >
          <Search className="h-3.5 w-3.5" />
        </button>
        <div className="absolute bottom-3 left-4 right-4">
          <h2 className="text-[18px] font-bold tracking-tight text-white drop-shadow-sm">{property.name}</h2>
          <div className="mt-1 flex items-start gap-1.5 text-[12px] text-white/90">
            <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="leading-snug line-clamp-2">{property.address}</span>
          </div>
        </div>
      </div>

      <Dialog open={imagePreviewOpen} onOpenChange={setImagePreviewOpen}>
        <DialogContent
          className={cn(
            "max-w-[min(96vw,1100px)] border-0 bg-transparent p-0 shadow-none",
            "[&>button]:right-3 [&>button]:top-3 [&>button]:flex [&>button]:h-9 [&>button]:w-9 [&>button]:items-center [&>button]:justify-center",
            "[&>button]:rounded-full [&>button]:bg-white [&>button]:opacity-100 [&>button]:text-foreground [&>button]:shadow-md",
          )}
        >
          <DialogTitle className="sr-only">{property.name} photo</DialogTitle>
          <img
            src={PROPERTY_HERO_IMAGE}
            alt={property.name}
            className="max-h-[90vh] w-full rounded-lg object-contain"
          />
        </DialogContent>
      </Dialog>

      <div className="flex flex-wrap items-center gap-1.5">
        {property.tags.map((t) => (
          <span
            key={t}
            className="inline-flex items-center rounded-full border border-border-color bg-card-bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary"
          >
            {t}
          </span>
        ))}
        {property.unit && !property.tags.includes(property.unit) && (
          <span className="inline-flex items-center rounded-full border border-border-color bg-card-bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">
            {property.unit}
          </span>
        )}
      </div>

      {(property.guideUrl || property.listingUrl) && (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-color pt-3">
          {property.guideUrl && (
            <a
              href={property.guideUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-primary transition-colors hover:text-brand-primary-strong hover:underline"
            >
              Property Guide
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
            </a>
          )}
          {property.listingUrl && (
            <a
              href={property.listingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand-primary transition-colors hover:text-brand-primary-strong hover:underline"
            >
              Listing
              <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
