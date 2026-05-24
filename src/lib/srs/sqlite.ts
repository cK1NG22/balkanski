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

/** Lazily open the review-queue DB and ensure its schema exists. */
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

export function getDueItems(userId: string, now: Date = new Date()): ReviewItem[] {
  const rows = getReviewQueueDb().getAllSync<Row>(
    `SELECT * FROM review_items
       WHERE user_id = ? AND due_at <= ?
       ORDER BY due_at ASC`,
    [userId, now.toISOString()],
  );
  return rows.map(rowToItem);
}

export function getAllKnownVariantIds(userId: string): Set<string> {
  const rows = getReviewQueueDb().getAllSync<{ variant_id: string }>(
    'SELECT DISTINCT variant_id FROM review_items WHERE user_id = ?',
    [userId],
  );
  return new Set(rows.map((r) => r.variant_id));
}
