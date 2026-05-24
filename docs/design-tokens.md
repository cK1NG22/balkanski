# Design Tokens

The token table in `tailwind.config.ts` is the swap point that turns Stitch's arbitrary colors into our brand. Placeholder palette today; real brand swaps in Phase 8.

## Colors

| Token | Use |
|---|---|
| `bg-brand-{50,100,500,600,900}` | Primary brand (placeholder terra-cotta) |
| `bg-accent-{500,900}` | Accent (placeholder Ohrid blue) |
| `bg-bg` | App background (warm off-white) |
| `bg-surface` | Card surface |
| `border-border` | Borders / dividers |
| `text-ink` | Default text |
| `text-muted` | Secondary text |
| `bg-success` / `text-success` | Affirmative state |
| `bg-warning` / `text-warning` | Caution state |
| `bg-danger` / `text-danger` | Destructive / wrong state |
| `bg-tierRight` / `text-tierRight` | Grading: exact match |
| `bg-tierClose` / `text-tierClose` | Grading: close (typo / missing diacritic) |
| `bg-tierWrong` / `text-tierWrong` | Grading: wrong |

## Typography

| Token | Use |
|---|---|
| `font-sans` (Inter) | Body, UI |
| `font-display` (Fraunces) | Display headlines |
| `font-cyrillic` (NotoSerif) | Serbian Cyrillic — needs full Cyrillic coverage |
| `font-mono` (JetBrainsMono) | Code, IPA, ranks |

Sizes via Tailwind defaults (`text-xs`, `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl` … `text-5xl`).

## Radius

| Token | Use |
|---|---|
| `rounded-card` (16px) | Cards |
| `rounded-button` (12px) | Buttons, inputs |
| `rounded-pill` (full) | Chips, streak badge |

## Spacing

Tailwind defaults (`p-1` through `p-12`, etc.). No custom spacing scale yet.

## When to add a token

If a Stitch mock introduces a new color/size/radius that recurs in 2+ screens, add it to `tailwind.config.ts`. One-offs stay inline as raw classes.
