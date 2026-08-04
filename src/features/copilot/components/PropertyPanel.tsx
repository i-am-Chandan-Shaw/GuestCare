import { Building2 } from "lucide-react";
import { useState } from "react";
import type { Property } from "@/shared/types";
import { PropertyAccessTab } from "./PropertyAccessTab";
import { PropertyOpsTab } from "./PropertyOpsTab";
import { PropertyHero } from "./property-hero";
import { PropertyTabs, type PropertyTab } from "./PropertyDetailSections";

export type { PropertyTab };

export function PropertyPanel({
  property,
  tab = "access",
  onTabChange,
}: {
  property: Property | null;
  onPick?: (p: Property) => void;
  tab?: PropertyTab;
  onTabChange?: (t: PropertyTab) => void;
}) {
  const [internalTab, setInternalTab] = useState<PropertyTab>("access");
  const activeTab = onTabChange ? tab : internalTab;
  const setTab = onTabChange ?? setInternalTab;

  if (!property) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-background p-5">
        <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center max-w-[220px]">
          <Building2 className="mx-auto h-7 w-7 text-muted-foreground" />
          <p className="mt-3 text-[13px] font-medium text-foreground">No property selected</p>
          <p className="mt-1.5 text-[11.5px] leading-relaxed text-muted-foreground">
            Pick a property from the top bar to load details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto scrollbar-thin p-4">
        <PropertyHero property={property} />

        <div className="sticky top-[-16px] z-20 -mx-4 bg-background px-4 pb-3 pt-4">
          <PropertyTabs active={activeTab} onChange={setTab} />
        </div>

        <div className="space-y-4 pb-2">
          {activeTab === "access" ? (
            <PropertyAccessTab property={property} />
          ) : (
            <PropertyOpsTab property={property} />
          )}
        </div>
      </div>
    </div>
  );
}
