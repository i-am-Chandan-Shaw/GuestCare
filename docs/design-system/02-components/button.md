# Button

## Purpose
Trigger actions. Brand Book: pill, generous padding, no drop shadow, Action green primary.

## When to use
Primary/secondary actions, forms, dialogs, toolbars.

## When not to use
Navigation that should be a link; don’t use primary for every action.

## Variants
Primary · Secondary · Outline · Ghost · Danger · Text · Success · Warning · Icon · Loading · Split · FAB

## Sizes
sm h-8 · md h-10 (default) · lg h-12 · FAB 56

## Anatomy / spacing
px-5 (md), gap-2 icon; FAB padding equal

## Typography
Poppins Bold 14 / Button style

## Radius
Pill (`--kn-radius-pill`)

## States
| State | Spec |
| ----- | ---- |
| Default | Primary fill `--kn-color-primary`, white text |
| Hover | `--kn-color-primary-hover` |
| Pressed | `--kn-color-primary-active`; scale 0.98 |
| Focused | Border/focus token `--kn-color-border-focus`; ring `--kn-color-focus-ring` if needed |
| Disabled | opacity `--kn-opacity-disabled` or disabled fills; `cursor-not-allowed` |
| Loading | Inline spinner; preserve width; `aria-busy` |
| Error | Danger border + helper text |
| Success | Success border/message when confirmation needed |

## Accessibility
- Keyboard: Enter/Space
- ARIA: `aria-busy` when loading; icon-only needs `aria-label`
- Touch target ≥ 44px where primary

## Responsive
Stack or full-width below 640px

## Design notes
Calm, border-first, KeyNest Action green for primary.

## Engineering notes
`src/components/ui/Button.tsx` — variants primary/secondary/cancel/danger/ghost

## Figma notes
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Button`.

## Best practices
One primary per view; secondary outlined/white with border.

## Common mistakes
Blue gradients; heavy shadows; square-only CTAs when Brand Book specifies pill.
