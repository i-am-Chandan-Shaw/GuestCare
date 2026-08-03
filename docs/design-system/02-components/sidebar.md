# Sidebar

## Purpose
App primary nav.

## When to use
Authenticated shell.

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
MD–XL or Pill for tags

## States
| State | Spec |
| ----- | ---- |
| Default | sidebar text |
| Hover | — |
| Pressed | sidebar accent + active text |
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
AppSidebar.tsx; Ink dark tokens

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Sidebar`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
