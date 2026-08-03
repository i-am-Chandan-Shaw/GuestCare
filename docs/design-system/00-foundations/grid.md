# Grid, containers & breakpoints

## Breakpoints

| Name | Min width | Columns | Margin | Gutter | Max content |
| ---- | --------- | ------- | ------ | ------ | ----------- |
| Mobile | 0 | 4 | 16px | 16px | 100% |
| Tablet | 768px | 8 | 24px | 16px | 100% |
| Laptop | 1024px | 12 | 32px | 24px | 1120px |
| Desktop | 1280px | 12 | 32px | 24px | 1280px |
| Wide | 1440px | 12 | auto | 24px | 1280px |

## Containers

| Token | Width | Use |
| ----- | ----- | --- |
| container-sm | 640px | Narrow forms |
| container-md | 768px | Articles |
| container-lg | 1024px | App content |
| container-xl | 1280px | Dashboard |
| container-shell | fluid | App with sidebar |

## App shell

- Sidebar width: **240px** (`--kn-sidebar-width`)
- Header height: **64px** (was 72; tighten for calm)
- Content padding: 24–32px desktop, 16px mobile

## Responsive rules

1. Collapse sidebar to icons / drawer below 1024px
2. Stack form grids 2→1 column below 640px
3. Tables: horizontal scroll or card list below 768px
4. Don’t shrink type below Caption for critical data
