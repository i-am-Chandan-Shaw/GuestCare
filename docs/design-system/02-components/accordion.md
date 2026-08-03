# Accordion

## Purpose
Progressive disclosure.

## When to use
FAQs, settings groups.

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
| Default | — |
| Hover | — |
| Pressed | — |
| Focused | `--kn-color-border-focus` / focus-visible |
| Disabled | muted + not-allowed |
| Loading | Skeleton or spinner |
| Error | Danger semantics |
| Success | Success semantics |

## Accessibility
- Keyboard: Arrow keys between headers
- ARIA: Roles + labels
- Touch ≥ 44px for primary controls

## Responsive
Adapt layout under 768px

## Design notes
KeyNest calm UI; Action green accents.

## Engineering notes
Map to existing GuestCare components when present.

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Accordion`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
