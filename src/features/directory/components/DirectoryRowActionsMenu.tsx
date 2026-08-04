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
          align="center"
          sideOffset={0}
          avoidCollisions
          collisionPadding={8}
          onCloseAutoFocus={(event) => event.preventDefault()}
          className={cn(
            "z-[100] min-w-[168px] rounded-lg border border-border-color bg-card-bg p-1 shadow-md",
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
                onSelect={(event) => {
                  event.preventDefault();
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
          {/* Border layer behind fill so the tip looks continuous with the menu border */}
          <DropdownMenu.Arrow width={14} height={8} className="fill-border-color" />
          <DropdownMenu.Arrow
            width={14}
            height={8}
            className="relative top-[-1px] fill-card-bg"
          />
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
