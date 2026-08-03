# Avatar

## Purpose
User/property identity.

## When to use
Lists, headers, comments.

## When not to use
—

## Variants
Image · Initials · Icon

## Sizes
24/32/40/48/64

## Anatomy / spacing
8–16 padding; gaps from spacing scale

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
src/shared/components/Avatar.tsx

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Avatar`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
