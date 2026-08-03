# Reports

## Purpose
Browse, filter, and open incident/report records.

## When to use
Product surfaces that match this job-to-be-done.

## When not to use
Don’t reuse this layout for unrelated workflows; pick a closer pattern.

## Layout anatomy
Search + filter chips → data grid → detail drawer/page

## Token usage
Table tokens · status badges · Action green links

## Components
Cards, tables, buttons, filters, empty/loading as needed from `02-components/`.

## Do
- Sage page background, white cards, thin borders
- One primary CTA per header region
- Clear hierarchy: title → filters → content → pagination

## Don’t
Don’t nest multiple heavy panels without progressive disclosure.

## Accessibility
Landmark regions (`main`, `nav`); skip link; table headers; focus order left-to-right, top-to-bottom.

## Engineering notes
Map to GuestCare routes/features where they exist; prefer composing shared shell (`AppLayout`).

## Figma notes
Build as a frame template bound to variables; publish after foundations.
