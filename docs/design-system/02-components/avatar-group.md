# Avatar Group

## Purpose
Stacked participants.

## When to use
Report members, assignees.

## When not to use
—

## Variants
—

## Sizes
md

## Anatomy / spacing
overlap -8

## Typography
Lato / Poppins per type scale

## Radius
Circle

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
Variables from Color/Spacing/Radius/Elevation. Set: `Avatar Group`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
