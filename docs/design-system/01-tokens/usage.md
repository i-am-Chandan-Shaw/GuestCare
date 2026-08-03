# Token usage

## Purpose

How engineers and designers consume KeyNest tokens in production.

## Do

- Use semantic tokens (`--kn-color-primary`, `text-text-primary`, `bg-app-bg`)
- Use Tailwind theme aliases already wired in `src/styles.css`
- Prefer borders + `--kn-shadow-1` over custom shadows
- Use Poppins via `font-[family-name:var(--font-display)]` or heading elements
- Use Lato via body / `font-sans`

## Don’t

- Hardcode `#00B288` on buttons (Brand green = logo only)
- Reintroduce blue gradients (`btn-primary-gradient` is now flat Action green)
- Invent one-off spacing (use `--kn-space-*`)

## CSS example

```css
.card {
  background: var(--kn-color-surface);
  border: var(--kn-border-width) solid var(--kn-color-border);
  border-radius: var(--kn-radius-xl);
  box-shadow: var(--kn-shadow-1);
}
```

## Tailwind example

```tsx
<div className="bg-app-bg text-text-primary border border-border-color rounded-[var(--kn-radius-xl)]" />
<button className="bg-brand-primary text-white rounded-full h-10 px-5" />
```
