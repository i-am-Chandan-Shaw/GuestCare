# Table / Data Grid

## Purpose
Enterprise data. Sticky header, sort, filter, pagination, bulk, density, expand, inline edit, selection.

## When to use
Reports, agents, audit logs.

## When not to use
Simple 3-row summaries — use list.

## Variants
Comfortable · Compact

## Sizes
md

## Anatomy / spacing
8–16 padding; gaps from spacing scale

## Typography
Table Text 13 Lato

## Radius
MD–XL or Pill for tags

## States
| State | Spec |
| ----- | ---- |
| Default | — |
| Hover | — |
| Pressed | — |
| Focused | `--kn-color-border-focus` / focus-visible |
| Disabled | muted + not-allowed |
| Loading | Skeleton or spinner |
| Error | Danger semantics |
| Success | Success semantics |

## Accessibility
- Keyboard: Arrow navigation where grid supports; Space select
- ARIA: Roles + labels
- Touch ≥ 44px for primary controls

## Responsive
Adapt layout under 768px

## Design notes
KeyNest calm UI; Action green accents.

## Engineering notes
ag-grid + ServerPaginatedTable; header bg neutral-50; divider token

## Figma notes
Variables from Color/Spacing/Radius/Elevation. Set: `Table / Data Grid`.

## Best practices
Sticky header; bulk bar; empty + loading states; selection checkbox column.

## Common mistakes
Zebra in loud colors; tiny unreadable type
