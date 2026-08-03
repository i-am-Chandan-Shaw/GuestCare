# Elevation

## Purpose

Subtle depth. Brand Book: borders do the separating; no heavy shadows.

## Levels

| Level | Border | Shadow | Blur | Opacity | Usage |
| ----- | ------ | ------ | ---- | ------- | ----- |
| 0 | none / divider | none | — | — | Flat on Sage |
| 1 | `border` 1px | `0 1px 2px rgba(42,38,34,0.04)` | 2 | low | Cards default |
| 2 | `border` 1px | `0 4px 12px rgba(42,38,34,0.06)` | 12 | low | Dropdown, popover |
| 3 | `border` 1px | `0 8px 24px rgba(42,38,34,0.08)` | 24 | med | Floating panels |
| Modal | `border` | `0 16px 40px rgba(42,38,34,0.12)` | 40 | + overlay | Dialogs |
| Popover | `border` | Level 2 | 12 | — | Popovers |
| Dropdown | `border` | Level 2 | 12 | — | Menus |
| FAB | none or soft | Level 3 | 24 | — | FAB only |
| Hover | border-hover | Level 1 → slight lift optional **2px max** | — | Cards interactive |
| Pressed | border | none / inset none | — | Buttons (scale 0.98 OK) |

## Rules

- Prefer border change over new shadow tier
- No glow / colored shadows
- Dark sidebar: use border/opacity, not drop shadows
