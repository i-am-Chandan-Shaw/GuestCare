# GuestCare migration notes (Phase 11)

## What changed in code

| Area | Change |
| ---- | ------ |
| Tokens | Added `src/styles/keynest-tokens.css` (`--kn-*`) |
| Theme bridge | `src/styles.css` maps AiGency theme keys → KeyNest semantics |
| Fonts | Poppins (500/700) + Lato (400/700) via Google Fonts in `__root.tsx` |
| Buttons | Pill, flat Action green; no blue gradient |
| Cards | 14px radius, border-first, no glass blur |
| Floating fields | LG radius, border focus (no ring) |
| Status chips | No backdrop blur |

## Visual QA checklist

- [ ] Login — Sage bg, Action green CTA, Poppins/Lato
- [ ] Shell sidebar — warm Ink dark, Action green accent
- [ ] Incident form — floating labels, copy endActions
- [ ] Agent dialog — password eye endAction
- [ ] Reports table — calm header/dividers
- [ ] Contrast AA on text over Sage/White

## Retired

- Blue `#007bff` primary
- Inter as UI font
- Gradient primary utility (now flat Action green)
- Heavy `hover-lift` translate/shadow (border-first)

## Logo

Brand green `#00B288` remains for logo/bird assets only — not wired as button fill.
