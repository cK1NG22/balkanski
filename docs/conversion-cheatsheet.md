# HTML → React Native Conversion Cheat Sheet

**Read this on every Stitch mock conversion.** Carter's workflow: he sketches a screen, runs it through Google Stitch to get HTML/Tailwind, drops the file in `stitch-mocks/`, and Claude converts it to React Native using shells from `src/components/`.

This is the rule book for the translation. Use shells whenever possible — never reinvent a Card, Button, FlashCard, or text variant.

---

## Element mapping

| Stitch HTML | React Native | Notes |
|---|---|---|
| `<div>` | `<View>` | Default. If `onClick` → `<Pressable>`. If `overflow: scroll` → `<ScrollView>`. |
| `<span>`, `<p>`, `<h1>`–`<h6>`, raw text | `<Text variant="…">` | **Critical:** RN throws "Text strings must be rendered within a `<Text>` component" if a bare string sits in a View. Map `<h1>` → `variant="h1"`, etc. |
| `<img src>` | `<Image>` from `expo-image` | Use `expo-image`, **not** core `Image` — caching, blurhash, faster decoding. Local: `source={require('./x.png')}`. Remote: `source={{ uri }}`. Add `contentFit` (= CSS `object-fit`). |
| `<button>` | `<Pressable>` | **Always Pressable, never `TouchableOpacity`.** Pressable supports `active:bg-…` via NativeWind; Touchable only animates opacity. For full button styling use our `<Button>` shell. |
| `<input type="text">` | `<TextInput>` | Use `value` / `onChangeText` (NOT `onChange`). Set `keyboardType`, `autoCapitalize="none"` for transliteration entry. |
| `<input type="checkbox">` | `<Switch>` or custom `<Pressable>` | RN has no native checkbox. Switch for iOS-style toggles; custom Pressable + icon for visual checkboxes. |
| `<a href="/x">` (internal) | `<Link href="/x">` from `expo-router` | Wraps children, navigates within app. Use `asChild` when wrapping a Pressable / Card. |
| `<a href="https://…">` (external) | `<Pressable onPress={() => Linking.openURL(url)}>` | Use `expo-linking`. |
| `<form>` | Nothing — just a `<View>` | RN has no `<form>`. Submit via the submit button's `onPress`. |
| `<select>` | Custom modal + `<FlatList>` | RN's picker is platform-inconsistent; build a custom one for design control. |
| `<ul>` / `<ol>` / `<li>` | `<View>` + `<Text>` per item, or `<FlatList>` if data-driven and long | Static short lists → View. Dynamic/scrolling → FlatList for virtualization. |
| `<svg>` inline | `react-native-svg` components | The Metro config in `metro.config.js` is already set up for `react-native-svg-transformer` so `import Logo from './logo.svg'` works. Inline `<path>` etc. use `<Svg>`, `<Path>`, `<G>` from `react-native-svg`. |
| `<video>` | `expo-av` `Video` | Defer until needed. |
| `<canvas>` | `react-native-skia` (if needed) | Probably not needed. |

---

## Style mapping (NativeWind v4)

| Stitch CSS / Tailwind | RN equivalent | Notes |
|---|---|---|
| `display: flex` | Default — every `<View>` is already flex column | **CSS `flex-direction` default is `row`; RN's is `column`.** Stitch often outputs `flex` expecting row. Add `className="flex-row"` explicitly. |
| `display: block` / `inline-block` | Not a concept in RN | Drop. RN is flexbox-only. |
| `display: grid` / `grid-cols-*` | Manual nested flex or `react-native-flexible-grid` | NativeWind v4 has no grid utilities. Convert to nested flex. |
| `position: fixed` (header/footer) | `<SafeAreaView>` + absolute, or use the `header` / `footer` slots on our `<Screen>` shell | Prefer `<Screen header={...} footer={...}>`. |
| `position: sticky` | `<Animated.ScrollView>` + `stickyHeaderIndices`, or absolute position | |
| `position: absolute` | `className="absolute top-0 left-0 …"` | Translates cleanly. |
| `z-index: N` | `className="z-N"` or `zIndex: N` style | Use `elevation` for Android shadow ordering. |
| `gap-*`, `gap-x-*`, `gap-y-*` | Works on `<View>` with flex parent | **Use these instead of `space-x-*` / `space-y-*`.** |
| `space-x-*` / `space-y-*` | **Doesn't work in NativeWind** | These rely on CSS adjacent-sibling selectors which RN doesn't support. Replace every `space-x-4` with `gap-4` on the parent. |
| `divide-x` / `divide-y` | **Doesn't work** | Same reason. Insert explicit `<View className="w-px bg-border" />` separators or use a `<Divider />`. |
| `prose`, `prose-*` (typography plugin) | Not supported | Replace with explicit `<Text variant="…">`. |
| `:hover` | Drop | No hover on mobile. |
| `:focus` | Works on TextInput | Skip elsewhere. |
| `active:bg-…` / `active:scale-…` | Works on Pressable | Use for tactile press feedback (e.g. `active:scale-95 active:opacity-80`). |
| `cursor-pointer` | Drop | No cursor. |
| `transition-*` / `duration-*` / `ease-*` | **Doesn't work in NativeWind** | Use `react-native-reanimated` (`useSharedValue` + `useAnimatedStyle`) for any animation. |
| `transform: rotate / scale / translate` | NativeWind v4 supports `rotate-45`, `scale-95`, `translate-x-2` | Static transforms work; animated transforms drop into Reanimated. |
| `backdrop-blur-*` | `<BlurView>` from `expo-blur` | NativeWind has no backdrop-blur. |
| `bg-gradient-to-r from-… to-…` | `<LinearGradient>` from `expo-linear-gradient` | **No CSS gradients in RN.** Replace every gradient with `<LinearGradient colors={['#a','#b']} start={…} end={…}>`. |
| `shadow-*` | `shadow-sm` / `md` / `lg` work iOS, partial Android | For full Android parity, set `elevation` directly. |
| `aspect-video`, `aspect-square` | NativeWind v4 supports | Use directly. |
| `w-screen` / `h-screen` | `w-full` / `h-full` or `flex-1` | `screen` units are web-only. |
| `min-h-screen` | `flex-1` on the Screen wrapper | |
| `overflow-hidden` | Works | But `overflow: visible` may not respect shadows on Android. |
| `text-ellipsis`, `truncate` | `<Text numberOfLines={1}>` | NativeWind's `truncate` is unreliable; the prop is canonical. |
| `select-none` / `select-text` | Drop / use the `selectable` prop on `<Text>` | No text selection on mobile by default. |
| `whitespace-nowrap` | `<Text numberOfLines={1}>` or fixed-width parent | |

---

## Color remap during conversion

Stitch outputs default Tailwind palette colors. We remap to our brand tokens:

| Stitch (raw Tailwind) | Our token |
|---|---|
| `bg-orange-500` | `bg-brand-500` |
| `bg-blue-500` | `bg-accent-500` |
| `bg-white` | `bg-surface` |
| `bg-gray-50` | `bg-bg` |
| `border-gray-200` | `border-border` |
| `text-gray-900` | `text-ink` |
| `text-gray-500` | `text-muted` |
| `text-green-600` | `text-success` / `text-tierRight` |
| `text-yellow-600` | `text-warning` / `text-tierClose` |
| `text-red-600` | `text-danger` / `text-tierWrong` |

Brand tokens are placeholder until Phase 8 polish; semantic tokens (`bg`, `surface`, `border`, `ink`, `muted`) are stable.

---

## Fonts

- Load custom fonts with `expo-font` and register in `app/_layout.tsx`.
- Tailwind `font-family` mapping lives in `tailwind.config.ts` (`fontFamily.sans`, `display`, `cyrillic`, `mono`).
- **Gotcha:** RN does not fall back gracefully on missing weights. Load every weight you reference via className.

---

## Forms

- 1-field forms (most lesson interactions): plain `useState` + `<TextInput>` + button onPress.
- 2+ field forms: `react-hook-form` + `zod` resolver from `@hookform/resolvers/zod`. Wrap `<TextInput>` in a `Controller`.

---

## Animation

- **Default: `react-native-reanimated` v4** (`react-native-worklets` is the runtime; the babel plugin is `react-native-worklets/plugin` — already configured).
- Bottom-tab + route transitions: handled automatically by expo-router.
- For flip / swipe: `react-native-gesture-handler` + Reanimated.
- Avoid the legacy `Animated` API except for trivial cases — Reanimated runs on the UI thread.

---

## Shell usage checklist

When walking through a Stitch HTML top-down:

- Outermost wrapper → `<Screen scroll? safe? header? footer?>`
- Card-like `<div class="rounded-* shadow-* p-*">` → `<Card variant="default|elevated|outlined|ghost">`
- Any `<h*>`, `<p>`, `<span>`, raw text → `<Text variant>`
- Any `<button>` → `<Button label onPress variant size />`
- Tap-a-word patterns → `<WordChip>`
- Cyrillic letter tile → `<CyrillicLetter>`
- Play-audio icon → `<AudioPlayer compact src={...} />` (Phase 5+ stub for now)
- Record / mic icon → `<RecordButton />` (Phase 5+ stub)
- Teacher illustration → `<TeacherAvatar teacherId="…" />`
- Progress bar → `<ProgressBar value={…} />`
- "X% to fluency" indicator → `<ParetoProgress currentRank targetRank language />`
- Streak indicator → `<StreakBadge days />`
- Front/back flip card → `<FlashCard front back />`
- Grammar drill picker → `<CaseEndingPicker stem options correct caseHint onAnswer />`
- Cross-language compare panel → `<CompareLanguagesPanel conceptEnglish variants currentLanguage />`
- Lesson wrapper (prompt + interaction + feedback) → `<LessonStep>`

**If a needed pattern has NO shell, stop and propose adding one** to `src/components/`. Don't one-off it in a screen file — that's how shell libraries rot.
