# KPIs

## Phase 0 — Scaffold (this session)

- [x] `pnpm install` succeeds without errors
- [x] All directories from the plan exist
- [x] All 14+ shell components written and exported via barrel
- [x] Zod schemas for `concept`, `variant`, `user`, `review-item`, `lesson-pack`, `grading`
- [x] Tiered grading library + unit tests (right/close/wrong, diacritics)
- [x] Linear Pareto sequencer + unit tests
- [x] 20-row schema stress-test script
- [x] All expo-router route placeholders written
- [x] Debug components gallery at `(debug)/components`
- [x] Conversion cheatsheet + workflow recipe + ADR
- [x] AGENTS.md + memory tree set up
- [x] ROADMAP.md + FEATURES.md
- [ ] `pnpm tsc --noEmit` — zero errors (verify in Phase 0 verification step)
- [ ] `pnpm test` — all unit tests green (verify)
- [ ] `pnpm exec tsx scripts/stress-test-schema.ts` — all 20 rows + queries pass (verify)
- [ ] `pnpm start` boots iOS simulator, tabs navigate, gallery renders (verify on Carter's machine)
- [ ] First test Stitch mock converts end-to-end to a working route (verify on first real mock)

## Phase 1 — OAuth + Placement + Pareto MVP

See `ROADMAP.md` for full Phase 1 deliverables.
