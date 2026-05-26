// expo-sqlite mirror of the review queue.
//
// Why local SQLite at all (with no backend yet)?
// - The Pareto sequencer needs to know "which variants has the user seen?"
//   and the FSRS scheduler needs to know "which review items are due now?"
//   Both queries are local-first by design.
// - Once Supabase lands in Phase 1C, this layer becomes the offline mirror
//   under a last-write-wins sync. Storing the canonical state in SQLite
//   from day one means we don't have to migrate it later.
//
// Cannot be unit-tested in jest — `expo-sqlite` requires the native module.
// The pure-logic counterparts (`queue.ts`) carry the test coverage.

import * as SQLite from 'expo-sqlite';

import type {
  ReviewDirection,
  ReviewItem,
  ReviewState,
} from '@/data/schemas/review-item';

const DB_NAME = 'balkanski.db';

let _db: SQLite.SQLiteDatabase | null = null;

/** Lazily open the local SRS DB and ensure its schema exists. */
function getReviewQueueDb(): SQLite.SQLiteDatabase {
  if (_db) return _db;
  _db = SQLite.openDatabaseSync(DB_NAME);
  _db.execSync(`
    CREATE TABLE IF NOT EXISTS review_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      direction TEXT NOT NULL,
      stability REAL NOT NULL,
      difficulty REAL NOT NULL,
      elapsed_days REAL NOT NULL,
      scheduled_days REAL NOT NULL,
      learning_steps INTEGER NOT NULL DEFAULT 0,
      reps INTEGER NOT NULL,
      lapses INTEGER NOT NULL,
      state TEXT NOT NULL,
      last_review TEXT,
      due_at TEXT NOT NULL,
      UNIQUE(user_id, variant_id, direction)
    );
    CREATE INDEX IF NOT EXISTS review_items_due_idx
      ON review_items(user_id, due_at);

    CREATE TABLE IF NOT EXISTS known_variants (
      user_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      marked_at TEXT NOT NULL,
      PRIMARY KEY (user_id, variant_id)
    );
    CREATE INDEX IF NOT EXISTS known_variants_user_idx
      ON known_variants(user_id);
  `);
  return _db;
}

interface Row {
  id: string;
  user_id: string;
  variant_id: string;
  direction: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: string;
  last_review: string | null;
  due_at: string;
}

function rowToItem(r: Row): ReviewItem {
  return {
    id: r.id,
    userId: r.user_id,
    variantId: r.variant_id,
    direction: r.direction as ReviewDirection,
    stability: r.stability,
    difficulty: r.difficulty,
    elapsedDays: r.elapsed_days,
    scheduledDays: r.scheduled_days,
    learningSteps: r.learning_steps,
    reps: r.reps,
    lapses: r.lapses,
    state: r.state as ReviewState,
    lastReview: r.last_review,
    dueAt: r.due_at,
  };
}

export function getReviewItem(
  userId: string,
  variantId: string,
  direction: ReviewDirection,
): ReviewItem | null {
  const row = getReviewQueueDb().getFirstSync<Row>(
    'SELECT * FROM review_items WHERE user_id = ? AND variant_id = ? AND direction = ?',
    [userId, variantId, direction],
  );
  return row ? rowToItem(row) : null;
}

export function upsertReviewItem(item: ReviewItem): void {
  getReviewQueueDb().runSync(
    `INSERT INTO review_items
       (id, user_id, variant_id, direction,
        stability, difficulty, elapsed_days, scheduled_days, learning_steps,
        reps, lapses, state, last_review, due_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id, variant_id, direction) DO UPDATE SET
       stability = excluded.stability,
       difficulty = excluded.difficulty,
       elapsed_days = excluded.elapsed_days,
       scheduled_days = excluded.scheduled_days,
       learning_steps = excluded.learning_steps,
       reps = excluded.reps,
       lapses = excluded.lapses,
       state = excluded.state,
       last_review = excluded.last_review,
       due_at = excluded.due_at`,
    [
      item.id, item.userId, item.variantId, item.direction,
      item.stability, item.difficulty, item.elapsedDays, item.scheduledDays,
      item.learningSteps, item.reps, item.lapses, item.state, item.lastReview,
      item.dueAt,
    ],
  );
}

export interface GetDueItemsOpts {
  /** Restrict to one direction. Omit to return all directions. */
  direction?: ReviewDirection;
  now?: Date;
}

export function getDueItems(
  userId: string,
  opts: GetDueItemsOpts = {},
): ReviewItem[] {
  const now = opts.now ?? new Date();
  const rows = opts.direction
    ? getReviewQueueDb().getAllSync<Row>(
        `SELECT * FROM review_items
           WHERE user_id = ? AND due_at <= ? AND direction = ?
           ORDER BY due_at ASC`,
        [userId, now.toISOString(), opts.direction],
      )
    : getReviewQueueDb().getAllSync<Row>(
        `SELECT * FROM review_items
           WHERE user_id = ? AND due_at <= ?
           ORDER BY due_at ASC`,
        [userId, now.toISOString()],
      );
  return rows.map(rowToItem);
}

/**
 * Variants the user has been graded on at least once (i.e. has a review_items row).
 * Pareto sequencer input #1: "skip what's already in the SRS queue".
 *
 * Pass `direction` to scope the seen-set to one FSRS lane (recognize OR produce).
 * Without it, recognize-completed words would hide from produce lessons and
 * vice versa, defeating the `(user, variant, direction)` UNIQUE that lets the
 * two schedules coexist for the same word.
 *
 * NOTE: this is the "seen-set", not the self-marked-known set. Self-marking
 * (`known_variants`) is intentionally direction-independent — a user who says
 * "I know this word" means it in both directions.
 */
export function getSeenVariantIds(
  userId: string,
  direction?: ReviewDirection,
): Set<string> {
  const rows = direction
    ? getReviewQueueDb().getAllSync<{ variant_id: string }>(
        'SELECT DISTINCT variant_id FROM review_items WHERE user_id = ? AND direction = ?',
        [userId, direction],
      )
    : getReviewQueueDb().getAllSync<{ variant_id: string }>(
        'SELECT DISTINCT variant_id FROM review_items WHERE user_id = ?',
        [userId],
      );
  return new Set(rows.map((r) => r.variant_id));
}

/** Get every review item for a user — used by the first-sign-in rebind to push local state to remote. */
export function getAllReviewItemsForUser(userId: string): ReviewItem[] {
  const rows = getReviewQueueDb().getAllSync<Row>(
    'SELECT * FROM review_items WHERE user_id = ?',
    [userId],
  );
  return rows.map(rowToItem);
}

/** Rebind every local row (review_items + known_variants) from oldId to newId. Idempotent — running twice is a no-op on the second pass. */
export function rebindUserIdInSqlite(oldId: string, newId: string): void {
  if (oldId === newId) return;
  const db = getReviewQueueDb();
  db.runSync(
    'UPDATE review_items SET user_id = ? WHERE user_id = ?',
    [newId, oldId],
  );
  // known_variants rebinds the same way. ON CONFLICT keeps the existing
  // (newId, variant_id) row if both ids already had a mark for the same
  // variant -- the user's intent ("I know this") is preserved either way.
  db.runSync(
    `INSERT INTO known_variants (user_id, variant_id, marked_at)
       SELECT ?, variant_id, marked_at FROM known_variants WHERE user_id = ?
       ON CONFLICT(user_id, variant_id) DO NOTHING`,
    [newId, oldId],
  );
  db.runSync('DELETE FROM known_variants WHERE user_id = ?', [oldId]);
}

// =============================================================================
// known_variants helpers — self-marked "I already know this word" set.
// Authoritative design: docs/decisions/0002-known-words-vs-placement-test.md
// =============================================================================

interface KnownRow {
  user_id: string;
  variant_id: string;
  marked_at: string;
}

/** All variant ids the user has self-marked as known. */
export function getMarkedKnownVariantIds(userId: string): Set<string> {
  const rows = getReviewQueueDb().getAllSync<{ variant_id: string }>(
    'SELECT variant_id FROM known_variants WHERE user_id = ?',
    [userId],
  );
  return new Set(rows.map((r) => r.variant_id));
}

/** Did the user already mark this variant as known? */
export function isVariantMarkedKnown(userId: string, variantId: string): boolean {
  const row = getReviewQueueDb().getFirstSync<KnownRow>(
    'SELECT * FROM known_variants WHERE user_id = ? AND variant_id = ?',
    [userId, variantId],
  );
  return row !== null;
}

/** Mark a variant as known. Idempotent — a second call is a no-op. */
export function markVariantKnown(
  userId: string,
  variantId: string,
  now: Date = new Date(),
): void {
  getReviewQueueDb().runSync(
    `INSERT INTO known_variants (user_id, variant_id, marked_at)
       VALUES (?, ?, ?)
       ON CONFLICT(user_id, variant_id) DO NOTHING`,
    [userId, variantId, now.toISOString()],
  );
}

/** Mark many variants as known in one transaction. Used by "I know up to here". */
export function markVariantsKnown(
  userId: string,
  variantIds: readonly string[],
  now: Date = new Date(),
): void {
  if (variantIds.length === 0) return;
  const db = getReviewQueueDb();
  const ts = now.toISOString();
  db.withTransactionSync(() => {
    for (const variantId of variantIds) {
      db.runSync(
        `INSERT INTO known_variants (user_id, variant_id, marked_at)
           VALUES (?, ?, ?)
           ON CONFLICT(user_id, variant_id) DO NOTHING`,
        [userId, variantId, ts],
      );
    }
  });
}

/** Unmark a variant. Used by the row checkbox toggle off. */
export function unmarkVariantKnown(userId: string, variantId: string): void {
  getReviewQueueDb().runSync(
    'DELETE FROM known_variants WHERE user_id = ? AND variant_id = ?',
    [userId, variantId],
  );
}

/** Every known_variants row for a user — used by sync to push local state to remote. */
export function getAllKnownVariantsForUser(userId: string): KnownRow[] {
  return getReviewQueueDb().getAllSync<KnownRow>(
    'SELECT * FROM known_variants WHERE user_id = ?',
    [userId],
  );
}
