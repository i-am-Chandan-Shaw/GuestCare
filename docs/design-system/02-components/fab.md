# FAB

## Purpose
Floating primary action.

## When to use
Compose incident on home.

## When not to use
—

## Variants
—

## Sizes
md

## Anatomy / spacing
8–16 padding; gaps from spacing scale

## Typography
Lato / Poppins per type scale

## Radius
Pill/Circle

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
Elevation 3; Action green

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `FAB`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
