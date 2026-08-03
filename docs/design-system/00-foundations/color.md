# Color system

## Purpose

Semantic colors built from the Brand Book so UI stays KeyNest — warm, calm, secure — without overusing brand green.

## Critical rule

| Color | HEX | Role |
| ----- | --- | ---- |
| **Brand green** | `#00B288` RGB(0,178,136) | Logo / bird / standout brand moments **only** |
| **Action green** | `#4FB28F` RGB(79,178,143) | Buttons, links, active states — **UI primary** |

Never use Brand green as default button fill. That is what makes the system feel premium instead of “logo-colored chrome.”

## Brand primitives

| Name | HEX | RGB | Purpose | When to use | When NOT |
| ---- | --- | --- | ------- | ----------- | -------- |
| Brand green | `#00B288` | 0,178,136 | Bird / logo accent | Logo, rare brand moments | Buttons, links, charts overload |
| Action green | `#4FB28F` | 79,178,143 | Interactive primary | CTAs, links, selected | Large page washes |
| Ink | `#2A2622` | 42,38,34 | Text | Headlines, body | On Brand green without checking contrast |
| Sage | `#ECEFEA` | 236,239,234 | Page background | App/marketing canvas | As text color |
| Cream | `#F8F0DF` | 248,240,223 | Warm secondary surface | Testimonials, callouts | Dense data tables |
| Yellow highlight | `#FFF8B7` | 255,248,183 | Tags / highlights | Pills, inline highlight | Large backgrounds, text on yellow without Ink |

---

## Neutral palette (Ink-inspired)

Warm neutrals biased toward Ink `#2A2622` (not cool blue-gray).

| Step | HEX | RGB | Use |
| ---- | --- | --- | --- |
| 50 | `#F7F6F4` | 247,246,244 | Lightest wash, table zebra alt |
| 100 | `#ECEFEA` | 236,239,234 | Sage — page bg (alias) |
| 200 | `#DDD9D3` | 221,217,211 | Subtle borders, dividers soft |
| 300 | `#C4BEB5` | 196,190,181 | Stronger border, disabled tracks |
| 400 | `#9C948A` | 156,148,138 | Placeholder, icons muted |
| 500 | `#736B63` | 115,107,99 | Tertiary text |
| 600 | `#5A534C` | 90,83,76 | Secondary text on light |
| 700 | `#433E39` | 67,62,57 | Emphasised secondary |
| 800 | `#2A2622` | 42,38,34 | Ink — primary text (alias) |
| 900 | `#1C1917` | 28,25,23 | Near-black, high emphasis |
| 950 | `#12100E` | 18,16,14 | Maximum contrast ink |

---

## Semantic colors

Contrast notes assume white or Sage backgrounds unless stated. AA body text needs ≥4.5:1; large text/UI ≥3:1.

### Primary (Action green family)

| Token | HEX | RGB | Purpose | A11y | Use | Don’t |
| ----- | --- | --- | ------- | ---- | --- | ----- |
| Primary | `#4FB28F` | 79,178,143 | Default interactive | White text on primary ≈3.1:1 — use **bold/large** or darker text treatment; prefer white on Primary Hover for small labels | Buttons, key toggles | Body text color |
| Primary Hover | `#3F9A7A` | 63,154,122 | Hover | Better with white (~3.7:1) | Hover fills | Static text |
| Primary Active | `#348568` | 52,133,104 | Pressed | White OK for UI | Active/pressed | — |
| Primary Disabled | `#A8D5C4` | 168,213,196 | Disabled control | Decorative; pair with disabled text | Disabled primary btn | Rely on color alone for meaning |
| Primary Soft | `#E5F5EF` | 229,245,239 | Selected row / soft chip | Ink on soft AA | Selected bg, soft badges | Primary CTA fill |

### Secondary

| Token | HEX | RGB | Purpose | A11y | Use | Don’t |
| ----- | --- | --- | ------- | ---- | --- | ----- |
| Secondary | `#FFFFFF` | 255,255,255 | Secondary button fill | Ink text AA | Secondary CTA | Alone without border |
| Secondary Hover | `#F7F6F4` | 247,246,244 | Hover | — | Hover | — |
| Secondary Active | `#ECEFEA` | 236,239,234 | Pressed | — | Pressed | — |

### Status

| Token | HEX | RGB | Surface | Purpose | A11y | Use | Don’t |
| ----- | --- | --- | ------- | ------- | ---- | --- | ----- |
| Success | `#2F9B6A` | 47,155,106 | `#E7F6EF` | Positive | Ink/success on surface AA | Confirmations, online | Decorative green spam (use Action green for actions) |
| Warning | `#C4841D` | 196,132,29 | `#FBF3E0` | Caution | Dark text on surface | SLA risk, pending | Error states |
| Danger | `#C23B2A` | 194,59,42 | `#FCECEA` | Destructive | White on danger for buttons | Delete, failed | Mild warnings |
| Info | `#3D6F8F` | 61,111,143 | `#E8F1F6` | Neutral info | Ink on surface | Tips, system info | Brand moments |

### Surfaces & background

| Token | HEX | Purpose | Use | Don’t |
| ----- | --- | ------- | --- | ----- |
| Background | `#ECEFEA` | App canvas (Sage) | Page bg | Card fill |
| Background Secondary | `#F8F0DF` | Cream sections | Testimonials, soft bands | Data-dense grids |
| Surface | `#FFFFFF` | Cards, panels | Default cards | Full-page bg (prefer Sage) |
| Surface Elevated | `#FFFFFF` | Modals / popovers | Elevated chrome + border/shadow | Fake elevation with loud shadow |
| Surface Hover | `#F7F6F4` | Row/card hover | Lists, menus | Primary buttons |
| Surface Active | `#E5F5EF` | Selected | Nav item, selected row | Destructive |

### Border & focus

| Token | HEX / value | Purpose | Use | Don’t |
| ----- | ----------- | ------- | --- | ----- |
| Border | `#DDD9D3` | Default hairline | Cards, inputs | Focus indication alone |
| Border Hover | `#C4BEB5` | Hover edge | Interactive cards | — |
| Border Focus | `#4FB28F` | Focus ring color | Inputs, buttons | Rely only on ring without visible border change |
| Divider | `#E5E2DC` | Separators | Table rows, sections | Heavy 2px rules everywhere |
| Focus Ring | `rgba(79,178,143,0.35)` | Soft ring | `:focus-visible` | Thick Material ripples |

### Text

| Token | HEX | Purpose | A11y on Sage/White | Use | Don’t |
| ----- | --- | ------- | ------------------ | --- | ----- |
| Text Primary | `#2A2622` | Body / titles | AA+ | Default copy | On Brand green without check |
| Text Secondary | `#5A534C` | Supporting | AA on white | Meta, descriptions | Tiny low-contrast captions |
| Text Tertiary | `#736B63` | De-emphasised | Large text OK | Timestamps | Critical labels |
| Text Disabled | `#9C948A` | Disabled | Decorative | Disabled controls | Error messages |
| Placeholder | `#9C948A` | Placeholder | — | Empty fields | Replace labels |

### Other

| Token | Value | Purpose | Use | Don’t |
| ----- | ----- | ------- | --- | ----- |
| Selection | `rgba(79,178,143,0.22)` | Text selection | Browser selection | — |
| Overlay | `rgba(42,38,34,0.45)` | Modal scrim | Dialogs | Opaque black |
| Skeleton | `#DDD9D3` | Loading bones | Skeleton UI | Animated rainbow |
| Link | `#3F9A7A` | Inline links | Body links | Entire paragraphs linked |
| Link Hover | `#348568` | Link hover | — | — |
| Link Active | `#2A6B54` | Link active | — | — |

### Charts / data viz

| Token | HEX | Use |
| ----- | --- | --- |
| Chart 1 | `#4FB28F` | Primary series |
| Chart 2 | `#3D6F8F` | Secondary |
| Chart 3 | `#C4841D` | Tertiary |
| Chart 4 | `#8B6B9E` | Quaternary |
| Chart 5 | `#2F9B6A` | Success series |
| Chart 6 | `#C23B2A` | Alert series |
| Chart muted | `#C4BEB5` | Baseline / empty |

Max 6 series; prefer Action green first. Brand green reserved for brand callouts in marketing charts only.

### Badges / tags / status chips

| Role | Fg | Bg |
| ---- | -- | -- |
| Tag highlight | Ink `#2A2622` | Yellow `#FFF8B7` |
| Badge success | `#2F9B6A` | `#E7F6EF` |
| Badge warning | `#C4841D` | `#FBF3E0` |
| Badge danger | `#C23B2A` | `#FCECEA` |
| Badge info | `#3D6F8F` | `#E8F1F6` |
| Badge neutral | `#5A534C` | `#F7F6F4` |
| Badge brand soft | `#348568` | `#E5F5EF` |

## Sidebar (product shell)

Dark shell remains practical for nav density; warm it toward Ink rather than cool navy.

| Token | HEX | Purpose |
| ----- | --- | ------- |
| Sidebar bg | `#1C1917` | Nav canvas |
| Sidebar surface | `#2A2622` | Active/hover block |
| Sidebar border | `rgba(255,255,255,0.08)` | Separators |
| Sidebar text | `rgba(255,255,255,0.72)` | Default |
| Sidebar text muted | `rgba(255,255,255,0.45)` | Secondary |
| Sidebar text active | `#FFFFFF` | Active |
| Sidebar accent | `#4FB28F` | Active indicator |

## Best practices

1. Sage page + white cards + thin border = default product look
2. Cream only for reassurance / marketing bands
3. Yellow tags sparingly (Brand Book)

## Common mistakes

- Blue primary leftover from AiGency
- Brand green buttons
- Purple “info” from old tokens

## Engineering notes

See `src/styles/keynest-tokens.css` and `01-tokens/alias-map.md`.
