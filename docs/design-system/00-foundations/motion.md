# Motion

## Purpose

Soft, purposeful motion. Never decorative. Respect `prefers-reduced-motion`.

## Durations

| Token | ms | Use |
| ----- | -- | --- |
| 75 | 75 | Micro highlight |
| 100 | 100 | Press feedback |
| 150 | 150 | Hover color/border |
| 200 | 200 | Default UI transition |
| 250 | 250 | Accordion content |
| 300 | 300 | Popover / dropdown |
| 400 | 400 | Drawer |
| 500 | 500 | Page / modal enter |

## Curves

| Name | Value | Use |
| ---- | ----- | --- |
| Standard | `cubic-bezier(0.2, 0, 0, 1)` | Most UI |
| Entrance | `cubic-bezier(0.16, 1, 0.3, 1)` | Modal/drawer in |
| Exit | `cubic-bezier(0.7, 0, 0.84, 0)` | Exit |
| Linear | `linear` | Progress indeterminate |

## Patterns

| Pattern | Duration | Curve | Notes |
| ------- | -------- | ----- | ----- |
| Hover | 150 | Standard | Color/border only |
| Press | 100 | Standard | scale(0.98) max |
| Modal | 300–500 | Entrance/Exit | Fade + 8px rise |
| Drawer | 400 | Entrance | Slide |
| Popover | 200–300 | Standard | Fade |
| Accordion | 250 | Standard | Height |
| Page transition | 300–500 | Standard | Subtle opacity |
| Loading | — | Linear | Spinner; no bounce |
| Success / Error | 200 | Standard | Toast slide |
| Micro | 75–150 | Standard | Icon swap (eye toggle) |

## Reduced motion

If `prefers-reduced-motion: reduce`: set duration → 0–1ms; keep opacity fades optional only; no transform travel.
