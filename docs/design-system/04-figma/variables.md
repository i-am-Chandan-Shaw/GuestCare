# Figma variables & library structure

## Purpose

Organize Figma variables to match KeyNest tokens so design ↔ code stay aligned.

## Modes

| Mode | Status |
| ---- | ------ |
| Light | **v1 — ship** |
| Dark | Deferred (Brand Book does not define dark UI) |

## Collections (exact groups)

```
Color/
Text/
Background/
Surface/
Border/
Spacing/
Radius/
Elevation/
Motion/
Typography/
Component/
State/
Mode/
Status/
```

### Examples

| Figma name | Maps to |
| ---------- | ------- |
| `Color/Primary` | `--kn-color-primary` |
| `Color/Primary Hover` | `--kn-color-primary-hover` |
| `Color/Brand Green` | `--kn-color-brand-green` (logo only) |
| `Text/Primary` | `--kn-color-text-primary` |
| `Background/Default` | `--kn-color-background` |
| `Background/Secondary` | `--kn-color-background-secondary` |
| `Surface/Default` | `--kn-color-surface` |
| `Border/Default` | `--kn-color-border` |
| `Border/Focus` | `--kn-color-border-focus` |
| `Spacing/4` … `Spacing/128` | `--kn-space-*` |
| `Radius/XL` | `--kn-radius-xl` (cards) |
| `Radius/Pill` | `--kn-radius-pill` (buttons) |
| `Elevation/1` | `--kn-shadow-1` |
| `Motion/Duration/200` | `--kn-duration-200` |
| `Typography/Font/Display` | Poppins |
| `Typography/Font/Body` | Lato |
| `Status/Success` | `--kn-color-success` |

## Library build order

1. Foundations variables (Color, Text, Background, Surface, Border, Spacing, Radius, Elevation, Motion, Typography)
2. Primitives: Button, Input/Floating Label, Select, Checkbox/Radio/Switch, Avatar, Badge/Tag
3. Overlays: Dialog, Drawer, Popover, Tooltip, Toast
4. Navigation: Sidebar, Tabs, Breadcrumb
5. Data: Table, Card, Charts
6. Patterns: Dashboard, Reports, Settings frames

## Code Connect (priority)

| Figma | Code |
| ----- | ---- |
| Button | `src/components/ui/Button.tsx` |
| Input / Floating Label | `src/shared/components/FloatingLabelField.tsx` |
| Card | `src/components/ui/Card.tsx` |
| Dialog | `src/components/ui/dialog.tsx` |

## Naming conventions

- Spaces in Figma display names OK (`Primary Hover`)
- No raw hex on components — always bind variables
- Component properties for variant/size/state

## Engineering notes

Canonical CSS: `src/styles/keynest-tokens.css`  
JSON: `docs/design-system/01-tokens/tokens.json`  
Alias map: `docs/design-system/01-tokens/alias-map.md`
