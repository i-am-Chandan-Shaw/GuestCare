# Card

## Purpose
Grouping content. Brand Book: white, 14pt radius, thin sage border, no heavy shadow.

## When to use
Features, pricing, dashboard widgets.

## When not to use
Every list row — use table/row.

## Variants
Default · Cream callout · Interactive

## Sizes
md

## Anatomy / spacing
8–16 padding; gaps from spacing scale

## Typography
Lato / Poppins per type scale

## Radius
XL 14px

## States
| State | Spec |
| ----- | ---- |
| Default | white + border + shadow-1 |
| Hover | border-hover |
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
Card.tsx

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Card`.

## Best practices
Clarity over decoration.

## Common mistakes
Glassmorphism; loud shadow
