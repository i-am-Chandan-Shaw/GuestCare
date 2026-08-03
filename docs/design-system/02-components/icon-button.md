# Icon Button

## Purpose
Compact icon-only actions (close, copy, more).

## When to use
Toolbars, field endActions, table row actions.

## When not to use
Primary page CTA — use Button with label.

## Variants
Ghost · Subtle · Danger

## Sizes
32 / 40 hit area; icon 16–20

## Anatomy / spacing
Padding from spacing scale; gaps 8–12 for icons.

## Typography
Lato body / Poppins for buttons

## Radius
Circle or MD

## States
| State | Spec |
| ----- | ---- |
| Default | text-tertiary |
| Hover | bg surface-hover |
| Pressed | surface-active |
| Focused | Border/focus token `--kn-color-border-focus`; ring `--kn-color-focus-ring` if needed |
| Disabled | opacity `--kn-opacity-disabled` or disabled fills; `cursor-not-allowed` |
| Loading | Inline spinner; preserve width; `aria-busy` |
| Error | Danger border + helper text |
| Success | Success border/message when confirmation needed |

## Accessibility
- Keyboard: Tab focus, Enter/Space activate
- ARIA: Required aria-label
- Touch target ≥ 44px where primary

## Responsive
Stack or full-width below 640px

## Design notes
Calm, border-first, KeyNest Action green for primary.

## Engineering notes
Use `--kn-*` tokens; reuse shared primitives.

## Figma notes
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Icon Button`.

## Best practices
One primary action per region.

## Common mistakes
Hardcoded blue; Brand green on CTAs.
