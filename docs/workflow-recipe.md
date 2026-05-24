# Workflow Recipe — Stitch HTML → Shipped Screen

The 10-step procedure for converting a Google Stitch HTML mock into a working `src/app/` route. Claude follows this recipe on every mock conversion.

## What Carter does
1. Sketches a screen on paper / iPad.
2. Feeds the sketch to Google Stitch with a prompt describing the feature.
3. Gets HTML + Tailwind back.
4. Saves the HTML to `stitch-mocks/<screen-name>-<YYYY-MM-DD>.html`.
5. Tells Claude: "convert `<filename>`, route is `<expo-router-path>`."

## What Claude does

### 1. Read the mock
- Open `stitch-mocks/<filename>.html`.
- Open `docs/conversion-cheatsheet.md` (always — every conversion).
- Open `src/components/index.ts` to see available shells.
- Open `tailwind.config.ts` to see brand tokens.

### 2. Identify the screen
- Confirm the expo-router path from Carter (e.g., `src/app/(tabs)/learn/index.tsx`).
- If the route file doesn't exist yet, create it as a thin wrapper.
- If the screen needs data, check `src/data/schemas/` for the relevant zod schema. If missing, **ask Carter what fields it should have** — never invent schemas.

### 3. Map HTML to shells (top-down walk)
- Outermost wrapper → `<Screen>` (note `scroll`, `safe`, `header`, `footer` props)
- Card-like `<div class="rounded-* shadow-* p-*">` → `<Card variant="…">`
- Every `<h*>`, `<p>`, `<span>`, raw text → `<Text variant="…">`
- Every `<button>` → `<Button label onPress variant="…" />`
- Tap-a-word pattern → `<WordChip>`
- Cyrillic letter tile → `<CyrillicLetter>`
- Audio play icon → `<AudioPlayer compact />` (Phase 5+ stub for now)
- Record / mic icon → `<RecordButton />` (Phase 5+ stub)
- Teacher illustration → `<TeacherAvatar teacherId="…" />`
- Progress bar → `<ProgressBar value={…} />`
- "X% to fluency" indicator → `<ParetoProgress currentRank targetRank language />`
- Streak indicator → `<StreakBadge days />`
- Flashcard front/back → `<FlashCard front back />`
- Grammar drill picker → `<CaseEndingPicker>`
- Cross-language compare panel → `<CompareLanguagesPanel>`
- Lesson wrapper → `<LessonStep prompt instruction children feedback onContinue />`

If a needed pattern has NO shell, **stop and propose adding a new shell** to `src/components/`. Don't one-off it.

### 4. Translate classes
Apply `docs/conversion-cheatsheet.md` line by line. Common substitutions:
- `space-x-*` → `gap-*` on parent
- `space-y-*` → `gap-*` + `flex-col` on parent
- `divide-*` → explicit `<View className="h-px bg-border" />` separator
- `bg-gradient-to-*` → `<LinearGradient>` from `expo-linear-gradient`
- `transition-*`, `duration-*`, `hover:*`, `cursor-*` → drop or move to Reanimated
- `bg-orange-500` (Stitch default) → `bg-brand-500` (brand token)
- `w-screen` / `h-screen` → `w-full` / `h-full` or `flex-1`
- Inline SVG → `react-native-svg` components (or extract to .svg file and import)

### 5. Wire data
- Read fields from the relevant zod schema in `src/data/schemas/`.
- Use TanStack Query keys from `src/lib/storage/queries.ts` (when added in Phase 1).
- Never inline raw fetch — go through the data layer (`src/data/api/`).
- For static content (alphabet, seed vocab), import from `content/`.

### 6. Wire navigation
- Internal links: `import { Link, router } from 'expo-router'`
- Programmatic nav: `router.push('/path')`
- Modal: `router.push('/(modal)/lesson-active')`
- Back: `router.back()`
- Typed routes are enabled in `app.json` (`experiments.typedRoutes: true`) — TS will catch bad paths.

### 7. Add interaction handlers
- 1-field forms: `useState` + button onPress.
- 2+ field forms: `react-hook-form` + zod resolver.
- Animations: `react-native-reanimated` v4 (NOT CSS transitions).
- Gestures: `react-native-gesture-handler`.

### 8. Tests
- If a new shell was introduced, add a smoke test in `tests/components/`.
- Run `pnpm test` and `pnpm tsc --noEmit`.

### 9. Verify
- `pnpm start`, open iOS simulator, navigate to the route.
- Take a screenshot, compare to the Stitch mock.
- Note brand-token deviations (intentional) vs layout deviations (bugs).

### 10. Archive + log
- Move the source HTML from `stitch-mocks/` to `stitch-mocks/_archive/<filename>`.
- Append a one-line entry to `.claude/memory/progress-log.md`.
- If a new shell was added or a new pattern emerged, append to `.claude/memory/decisions.md`.

---

## Sharp edges

- **Hook-guarded directories**: `/auth/`, `/migrations/`, `/payments/` (Carter's global `guard-sharp-edges.sh`). Phase 0 left auth helpers inlined in `src/providers/AuthProvider.tsx`; the lib helpers move to `src/lib/auth/` only when Carter authorizes the writes in Phase 1.
- **React Compiler is ON** (`experiments.reactCompiler: true` in `app.json`). Write simple functional components — no `useMemo`/`useCallback` unless profiling shows a real need.
- **Reanimated 4** uses `react-native-worklets/plugin` (not the v3 plugin). Already wired in `babel.config.js`. Don't import from `react-native-reanimated/plugin` — it doesn't exist in v4.
- **`text-` colors need `<Text>` children**. `<View className="text-ink">hello</View>` will throw at runtime because `hello` is a string outside `<Text>`.
