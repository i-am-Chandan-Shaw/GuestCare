# Forms

## Purpose
World-class form layout, validation, grouping.

## When to use
Any data entry flow.

## When not to use
Single search field.

## Variants
Single column · Two column · Wizard

## Sizes
sm / md / lg

## Anatomy / spacing
Field gap 20; section gap 32; helper 4–8 below

## Typography
Lato body / Poppins for buttons

## Radius
See radius doc

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
RHF + Zod in features; floating labels via FloatingLabelField

## Figma notes
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Forms`.

## Best practices
Inline validation after blur; required marked; optional explicit; errors in Helper Text danger; group with H3; progressive disclosure for advanced.

## Common mistakes
Only red border without text; validating on every keystroke harshly.
