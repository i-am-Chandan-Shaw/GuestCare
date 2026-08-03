# Input

## Purpose
Single-line text entry with floating label (product default).

## When to use
Forms: email, names, IDs, search-in-form.

## When not to use
Filter/search chrome (SearchToolbar stays non-floating).

## Variants
Text · Email · Password · Mono · With endAction

## Sizes
Height 52 floating; compact 40 optional

## Anatomy / spacing
pl-3 pr-11 with endAction; label floats top

## Typography
Lato 13 value; label 10 uppercase floated / 13 placeholder

## Radius
LG 12

## States
| State | Spec |
| ----- | ---- |
| Default | border + surface white |
| Hover | border-hover |
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
`FloatingLabelField` + incident-form-controls Input

## Figma notes
Bind to `Color/*`, `Spacing/*`, `Radius/*` variables. Component set: `Input`.

## Best practices
Label inside field; endAction for eye/copy/info.

## Common mistakes
Hardcoded blue; Brand green on CTAs.
