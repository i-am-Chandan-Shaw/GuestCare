# GuestCare inventory (pre-migration)

Snapshot of existing UI building blocks before KeyNest adoption.

## Tokens today

| Area | Location | Notes |
| ---- | -------- | ----- |
| Theme / CSS variables | `src/styles.css` + `src/styles/keynest-tokens.css` | KeyNest `--kn-*` (legacy AiGency `src/theme/tokens.ts` removed) |
| AG Grid | `src/styles/ag-grid.css` | Table chrome |
| Utility classes | `btn-primary-gradient`, `hover-lift` | Now remapped to Action green / border-first hover |

## UI primitives (`src/components/ui/`)

| Component | File |
| --------- | ---- |
| Button | `Button.tsx` — primary/secondary/cancel/danger/ghost |
| Card | `Card.tsx` |
| StatusChip | `StatusChip.tsx` |
| Dialog | `dialog.tsx` |
| Toast | `sonner.tsx` |

## Shared components (`src/shared/components/`)

| Component | Notes |
| --------- | ----- |
| AppLayout / AppSidebar | Shell navigation |
| Avatar | User avatars |
| FloatingLabelField | Form inputs with endAction |
| SearchToolbar | Search chrome (out of floating-label scope) |
| Portfolio cards | Customer/property cards |
| LoadingState / QueryErrorState | Empty/error states |
| GlanceStats / SummaryRow | Metrics rows |
| ui-kit | Shared kit helpers |

## Feature surfaces

| Feature | Key UI |
| ------- | ------ |
| Auth | `LoginPage.tsx` |
| Incidents | Form, compose shell, preview, reports table |
| Reports | Detail, edit dialog, thread, filters |
| Agents | List, form dialog |
| Workspace | Call workspace, issue history, protocol |
| Copilot | Issue/property panels, meta tabs |

## Gaps vs KeyNest Brand Book

- Primary is blue, not Action green
- Fonts are Inter / JetBrains Mono, not Poppins / Lato
- Buttons use gradients + rounded-lg, Brand Book wants pill + flat Action green
- Cards use mixed radii; Brand Book specifies ~14pt + thin border
- App background is `#f8f9fa`, Brand Book Sage is `#ECEFEA`
- Text primary is navy `#1b2559`, Brand Book Ink is `#2A2622`
