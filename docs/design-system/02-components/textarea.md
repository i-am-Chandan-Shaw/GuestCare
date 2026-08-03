# Textarea

## Purpose
Multi-line entry with always-floated label.

## When to use
Notes, descriptions, comments (when labeled).

## When not to use
Chat composers without field labels.

## Variants
—

## Sizes
rows 3–6

## Anatomy / spacing
Padding from spacing scale; gaps 8–12 for icons.

## Typography
Lato body / Poppins for buttons

## Radius
LG

## States
| State | Spec |
| ----- | ---- |
| Default | Always float label |
| Hover | — |
| Pressed | — |
| Focused | Border/focus token `--kn-color-border-focus`; ring `--kn-color-focus-ring` if needed |
| Disabled | opacity `--kn-opacity-disabled` or disabled fills; `cursor-not-allowed` |
| Loading | Inline spinner; preserve width; `aria-busy` |
| Error | Danger border + helper text |
| Success | Success border/message when confirmation needed |

## Accessibility
- Keyboard: Tab focus, Enter/Space activate
- ARIA: Role and labels as appropriate
- Touch target ≥ 44px where primary

## Responsive
Stack or full-width below 640px

## Design notes
Calm, border-first, KeyNest Action green for primary.

## Engineering notes
Use `--kn-*` tokens; reuse shared primitives.

## Figma notes
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Textarea`.

## Best practices
One primary action per region.

## Common mistakes
Hardcoded blue; Brand green on CTAs.
