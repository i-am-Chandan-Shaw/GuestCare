# Iconography

## Purpose

Consistent, calm icons that match rounded KeyNest geometry.

## Preferred library

**Lucide React** — already in GuestCare; geometric, readable, MIT.

## Specs

| Attribute | Value |
| --------- | ----- |
| Stroke width | **1.75–2** (default 2) |
| Roundedness | Round joins/caps (Lucide default) |
| Corner feel | Soft; avoid sharp custom icons |

## Sizes

| Size | px | Use |
| ---- | -- | --- |
| 12 | 12 | Dense table affordance |
| 16 | 16 | Default inline / input endAction |
| 18 | 18 | Buttons (compact) |
| 20 | 20 | Buttons default / nav |
| 24 | 24 | Empty states, nav emphasis |
| 32 | 32 | Feature icons |
| 48 | 48 | Empty/hero illustration icons |

## Filled vs outline

- **Outline (default)** for UI actions and navigation
- **Filled** sparingly for selected/toggle on, status dots
- Don’t mix fill styles in one toolbar

## Usage rules

1. Pair with text for primary actions when space allows
2. `aria-label` required for icon-only buttons
3. End-actions in fields: 16px, hit target 32px
4. Color: `text.secondary` default; `primary` when selected; status colors for meaning

## When not to use

Custom illustrated icons in dense tables; stick to Lucide.
