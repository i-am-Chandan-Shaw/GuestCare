# Toast / Snackbar

## Purpose
Transient feedback.

## When to use
Save success/failure.

## When not to use
Blocking errors needing decisions.

## Variants
Default · Success · Warning · Danger · Info

## Sizes
md

## Anatomy / spacing
8–16 padding; gaps from spacing scale

## Typography
Lato / Poppins per type scale

## Radius
LG

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
sonner.tsx

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Toast / Snackbar`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
