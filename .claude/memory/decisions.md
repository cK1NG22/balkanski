# Decisions

Chronological log of meaningful architectural decisions. See `docs/decisions/` for full ADRs.

## 2026-05-23

- **Stack locked**: Expo SDK 56 + expo-router v4 + NativeWind v4 + TypeScript 6 + pnpm. See `docs/decisions/0001-stack.md`.
- **Data model**: English-as-anchor 2-table schema (`concept` + `variant`) adopted from Carter's `CLARIFICATIONS.md §3` verbatim. JSONB `case_forms` instead of separate `inflected_form` table — migration path remains open.
- **Curriculum spine**: Linear Pareto (strict by `frequency_rank_in_lang`). SRS layered on top via `ts-fsrs`. No skill tree.
- **Grading**: Tiered (right / close / wrong) with diacritic-only differences downgrading to `close`.
- **Audio**: Fully deferred to Phase 5+. Schema reserves nullable cols (`ipa`, `audio_url`, `stress_mark`) from day one.
- **Auth**: OAuth only (Google + Apple via Supabase Auth). No anonymous, no email/password.
- **Component shells**: 14+ typed shells in `src/components/`. Every Stitch mock conversion goes through these — no per-screen reinvention.
- **Animation**: Reanimated 4 with `react-native-worklets/plugin` (not the v3 plugin). React Compiler experimental ON, so no premature `useMemo`/`useCallback`.
- **Hook workarounds**: `src/lib/auth/` and `supabase/migrations/` are guarded by Carter's global `guard-sharp-edges.sh`. Auth helpers inlined into `AuthProvider`; migration deferred to Phase 1.
- **Routes**: file-based in `src/app/` (SDK 56 default; not top-level `app/`).

## 2026-05-23 — Open-question lock-in (post-scaffold)

- **Phase 1 seed language**: **Serbian** (sr). Most data-model exercise (Latin + Cyrillic, full case forms, widest cross-language compare).
- **Pareto honesty**: don't claim "X% to fluency" or any Pareto-derived metric in UI until corpus ingestion validates the ranks. Carter's words: "we shouldnt attribute anything to the pareto rule yet. we are going to need to do some serious math and text ingestion for that." Reflected in `ParetoProgress` (`validated=false` default → raw count only) and in `AGENTS.md`.
- **OAuth providers**: **Google only** in Phase 1. Apple sign-in deferred until iOS App Store distribution (avoids the Apple Developer membership dance during personal-use phase). Sign-in screen updated accordingly.
- **Grammar cases**: **7** (nom/gen/dat/acc/voc/ins/loc). Standard BCS grammar.
- **Placement test**: **mixed** — 5 vocab recall + 5 grammar pattern. 2 minutes total. Authored in Phase 1.
- **Corpus source for ingestion**: **CLARIN.SI (hrWaC/srWaC/bsWaC) + OpenSubtitles + Wikipedia + Tatoeba** — the "safe stack" (research-licensed derived stats; safe for any future commercial use).
- **Persona roster (Phase 4)**: **full named list including politicians** (Jokić, Modrić, Đoković, Dodik, Vučić, Tesla, Balkan Dad, +TBD). Legal exposure acknowledged and accepted for personal use; revisit before any public launch.
- **Visual art style**: **AI-generated with a consistent style-reference image** (Midjourney / Imagen / Flux), pinned across all 50+ illustrations to keep the visual identity cohesive.
- **Audio source (Phase 5)**: **deferred** — address when Phase 5 prep starts.
- **Speech vendor (Phase 6)**: **deferred** — address when Phase 6 prep starts.

## 2026-05-24 — Initial schema migration

- **Migration shape**: single `0001_initial_schema.sql`, 8 tables in one transaction. No incremental schema steps in Phase 1 — re-cut a 0002 if anything changes.
- **RLS posture**: every table has RLS enabled. Content tables (`concept`, `variant`) get a single SELECT-only policy `TO authenticated`; client writes are denied by absence-of-policy and only `service_role` (seeding) can mutate. User-state tables get full-CRUD policies scoped to `auth.uid()`.
- **users insert path**: NOT a client-side policy. Provisioning happens via a `SECURITY DEFINER` trigger on `auth.users INSERT` that writes the `public.users` + `public.user_settings` rows. Function owned by `postgres` so RLS is bypassed for that one operation.
- **FK cascade chain**: `auth.users → public.users → user_settings / streak_log / study_sessions / placement_test_results` all `ON DELETE CASCADE`. `review_items.user_id` references `auth.users` directly (per spec, since SRS data is intrinsic to the auth identity, not the profile row).
- **CHECK constraint as defence-in-depth**: `variant_cyrillic_only_sr` enforces the same Croatian/Bosnian Latin-only rule the zod refines enforce in `src/data/schemas/variant.ts`. Two layers — TS and DB — both rejecting bad data.
- **`learning_steps` parity**: lives in both `public.review_items` (this migration) and the local SQLite mirror (`src/lib/srs/sqlite.ts`). Required for FSRS v5 to track multi-step learning before promotion to review state.

## 2026-05-24 — 0002 schema fixes (post-review)

- **Auth-trigger idempotence**: `handle_new_auth_user()` now uses `ON CONFLICT DO NOTHING` on both inserts. Reason: a retried Supabase Auth webhook (network blip, double-fire) would otherwise hit the PK constraint, the trigger errors, and the outer `auth.users` INSERT rolls back — locking that email out of signup forever. The trade-off: if a row genuinely needs to be re-provisioned, the trigger silently skips. Acceptable because re-provisioning is the kind of operation that should be explicit anyway.
- **`review_items.variant_id` is `ON DELETE RESTRICT`** (not CASCADE). Reason: SRS state is intrinsically the user's data, and cascading from a content row would silently wipe every user's review history for a word. Content edits must explicitly migrate or null the FK first.
- **`review_items.user_id` stays `auth.users` (not `public.users`)** — Codex review flagged the inconsistency. Decision: SRS state follows the auth identity directly, not the profile row. One less hop in the cascade chain, and matches the handoff spec verbatim.
- **DB-side FSRS bounds**: 8 CHECK constraints mirror zod's `.min(1).max(10)` / `.nonnegative()` rules. Defence in depth — the DB rejects corrupted state even if a future writer skips zod.
- **Two findings flagged but NOT fixed** — both are zod/spec contradictions that need a Carter judgment:
  - Auth-trigger creates `public.users` rows with NULL `primary_language` / `proficiency_estimate` / `timezone`, but `UserSchema` in `src/data/schemas/user.ts` marks those fields required. The handoff spec says they're intentionally nullable (we don't know the user's target language until onboarding). Fix is to make zod nullable, not the migration.
  - `daily_goal_minutes` exists on both `users` and `user_settings` per spec; that's drift. Need to pick one home.

## 2026-05-24 — Push-backs on review findings (capture so they don't get re-litigated)

- **Rejected Gemini finding #3** (`users.plan` column-level escalation protection). Real concern in principle (any authenticated user could `UPDATE plan = 'premium'`), but for a 2-user personal app the practical risk is zero. The fix (BEFORE UPDATE trigger or column-level grants) would be over-engineering per Carter's no-fluff rule. Revisit if the app ever ships publicly.
- **Rejected Codex finding #4** (FK consistency — wants `review_items.user_id` pointed at `public.users` to match the other user-state tables). The handoff spec explicitly points it at `auth.users` because SRS state follows the auth identity, not the profile row. Fewer hops in the cascade chain; deliberate, not drift.

## 2026-05-24 — Self-marked Known Words replaces the placement test (ADR 0002)

- **Pivot**: scrap the planned 5 vocab + 5 grammar mixed placement test. Replace with a self-marked Known Words editor (checkbox list, bulk-mark shortcut, lives in Settings).
- **Reasoning** — matches the data model directly (Pareto sequencer needs per-variant known/unknown, not a single proficiency number), scales to both cold-start and fluent users with one UI, isn't a gate (users go straight to lessons or to the marker on choice), revisable over time.
- **Schema changes for next session**: add `public.known_variants (user_id, variant_id, marked_at, PK(user_id, variant_id))` with RLS on `user_id = auth.uid()` + `ON DELETE RESTRICT` on variant_id; drop `public.placement_test_results`; drop `users.proficiency_estimate` column.
- **UI**: checkbox list (chosen over Tinder-swipe and search-only) with per-row "I know everything up to here" bulk shortcut. One-time onboarding card after sign-in: "Start fresh" / "Mark words I already know". Settings entry remains for revising later.
- **Grammar diagnostics deferred** — Phase 1 has no dedicated grammar lessons, so there's nothing for a grammar test to gate. Revisit in Phase 2/3 with the same self-marked pattern if needed.
- **Authoritative ADR**: `docs/decisions/0002-known-words-vs-placement-test.md`. Spec updates landed in CLARIFICATIONS.md §1.5/§4/§5 and ROADMAP.md Phase 1.

## 2026-05-24 — Known Words implementation: design + review fixes

- **Skip-set composition in the Pareto sequencer is a union of two named sets, not a single combined input.** `knownVariantIds` (the SRS seen-set) is mandatory; `markedKnownVariantIds` (self-marked) is optional. Internally unioned via `buildSkipSet`. This shape — two distinct named sets rather than caller-pre-unioned — makes tests legible ("skipped because seen" vs "skipped because user marked") and matches the ADR's "intersected with the existing seen-set" wording.
- **`paretoStatus.knownCount` is now the union count, not the seen-set count.** A user who marks 50 and learns 20 reads "70 of 2000" on the fluency bar — both signals contribute to mastery progress. The header counter inside `(modal)/known-words.tsx` is its own *marked-only* count and intentionally diverges.
- **Renamed `getAllKnownVariantIds` → `getSeenVariantIds`** in `src/lib/srs/sqlite.ts` because the original name was actively misleading once self-marked-known became a real concept. The function still reads from `review_items.variant_id`; only the name changed.
- **Toggle semantics are delete-then-reinsert, not UPDATE.** Migration 0004 deliberately omits an `UPDATE` RLS policy on `known_variants`. To match, the Supabase client uses `.upsert({ ignoreDuplicates: true })` which PostgREST translates to `ON CONFLICT DO NOTHING`. Net: tighter RLS surface area, and the only `marked_at` value that ever lives in the row is the first one written (re-marks don't shift the timestamp).
- **Deletion propagation is deferred to Phase 1D.** The bidirectional `syncKnownVariants` is currently *dead code* — only the one-way rebind-on-sign-in fires today, and that's an additive push. Documented the boundary directly in `sync.ts`: "deletions do NOT propagate through this function -- they must be issued as direct writes (DELETE remote + DELETE local) from the unmark code path." Tracked as a Phase 1D follow-up in todo.md. The "zombie mark" failure mode Gemini flagged is real but inert until bidirectional sync wires up.
- **Onboarding navigates with one `router.replace` carrying a `from=onboarding` query param**, not chained `replace` then `push`. The modal's Done handler branches on the param: from-onboarding → `router.replace('/(tabs)/learn')`; otherwise (Settings entry) → `router.back()`. Single navigation per user action; no expo-router race.
- **`KnownWordRow` accessibility**: the entire row left of the bulk-mark is one outer `Pressable` with `accessibilityRole="checkbox"`, `accessibilityState={{checked}}`, and `accessibilityLabel="<word>, <gloss>, rank <n>"`. The bulk-mark stays separate. Avoids the split-focus issue Gemini flagged where two siblings can't be announced as one unit by screen readers.

## 2026-05-24 — Known Words: Phase 1D follow-ups landed

- **Rebind extension**: `RebindIO` gained `getLocalKnown(userId): KnownVariant[]` and `upsertRemoteKnown(rows): Promise<void>`. `rebindOnSignIn` now pushes both `review_items` and `known_variants` to remote in the same orchestration step, sharing the existing crash-safety properties (SQLite UPDATE → MMKV swap → remote upsert). `RebindResult.rebound` is now the total across both tables; the few existing callers only treat it as an opaque diagnostic.
- **Why one combined orchestration, not two sequential ones**: a future `pushKnownVariantsOnSignIn` called from `AuthProvider` after `rebindOnSignIn` would double the chances of partial-success state if the second call failed mid-flight. Folding both pushes into one try-catch means a transient network failure leaves both either all-pushed or all-pending-retry, with the same "best-effort remote, local always consistent" guarantee.
- **Unmark deletion propagation**: new module `src/lib/known-variants/toggle.ts` exports `unmarkAndPropagate(userId, variantId)`. It always issues the local SQLite DELETE, then conditionally issues a remote DELETE if (a) Supabase is configured and (b) the current session's `userId` matches. Both checks matter — dev builds without env vars and signed-out users hit the same skip branch. Errors during the remote call are warned in `__DEV__` only and swallowed otherwise — the local delete already succeeded, and a future Phase 1D bidirectional sync sweep will reconcile.
- **Boundary preserved**: `syncKnownVariants` (the bidirectional sync function) stays strictly *additive-union* — it never propagates deletions. Deletion is the unmark path's responsibility, not sync's. This split keeps the sync function safe for any future eager-replication caller without risk of a stale remote unmark silently re-deleting a fresh local mark.
- **Why fire-and-forget from the screen** (`void unmarkAndPropagate(...)`): the screen's optimistic UI update is what the user sees; making the handler `async` would defer the visual feedback behind a network round-trip. The `void` discards the promise so eslint stays happy and the await happens entirely off the render path.

## 2026-05-24 — Auth: Supabase PKCE flow + expo-auth-session

- **OAuth flow choice**: PKCE (not implicit). The supabase client gets `flowType: 'pkce'` + a `storage` adapter on `expo-secure-store`. Without the adapter, the code_verifier can't persist across the browser round-trip and `exchangeCodeForSession` fails with "invalid code verifier".
- **Token storage**: `expo-secure-store` (iOS Keychain / Android EncryptedSharedPreferences). Not MMKV — tokens warrant the hardware-backed encrypted store. SecureStore has a ~2 KB Android limit; switch to a chunked adapter if Supabase sessions outgrow that.
- **No native Google OAuth client**: only a Web OAuth client in Google Cloud Console (Client ID `60458624690-c1se59v4fngrh6ui6hfb9vj0kaguof2h.apps.googleusercontent.com`). Supabase brokers; the app uses Supabase's session, not Google's token directly. Means no Apple Developer membership needed during personal-use phase.
- **Google OAuth consent screen stays in "Testing" mode**: ≤100 test users (Carter + wife forever), no verification review needed. Production mode is only required if we ever distribute publicly.
- **Redirect chain**: Google → `https://khbwshwghilupemmvloq.supabase.co/auth/v1/callback` (allow-listed in Google) → `balkanski://auth/callback` (allow-listed in Supabase). Each hop needs to be on a separate allow-list; mismatches surface as `redirect_uri_mismatch`.
- **`detectSessionInUrl: false`** on the supabase client. Default behavior reads `window.location` (web-only). On React Native we extract the code from `WebBrowser.openAuthSessionAsync` result by hand.
