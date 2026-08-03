# Charts

## Purpose
Data viz with KeyNest chart palette.

## When to use
Analytics dashboards.

## When not to use
—

## Variants
Line · Area · Bar · Pie · Donut · Heatmap

## Sizes
md

## Anatomy / spacing
8–16 padding; gaps from spacing scale

## Typography
Lato / Poppins per type scale

## Radius
MD–XL or Pill for tags

## States
| State | Spec |
| ----- | ---- |
| Default | — |
| Hover | — |
| Pressed | — |
| Focused | `--kn-color-border-focus` / focus-visible |
| Disabled | muted + not-allowed |
| Loading | Skeleton or spinner |
| Error | Danger semantics |
| Success | Success semantics |

## Accessibility
- Keyboard: Tab, Enter/Space, Escape where overlay
- ARIA: Roles + labels
- Touch ≥ 44px for primary controls

## Responsive
Adapt layout under 768px

## Design notes
KeyNest calm UI; Action green accents.

## Engineering notes
Map to existing GuestCare components when present.

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Charts`.

## Best practices
Chart-1 Action green first; tooltip/legend/axis muted; empty + loading states; max 6 series.

## Common mistakes
Brand green for every series; rainbow defaults
