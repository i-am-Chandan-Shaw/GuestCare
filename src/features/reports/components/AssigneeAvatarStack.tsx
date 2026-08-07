import { useCallback, useEffect, useRef, useState, type SyntheticEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Avatar } from "@/shared/components/Avatar";
import { cn } from "@/lib/utils";
import type { ReportAssignee } from "@/shared/types/report";

export const ASSIGNEE_STACK_VISIBLE_LIMIT = 3;

const MEMBER_PANEL_WIDTH = 240;
const OVERFLOW_PANEL_WIDTH = 280;

type Panel =
  | null
  | { type: "member"; agentId: string; top: number; left: number }
  | { type: "overflow"; top: number; left: number };

type HoverTip = { name: string; top: number; left: number } | null;

function clampLeft(left: number, width: number) {
  return Math.min(Math.max(8, left), window.innerWidth - width - 8);
}

/**
 * Read-only avatar stack matching ReportMembers: up to 3 avatars, then +N.
 * Hover shows name; click opens member / more-members popovers (ported to avoid grid clip).
 */
export function AssigneeAvatarStack({
  assignees,
  size = "sm",
  className,
}: {
  assignees: ReportAssignee[];
  size?: "sm" | "md";
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [hoverTip, setHoverTip] = useState<HoverTip>(null);

  const overlaps = assignees.length > ASSIGNEE_STACK_VISIBLE_LIMIT;
  const visible = overlaps ? assignees.slice(0, ASSIGNEE_STACK_VISIBLE_LIMIT) : assignees;
  const hidden = overlaps ? assignees.slice(ASSIGNEE_STACK_VISIBLE_LIMIT) : [];

  const selectedMember =
    panel?.type === "member"
      ? assignees.find((member) => member.agentId === panel.agentId)
      : undefined;

  const placeBelow = useCallback((el: HTMLElement, width: number) => {
    const rect = el.getBoundingClientRect();
    return {
      top: rect.bottom + 6,
      left: clampLeft(rect.left, width),
    };
  }, []);

  const closePanel = () => setPanel(null);

  useEffect(() => {
    if (!panel) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      closePanel();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [panel]);

  useEffect(() => {
    if (!panel) return;
    const onScrollOrResize = () => closePanel();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [panel]);

  if (assignees.length === 0) {
    return <span className="text-[13px] text-text-muted">—</span>;
  }

  const showHoverTip = (name: string, el: HTMLElement) => {
    const rect = el.getBoundingClientRect();
    setHoverTip({
      name,
      top: rect.top - 6,
      left: rect.left + rect.width / 2,
    });
  };

  const toggleMember = (agentId: string, el: HTMLElement) => {
    setHoverTip(null);
    setPanel((current) => {
      if (current?.type === "member" && current.agentId === agentId) return null;
      const pos = placeBelow(el, MEMBER_PANEL_WIDTH);
      return { type: "member", agentId, ...pos };
    });
  };

  const toggleOverflow = (el: HTMLElement) => {
    setHoverTip(null);
    setPanel((current) => {
      if (current?.type === "overflow") return null;
      const pos = placeBelow(el, OVERFLOW_PANEL_WIDTH);
      return { type: "overflow", ...pos };
    });
  };

  const stopRowNav = (event: SyntheticEvent) => {
    event.stopPropagation();
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative flex items-center", overlaps ? "-space-x-2" : "gap-1", className)}
      onClick={stopRowNav}
      onMouseDown={stopRowNav}
    >
      {visible.map((member) => (
        <button
          key={member.agentId}
          type="button"
          aria-label={member.agentName}
          aria-expanded={panel?.type === "member" && panel.agentId === member.agentId}
          onClick={(event) => {
            stopRowNav(event);
            toggleMember(member.agentId, event.currentTarget);
          }}
          onMouseEnter={(event) => {
            if (panel) return;
            showHoverTip(member.agentName, event.currentTarget);
          }}
          onMouseLeave={() => setHoverTip(null)}
          className={cn(
            "rounded-full transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
            overlaps && "ring-2 ring-card-bg",
          )}
        >
          <Avatar name={member.agentName} seed={member.agentId} size={size} title={null} />
        </button>
      ))}
      {hidden.length > 0 ? (
        <button
          type="button"
          aria-label={`Show ${hidden.length} more members`}
          aria-expanded={panel?.type === "overflow"}
          onClick={(event) => {
            stopRowNav(event);
            toggleOverflow(event.currentTarget);
          }}
          onMouseEnter={(event) => {
            if (panel) return;
            showHoverTip(
              hidden.map((member) => member.agentName).join(", "),
              event.currentTarget,
            );
          }}
          onMouseLeave={() => setHoverTip(null)}
          className={cn(
            "inline-flex items-center justify-center rounded-full bg-app-bg font-bold text-text-secondary ring-2 ring-card-bg transition-colors hover:bg-border-color/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40",
            size === "sm" ? "h-6 w-6 text-[9px]" : "h-8 w-8 text-[11px]",
            panel?.type === "overflow" && "bg-brand-primary/10 text-brand-primary",
          )}
        >
          +{hidden.length}
        </button>
      ) : null}

      {hoverTip && !panel
        ? createPortal(
            <div
              role="tooltip"
              className="pointer-events-none z-[100] max-w-[220px] -translate-x-1/2 -translate-y-full rounded-md bg-text-primary px-2 py-1 text-[11px] font-medium text-card-bg shadow-md"
              style={{ position: "fixed", top: hoverTip.top, left: hoverTip.left }}
            >
              {hoverTip.name}
            </div>,
            document.body,
          )
        : null}

      {panel?.type === "member" && selectedMember
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label={selectedMember.agentName}
              className="z-[100] overflow-hidden rounded-md border border-border-color bg-card-bg shadow-lg"
              style={{
                position: "fixed",
                top: panel.top,
                left: panel.left,
                width: MEMBER_PANEL_WIDTH,
              }}
              onClick={stopRowNav}
              onMouseDown={stopRowNav}
            >
              <div className="flex items-start gap-2.5 px-3 py-3">
                <Avatar
                  name={selectedMember.agentName}
                  seed={selectedMember.agentId}
                  size="md"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-text-primary">
                    {selectedMember.agentName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close"
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-app-bg hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {panel?.type === "overflow"
        ? createPortal(
            <div
              ref={panelRef}
              role="dialog"
              aria-label="More members"
              className="z-[100] overflow-hidden rounded-md border border-border-color bg-card-bg shadow-lg"
              style={{
                position: "fixed",
                top: panel.top,
                left: panel.left,
                width: OVERFLOW_PANEL_WIDTH,
              }}
              onClick={stopRowNav}
              onMouseDown={stopRowNav}
            >
              <div className="flex items-center justify-between border-b border-border-color px-3 py-2">
                <p className="text-[13px] font-semibold text-text-primary">More members</p>
                <button
                  type="button"
                  onClick={closePanel}
                  aria-label="Close"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted hover:bg-app-bg hover:text-text-primary"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
              <ul className="max-h-64 space-y-0.5 overflow-y-auto p-2">
                {hidden.map((member) => (
                  <li
                    key={member.agentId}
                    className="flex items-center gap-2 rounded-md px-1.5 py-1.5"
                  >
                    <Avatar name={member.agentName} seed={member.agentId} size="sm" />
                    <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-text-primary">
                      {member.agentName}
                    </p>
                  </li>
                ))}
              </ul>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
