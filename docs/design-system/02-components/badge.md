# Badge

## Purpose
Compact status or count.

## When to use
Counts, status in headers.

## When not to use
Long sentences — use Tag/Alert.

## Variants
Neutral · Success · Warning · Danger · Info · Brand soft

## Sizes
sm/md

## Anatomy / spacing
8–16 padding; gaps from spacing scale

## Typography
Lato / Poppins per type scale

## Radius
Pill or SM

## States
| State | Spec |
| ----- | ---- |
| Default | Status surface + fg from color.md |
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
Variables from Color/Spacing/Radius/Elevation. Set: `Badge`.

## Best practices
Clarity over decoration.

## Common mistakes
Blue AiGency leftovers; loud shadows.
