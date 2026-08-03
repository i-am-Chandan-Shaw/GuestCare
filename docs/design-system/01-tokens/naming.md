# Naming conventions

Enterprise-scale naming for designers and engineers.

## Principles

- **Semantic over literal** — prefer `color.text.primary` over `color.ink`
- **Brand primitives stay named** — `color.brand.green` for logo-only use
- **Stable aliases** — product code consumes semantic tokens; primitives can shift

## Layers

| Layer | Format | Example |
| ----- | ------ | ------- |
| Primitive | `kn.color.raw.*` | `kn.color.raw.action-green` |
| Semantic | `kn.color.primary` | Primary interactive fill |
| Component | `kn.button.primary.bg` | Optional component override |
| CSS | `--kn-*` | `--kn-color-primary` |
| Figma | `Group/Name` | `Color/Primary` |
| Tailwind theme | kebab without prefix where aliased | `brand-primary` → maps to `--kn-color-primary` |

## CSS

```css
--kn-color-primary
--kn-color-primary-hover
--kn-space-4
--kn-radius-lg
--kn-shadow-sm
--kn-font-body
--kn-duration-fast
--kn-z-modal
```

Rules:

- Always `--kn-` prefix for KeyNest tokens
- Use kebab-case segments
- State suffixes: `-hover`, `-active`, `-disabled`, `-focus`
- Surface suffixes: `-surface` for tinted backgrounds

## Figma variables

Collections:

| Collection | Contents |
| ---------- | -------- |
| `Color/` | Brand + semantic + status + chart |
| `Text/` | Text color roles |
| `Background/` | Page backgrounds |
| `Surface/` | Cards, panels, elevated |
| `Border/` | Default, hover, focus, divider |
| `Spacing/` | 2–128 scale |
| `Radius/` | none–pill–circle |
| `Elevation/` | Level 0–3 + overlays |
| `Motion/` | Duration + easing |
| `Typography/` | Font families + style refs |
| `Component/` | Component-scoped overrides |
| `State/` | Hover / pressed / focus / disabled |
| `Mode/` | Light (v1); Dark deferred |
| `Status/` | Success / warning / danger / info |

Naming: `Color/Primary`, `Color/Primary Hover`, `Spacing/4`, `Radius/LG`.

## JSON / code

```json
{
  "color": {
    "primary": { "value": "#4FB28F", "type": "color" }
  }
}
```

Use dot paths in docs (`color.primary`); CSS uses dashes (`--kn-color-primary`).
