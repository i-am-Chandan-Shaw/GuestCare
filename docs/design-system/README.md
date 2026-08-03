# KeyNest Design System v1.0

Official design system for KeyNest — dashboard, admin, marketing, mobile, internal tools, and customer portal.

**Brand source of truth:** [Brand Book](../brand/KeyNest_Brand_Book.pdf)  
**Principle:** Security without feeling corporate.

Do not redesign the brand or logo. Extend the Brand Book into production tokens and components.

---

## Phase status

| Phase | Name | Status |
| ----- | ---- | ------ |
| 0 | Setup & inventory | Done |
| 1 | Foundations (identity & principles) | Done |
| 2 | Color system | Done |
| 3 | Type, spacing, radius, elevation, motion, layout | Done |
| 4 | Design tokens (CSS / JSON / Figma map) | Done |
| 5 | Components batch A (buttons, inputs, forms) | Done |
| 6 | Components batch B (feedback, overlays, nav) | Done |
| 7 | Components batch C (tables, charts, cards) | Done |
| 8 | Product patterns + responsive | Done |
| 9 | Accessibility + docs polish | Done |
| 10 | Figma variables & library structure | Done |
| 11 | GuestCare code migration | Done |

---

## Document map

### Foundations

- [Principles & design language](00-foundations/principles.md)
- [Voice & content](00-foundations/voice.md)
- [Imagery](00-foundations/imagery.md)
- [Color](00-foundations/color.md)
- [Typography](00-foundations/typography.md)
- [Spacing](00-foundations/spacing.md)
- [Radius](00-foundations/radius.md)
- [Elevation](00-foundations/elevation.md)
- [Motion](00-foundations/motion.md)
- [Grid & breakpoints](00-foundations/grid.md)
- [Iconography](00-foundations/iconography.md)
- [Opacity, borders, sizing, z-index](00-foundations/layout-tokens.md)

### Tokens

- [Naming conventions](01-tokens/naming.md)
- [Token usage](01-tokens/usage.md)
- [Alias map](01-tokens/alias-map.md)
- [tokens.json](01-tokens/tokens.json)
- CSS: `src/styles/keynest-tokens.css`

### Components

See [02-components/](02-components/)

### Patterns

See [03-patterns/](03-patterns/)

### Figma

See [04-figma/](04-figma/)

### Accessibility

See [05-accessibility/](05-accessibility/)

### Inventory

- [GuestCare inventory](00-foundations/inventory.md)

---

## Brief coverage (Parts 1–22)

| Brief part | Location |
| ---------- | -------- |
| 1 Foundation | `00-foundations/` |
| 2 Color | `00-foundations/color.md` |
| 3 Neutrals | `00-foundations/color.md` |
| 4 Typography | `00-foundations/typography.md` |
| 5 Spacing | `00-foundations/spacing.md` |
| 6 Radius | `00-foundations/radius.md` |
| 7 Elevation | `00-foundations/elevation.md` |
| 8 Motion | `00-foundations/motion.md` |
| 9 Grid | `00-foundations/grid.md` |
| 10 Iconography | `00-foundations/iconography.md` |
| 11 Design tokens | `01-tokens/` |
| 12 Figma variables | `04-figma/` |
| 13 CSS variables | `src/styles/keynest-tokens.css` |
| 14 Component library | `02-components/` |
| 15 Buttons | `02-components/button.md` |
| 16 Forms | `02-components/forms.md` |
| 17 Tables | `02-components/table.md` |
| 18 Dashboard patterns | `03-patterns/` |
| 19 Charts | `02-components/charts.md` |
| 20 Accessibility | `05-accessibility/` |
| 21 Responsive | `03-patterns/responsive.md` |
| 22 Documentation | Each doc uses the standard template |

---

## Working rules

1. Brand green `#00B288` is for logo / bird moments only — never default button fill.
2. Action green `#4FB28F` is the UI primary (buttons, links, active).
3. Prefer borders over shadows; soft radius; calm spacing.
4. Specs are values, not vibes.
5. WCAG AA minimum for text and interactive contrast.
