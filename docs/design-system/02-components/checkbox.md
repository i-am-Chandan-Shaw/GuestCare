# Checkbox

## Purpose
Multi-select boolean.

## When to use


## When not to use


## Variants
—

## Sizes
20px box; 44 touch

## Anatomy / spacing
Padding from spacing scale; gaps 8–12 for icons.

## Typography
Lato body / Poppins for buttons

## Radius
XS

## States
| State | Spec |
| ----- | ---- |
| Default | border |
| Hover | border-hover |
| Pressed | primary fill when checked |
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
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Checkbox`.

## Best practices
One primary action per region.

## Common mistakes
Hardcoded blue; Brand green on CTAs.
