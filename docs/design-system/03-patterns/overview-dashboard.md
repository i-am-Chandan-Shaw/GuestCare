# Overview Dashboard

## Purpose
At-a-glance health of operations: KPIs, recent activity, shortcuts.

## When to use
Product surfaces that match this job-to-be-done.

## When not to use
Don’t reuse this layout for unrelated workflows; pick a closer pattern.

## Layout anatomy
1. Top nav + sidebar
2. Page title + primary CTA
3. KPI row (3–4 statistic cards)
4. Main chart + side activity
5. Optional secondary table

## Token usage
`background` Sage · cards Surface/XL · chart-1 Action green · text Ink

## Components
Cards, tables, buttons, filters, empty/loading as needed from `02-components/`.

## Do
- Sage page background, white cards, thin borders
- One primary CTA per header region
- Clear hierarchy: title → filters → content → pagination

## Don’t
Don’t pack >4 KPIs above the fold; avoid decorative gradients.

## Accessibility
Landmark regions (`main`, `nav`); skip link; table headers; focus order left-to-right, top-to-bottom.

## Engineering notes
Map to GuestCare routes/features where they exist; prefer composing shared shell (`AppLayout`).

## Figma notes
Build as a frame template bound to variables; publish after foundations.
