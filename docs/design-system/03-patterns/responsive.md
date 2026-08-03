# Responsive design

## Purpose
Adapt KeyNest layouts across devices without losing clarity or touch accessibility.

## Breakpoints
See [grid.md](../00-foundations/grid.md): Mobile · Tablet · Laptop · Desktop · Wide.

## Desktop / Laptop
- Sidebar expanded (240px)
- Content max 1280px
- Tables full grid
- Spacing 24–32 page padding

## Tablet
- Sidebar collapsible / icon rail
- 8-column grids
- Filters may move into popover
- Padding 24

## Mobile
- Bottom nav or hamburger drawer
- Single column forms
- Tables → horizontal scroll or card list
- Padding 16
- Touch targets ≥ 44px
- Type: keep Body Small minimum for critical data

## Adaptive components
| Component | Behaviour |
| --------- | --------- |
| Sidebar | Drawer below 1024 |
| Dialog | Nearly full-screen sheet on mobile |
| Table | Scroll or cards |
| Button groups | Stack full-width |
| KPI row | 2×2 then 1-col |

## Typography scaling
Display styles step down one level on mobile; Body stays 15/13.

## Spacing adjustments
Prefer dropping optional side panes before compressing padding below 16.

## Accessibility
No horizontal page scroll except intentional tables; focus order remains logical when nav collapses.
