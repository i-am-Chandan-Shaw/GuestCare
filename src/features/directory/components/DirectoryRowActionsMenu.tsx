import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { MoreVertical, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type DirectoryRowAction = {
  id: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
};

export function DirectoryRowActionsMenu({
  actions,
  ariaLabel = "Row actions",
}: {
  actions: DirectoryRowAction[];
  ariaLabel?: string;
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          title={ariaLabel}
          data-directory-row-actions
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-secondary outline-none transition-colors hover:bg-app-bg hover:text-text-primary data-[state=open]:bg-app-bg data-[state=open]:text-text-primary"
        >
          <MoreVertical className="h-4 w-4" strokeWidth={2} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          side="bottom"
          align="end"
          sideOffset={0}
          arrowPadding={14}
          avoidCollisions
          collisionPadding={8}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            // No CSS border — drop-shadow draws the outline around the arrow tip too,
            // so the triangle opens into the panel (matches reference).
            "z-[100] min-w-[168px] rounded-lg bg-card-bg p-1",
            "[filter:drop-shadow(0_8px_20px_rgba(42,38,34,0.14))_drop-shadow(0_0_0.6px_var(--kn-color-border))]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1",
            "data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1",
          )}
        >
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <DropdownMenu.Item
                key={action.id}
                onSelect={() => {
                  action.onSelect();
                }}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium outline-none transition-colors",
                  "data-[highlighted]:bg-app-bg",
                  action.danger
                    ? "text-destructive data-[highlighted]:text-destructive"
                    : "text-text-primary",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span>{action.label}</span>
              </DropdownMenu.Item>
            );
          })}
          <DropdownMenu.Arrow width={12} height={7} className="fill-card-bg" />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
