# Search

## Purpose
Query fields for lists and toolbars.

## When to use
SearchToolbar, filter bars.

## When not to use
Don’t force floating labels on search chrome.

## Variants
—

## Sizes
sm / md / lg

## Anatomy / spacing
Padding from spacing scale; gaps 8–12 for icons.

## Typography
Lato body / Poppins for buttons

## Radius
LG or pill in marketing

## States
| State | Spec |
| ----- | ---- |
| Default | — |
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
Keep SearchToolbar pattern

## Figma notes
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Search`.

## Best practices
One primary action per region.

## Common mistakes
Hardcoded blue; Brand green on CTAs.
