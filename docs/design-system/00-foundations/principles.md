# Principles & design language

## Purpose

Define how KeyNest should feel across every product surface so teams ship consistently without reinventing identity.

## Brand personality (from Brand Book)

| Trait | Meaning in UI |
| ----- | ------------- |
| Straightforward | Plain labels, no jargon, one idea per sentence |
| Reassuring | Clear status, tracking, confirmation — never alarmist |
| Approachable | Soft radius, warm sage/cream, human copy |
| Practical | Benefit-led UI; density only when the task needs it |

## Optimise for

Trust · Clarity · Consistency · Accessibility · Scalability · Low cognitive load · Warmth · Confidence · Professionalism · Human-centered interactions · Minimalism · Practicality

## Design language

**North star:** Security without feeling corporate. Premium, calm, modern, timeless — unmistakably KeyNest.

### Prefer

- Soft rounded corners (pill CTAs, 14px cards)
- Calm 8pt spacing and generous whitespace
- Subtle borders (sage-tinted), almost invisible shadows
- Strong typography hierarchy (Poppins + Lato)
- Soft interactions (150–250ms)
- Clear hierarchy, low color noise

### Avoid

- Material Design / Bootstrap generic SaaS look
- Glassmorphism, neumorphism
- Heavy gradients (retire AiGency blue gradients)
- Loud shadows, decorative chrome
- Fancy / attention-seeking animation
- Excessive color and badge spam

## When to use

- Any new KeyNest screen, marketing page, or internal tool
- Design reviews and component proposals

## When not to use

- Do not invent a parallel “enterprise dark corporate” theme that conflicts with Sage/Ink
- Do not treat Brand green as a UI fill

## Best practices

1. One primary action per view region
2. Status color for meaning, Action green for action
3. Borders before elevation

## Common mistakes

- Using Brand green `#00B288` on buttons
- Navy text leftovers from AiGency (`#1b2559`) instead of Ink
- Gradient primary buttons

## Engineering notes

Consume semantic CSS tokens (`--kn-*`). Do not hardcode Brand Book hex in components except logo assets.

## Figma notes

Foundations collection first; components bind to variables, not raw hex.

## Accessibility notes

WCAG AA for text and controls. Focus visible without relying on color alone.
