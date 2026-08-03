# Dashboard Widget

## Purpose
Composable dashboard tile.

## When to use
Overview grid.

## When not to use
—

## Variants
—

## Sizes
md

## Anatomy / spacing
24

## Typography
Lato / Poppins per type scale

## Radius
XL

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
Variables from Color/Spacing/Radius/Elevation. Set: `Dashboard Widget`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
