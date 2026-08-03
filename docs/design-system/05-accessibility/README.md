# Accessibility (WCAG AA)

## Purpose

KeyNest must be usable by everyone. Target **WCAG 2.2 AA**.

## Principles

1. **Contrast** — Text/icons meet AA on Sage, Cream, White, and dark sidebar
2. **Keyboard** — All interactive elements reachable; visible focus
3. **Focus rings** — Prefer border-focus Action green; soft ring token optional
4. **Touch targets** — Minimum 44×44px for primary controls
5. **Reduced motion** — Honor `prefers-reduced-motion` (tokens collapse durations)
6. **Screen readers** — Semantic HTML + ARIA only when needed
7. **Don’t rely on color alone** — Status = color + text/icon

## Contrast matrix (approximate)

| Foreground | Background | Result |
| ---------- | ---------- | ------ |
| Ink `#2A2622` | White | Pass AA body |
| Ink | Sage `#ECEFEA` | Pass AA body |
| Ink | Cream `#F8F0DF` | Pass AA body |
| Ink | Yellow `#FFF8B7` | Pass AA (tags) |
| White | Action green `#4FB28F` | ~3.1:1 — use for large/bold UI text (buttons); avoid tiny body text on primary |
| White | Primary hover `#3F9A7A` | Better for small labels |
| Secondary text `#5A534C` | White | Pass AA |
| Tertiary `#736B63` | White | Prefer large text / non-critical |
| Sidebar text 72% white | `#1C1917` | Pass for UI |

## Focus

- `:focus-visible` outline/border using `--kn-color-border-focus`
- Never `outline: none` without a replacement
- Modals trap focus; restore on close

## Keyboard

| Control | Keys |
| ------- | ---- |
| Buttons/links | Enter / Space |
| Menus | Arrows, Home/End, Escape |
| Dialogs | Escape, Tab cycle |
| Tabs | Arrows |
| Grids | Vendor + documented shortcuts |

## Forms

- Labels always present (floating counts)
- Errors linked via `aria-describedby`
- Required announced; don’t use color-only required markers

## Checklist (release gate)

- [ ] Contrast checked for new text/surfaces
- [ ] Keyboard path verified
- [ ] Focus visible
- [ ] Images have alt (or empty alt if decorative)
- [ ] Reduced motion verified
- [ ] Status not color-only

See also component-level Accessibility sections under `02-components/`.
