# Typography

## Purpose

Poppins for friendly geometric headlines/buttons; Lato for highly legible UI and long form (Brand Book §05).

## Families

| Role | Family | Weights |
| ---- | ------ | ------- |
| Display / headings / buttons | Poppins | Medium 500, Bold 700 |
| Body / labels / captions / tables | Lato | Regular 400, Bold 700 |

Fallbacks: `Poppins, ui-sans-serif, system-ui, sans-serif` · `Lato, ui-sans-serif, system-ui, sans-serif`

## Scale

| Style | Font | Weight | Size | Line height | Letter spacing | Paragraph spacing | Max line length | Usage |
| ----- | ---- | ------ | ---- | ----------- | -------------- | ----------------- | --------------- | ----- |
| Display XL | Poppins | 700 | 56px / 3.5rem | 64px (1.14) | -0.02em | 24px | 18ch | Marketing hero only |
| Display L | Poppins | 700 | 44px / 2.75rem | 52px (1.18) | -0.02em | 20px | 20ch | Landing sections |
| Display M | Poppins | 700 | 36px / 2.25rem | 44px (1.22) | -0.015em | 16px | 22ch | Feature titles |
| Display S | Poppins | 500 | 28px / 1.75rem | 36px (1.29) | -0.01em | 16px | 28ch | Soft display |
| H1 | Poppins | 700 | 32px / 2rem | 40px (1.25) | -0.015em | 16px | 32ch | Page title |
| H2 | Poppins | 700 | 24px / 1.5rem | 32px (1.33) | -0.01em | 12px | 40ch | Section |
| H3 | Poppins | 500 | 20px / 1.25rem | 28px (1.4) | -0.005em | 12px | 48ch | Subsection |
| H4 | Poppins | 500 | 18px / 1.125rem | 26px (1.44) | 0 | 8px | 52ch | Card title |
| Title | Poppins | 700 | 16px / 1rem | 24px (1.5) | 0 | 8px | 60ch | Dense titles |
| Subtitle | Lato | 400 | 16px / 1rem | 24px (1.5) | 0 | 8px | 60ch | Supporting under title |
| Body Large | Lato | 400 | 18px / 1.125rem | 28px (1.56) | 0 | 16px | 68ch | Marketing body |
| Body | Lato | 400 | 15px / 0.9375rem | 24px (1.6) | 0 | 12px | 68ch | Default UI / paragraphs |
| Body Small | Lato | 400 | 13px / 0.8125rem | 20px (1.54) | 0 | 8px | 72ch | Compact UI |
| Caption | Lato | 400 | 12px / 0.75rem | 16px (1.33) | 0.01em | 4px | 72ch | Meta, footnotes |
| Label | Lato | 700 | 12px / 0.75rem | 16px (1.33) | 0.02em | — | — | Form labels (non-floating) |
| Button | Poppins | 700 | 14px / 0.875rem | 20px (1.43) | 0.01em | — | — | Button text |
| Overline | Lato | 700 | 11px / 0.6875rem | 14px (1.27) | 0.08em | — | — | Uppercase category |
| Helper Text | Lato | 400 | 12px / 0.75rem | 16px (1.33) | 0 | — | 60ch | Field help / errors |
| Table Text | Lato | 400 | 13px / 0.8125rem | 18px (1.38) | 0 | — | — | Grid cells |
| Navigation | Lato | 700 | 13px / 0.8125rem | 20px (1.54) | 0.01em | — | — | Sidebar / tabs |

Floating labels use Label/Caption sizes inside the field (see forms/floating-label specs).

## When to use / not

- Prefer Body (15) for product UI; Body Large for marketing
- Don’t use Display styles inside dense dashboards
- Don’t set long paragraphs in Poppins Bold

## Best practices

- Max ~2 typefaces in a view (already satisfied)
- Truncate with ellipsis in tables; never shrink below Caption for critical data

## Engineering notes

Load Poppins 500/700 and Lato 400/700 via `next/font` or Google Fonts in root. CSS: `--kn-font-display`, `--kn-font-body`.
