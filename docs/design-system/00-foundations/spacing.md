# Spacing system (8-point)

## Purpose

Predictable rhythm that keeps KeyNest calm. Base unit **4px**; preferred steps on **8px**.

## Scale

| Token | px | rem | Where used | Component examples | Combinations |
| ----- | -- | --- | ---------- | ------------------ | ------------ |
| space-2 | 2 | 0.125 | Hairline icon nudge | Icon optical align | Rare; prefer 4 |
| space-4 | 4 | 0.25 | Tight inline gaps | Badge padding-y, icon-to-text fine tune | With 8 for chips |
| space-8 | 8 | 0.5 | Default compact gap | Chip padding, form field stack min | Field → helper |
| space-12 | 12 | 0.75 | Comfortable inline | Button icon gap, card meta | Button padding-x pair |
| space-16 | 16 | 1 | Default component padding | Card padding (compact), input x | Card + 16 |
| space-20 | 20 | 1.25 | Field block gap | Form vertical rhythm | Between inputs |
| space-24 | 24 | 1.5 | Section padding | Card padding (default), dialog body | Card 24 + gap 16 |
| space-32 | 32 | 2 | Section separation | Page sections, dialog padding | Stack sections |
| space-40 | 40 | 2.5 | Large section | Settings groups | — |
| space-48 | 48 | 3 | Page header bottom | Dashboard header | With 24 content |
| space-56 | 56 | 3.5 | Hero spacing mobile | Marketing | — |
| space-64 | 64 | 4 | Major page bands | Dashboard top | — |
| space-72 | 72 | 4.5 | Large marketing | — | — |
| space-80 | 80 | 5 | Hero desktop | Marketing hero | — |
| space-96 | 96 | 6 | XL bands | Landing | — |
| space-128 | 128 | 8 | Max band | Rare marketing | Don’t use in app chrome |

## Rules

- Stack form fields with **20**
- Card internal padding **16–24**
- Page margin mobile **16**, tablet **24**, desktop **32**
- Never mix arbitrary 6/10/14px in new UI

## Accessibility

Touch targets ≥44px; spacing can expand hit area without visual growth via padding.
