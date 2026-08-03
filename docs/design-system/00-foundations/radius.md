# Radius system

## Purpose

Soft, friendly corners matching the bird mark — without bubble UI everywhere.

## Scale

| Token | Value | Components |
| ----- | ----- | ---------- |
| None | 0 | Sharp data sparklines, full-bleed media |
| XS | 4px | Checkboxes subtle, tiny chips |
| SM | 6px | Tooltips, small badges |
| MD | 8px | Inputs (compact), menus |
| LG | 12px | Default controls, dialogs (compact) |
| XL | **14px** | **Cards** (Brand Book “14pt radius”) |
| 2XL | 20px | Large panels, sheets |
| Pill | 9999px | **Primary/secondary buttons**, tags, pills (Brand Book) |
| Circle | 50% | Avatars, icon buttons circular |

## Mapping Brand Book → tokens

| Brand Book | Token |
| ---------- | ----- |
| Fully rounded buttons | `radius.pill` |
| Cards 14pt | `radius.xl` |
| Tags / yellow pills | `radius.pill` |

## When not to use

- Don’t pill dense table action icons (use Circle or MD)
- Don’t use 2XL on every card — XL is the product default
