---
name: stitch-to-rn
description: |
  Convert Stitch HTML mocks to React Native screens for the Balkanski app.
  Reads HTML/Tailwind from stitch-mocks/, remaps to NativeWind semantic tokens,
  reuses shells from src/components/, writes an Expo Router screen to src/app/.
  Follows docs/workflow-recipe.md. Use when "convert stitch mock", "stitchify",
  "html to react native", "convert this screen", or whenever a file under
  stitch-mocks/ needs to become a working screen.
---

# stitch-to-rn

Convert Stitch-generated HTML/Tailwind mocks into React Native + NativeWind
screens that fit this codebase. The conversion knowledge already lives in
`docs/workflow-recipe.md` and `docs/conversion-cheatsheet.md` — this skill
is the discoverable trigger that pulls those docs together.

---

## When this fires

A user wants to turn one or more mocks under `stitch-mocks/` into Expo Router
screens under `src/app/`. Typical triggers:

- "convert stitch mock"
- "stitchify <screen-name>"
- "convert this screen to React Native"
- A new batch lands under `stitch-mocks/<date>-<label>/`

---

## Step 1 — Read these first (always, every time)

Before touching code:

1. `AGENTS.md` (repo root) — the always-on project rules.
2. `docs/workflow-recipe.md` — the 10-step conversion procedure.
3. `docs/conversion-cheatsheet.md` — HTML → React Native lookup table.
4. `tailwind.config.ts` — canonical color / radius / font tokens.
5. `src/components/` — the shell library. Use what's there; never reinvent.

Those four files are the source of truth. This SKILL.md is a pointer, not a
replacement.

---

## Step 2 — Identify the target

For each mock to convert:

- Read its `code.html`.
- Open the paired `screen.png` for visual reference.
- Decide the target route under `src/app/`:
  - Tabbed screens → `(tabs)/<tab>/index.tsx` or nested.
  - Modals → `(modal)/<name>.tsx`.
  - Auth flow → `(auth)/<name>.tsx`.
- If a needed route doesn't exist yet, confirm with the user before creating
  one outside the locked navigation structure (4 bottom tabs: Learn / Review
  / Library / Profile per CLARIFICATIONS.md).

---

## Step 3 — Apply the conversion patterns

Refer to `docs/conversion-cheatsheet.md` for the full table. The most common
mappings:

| HTML | React Native |
|---|---|
| `<div>` (container) | `<View>` |
| `<div>` (scrollable) | `<ScrollView>` |
| `<div>` (tappable) | `<Pressable>` |
| `<button>` | `<Pressable>` (never `TouchableOpacity`) |
| `<img>` | `<Image>` from `expo-image` (never RN core) |
| Bare text inside `<div>` | Wrap in `<Text>` — RN throws if text is bare |
| `space-x-*` / `space-y-*` | `gap-*` on parent (siblings don't work in RN) |
| `transition-*`, `hover:*` | Remove. Use `react-native-reanimated` if motion needed |
| `shadow-*` | Use the project's existing shadow tokens, or drop |

---

## Step 4 — Remap hex values to semantic tokens

Stitch output uses literal hex codes from the prompt. The codebase uses
semantic tokens. Every color must be remapped:

| Stitch hex | Token |
|---|---|
| `#FAF7F2` | `bg-bg` |
| `#FFFFFF` | `bg-surface` |
| `#E8E0D4` | `border-border` |
| `#1A1614` | `text-ink` |
| `#6B6660` | `text-muted` |
| `#E25822` | `bg-brand-500` / `text-brand-500` |
| `#C44A1A` | `bg-brand-600` |
| `#1F6F8B` | `bg-accent-500` / `text-accent-500` |
| `#3F8B5C` | `text-success` / `text-tierRight` |
| `#D9A441` | `text-warning` / `text-tierClose` |
| `#B33A3A` | `text-danger` / `text-tierWrong` |

Fonts: `Fraunces` → `font-display`; `Inter` → `font-sans`;
`NotoSerif` (for Cyrillic) → `font-cyrillic`.

Corner radii: `16px` → `rounded-card`; `12px` → `rounded-button`;
`9999px` → `rounded-pill`.

---

## Step 5 — Use existing shells (never reinvent)

Before writing a raw `<View>` with styling, check `src/components/` for a
matching shell:

- Card layouts → `<Card>` (variants: default / elevated / outlined / ghost)
- Buttons → `<Button>` (variants: primary / secondary / ghost / destructive;
  sizes sm / md / lg)
- Page wrapper → `<Screen>` (handles safe area, scroll, header/footer)
- Typography → `<Text>` (variants: display / h1-h3 / label / body / caption / mono)
- Flashcard → `<FlashCard>`
- Lesson scaffold → `<LessonStep>`
- Pareto progress → `<ParetoProgress>` (gated by honesty rule — see AGENTS.md)
- Streak badge → `<StreakBadge>`
- Compare panel → `<CompareLanguagesPanel>`
- Word chip → `<WordChip>` (tap-a-word pattern)
- Case-ending drill → `<CaseEndingPicker>`
- Cyrillic letter tile → `<CyrillicLetter>`

If a needed pattern has no shell, propose adding one to the library — don't
one-off it in the screen file.

---

## Step 6 — Wire navigation

- Use expo-router file-based routing under `src/app/`.
- Path alias `@/` for imports; never `../../..`.
- Modals: confirm the route lives under `(modal)/` with
  `presentation: 'modal'` in its parent layout.
- Compare-languages panel is a side panel, not a tab. Word-detail is a modal.

---

## Step 7 — Verify

Before declaring the conversion done:

```bash
pnpm tsc --noEmit       # types pass
pnpm test               # tests pass (if any cover the new screen)
```

If the screen has visible interactions, smoke-test it in the simulator. Type
checking confirms code correctness, not visual correctness — eyes still
required.

---

## Step 8 — Archive the source

After a successful conversion:

```bash
mv stitch-mocks/<batch>/<screen_name>/code.html \
   stitch-mocks/_archive/<screen_name>-<date>.html
```

Keep the `screen.png` next to the archived HTML for future visual reference.
Update `docs/progress-log.md` (if it exists) with a one-line entry naming
the screen and target route.

---

## Hard rules (from AGENTS.md — never violate)

- Never put raw text outside `<Text>`.
- Always `Pressable`, never `TouchableOpacity`.
- Always `expo-image`, never RN core `<Image>`.
- Color tokens only — no hardcoded hex in components.
- Path alias `@/` only — no `../../..` imports.
- No CSS transitions / hover. Use `react-native-reanimated` for motion.
- Reuse shells; never one-off a Card / Button / etc.

---

## Common Stitch artifacts to scrub

Stitch sometimes smuggles in elements the prompt excluded:

- Mascot or character illustrations — drop unless the design explicitly
  called for them.
- Decorative streak flames, XP bars, gem counters — strip (no gamification).
- Speaker / audio icons on screens that don't have audio yet (Phase 5+) —
  strip and leave the audio fields nullable.
- Multi-color gradient backgrounds — flatten to a single semantic token.
- Native-looking iOS chrome (status bar shapes, tab bar bumps) — let Expo
  handle real chrome; remove the mock version.

If unsure whether something is intentional, ask before stripping.

---

## Notes for cross-tool use

This SKILL.md is symlinked into `.claude/skills/stitch-to-rn/` and
`.gemini/skills/stitch-to-rn/` from the canonical file at
`.codex/skills/stitch-to-rn/SKILL.md`. Edit only the canonical file — the
symlinks pick up changes automatically. Format follows the agentskills.io
open standard.
