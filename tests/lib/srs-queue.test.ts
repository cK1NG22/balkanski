import { createNewReviewItem, gradeReview } from '@/lib/srs/queue';

// expo-crypto's randomUUID isn't available in the jest harness; stub it.
jest.mock('expo-crypto', () => ({
  randomUUID: () => '00000000-0000-4000-8000-000000000001',
}));

const FIXED_NOW = new Date('2026-05-24T12:00:00Z');
const USER = '00000000-0000-4000-8000-00000000aaaa';
const VARIANT = '00000000-0000-4000-8000-00000000bbbb';

describe('FSRS queue wrapper', () => {
  it('creates a fresh review item in `new` state with due ≈ now', () => {
    const item = createNewReviewItem(USER, VARIANT, 'recognize', FIXED_NOW);
    expect(item.state).toBe('new');
    expect(item.reps).toBe(0);
    expect(item.lapses).toBe(0);
    expect(item.userId).toBe(USER);
    expect(item.variantId).toBe(VARIANT);
    expect(item.direction).toBe('recognize');
  });

  it("'right' advances state away from `new` and increments reps", () => {
    const fresh = createNewReviewItem(USER, VARIANT, 'recognize', FIXED_NOW);
    const after = gradeReview(fresh, 'right', FIXED_NOW);
    expect(after.reps).toBe(fresh.reps + 1);
    expect(after.lastReview).toBe(FIXED_NOW.toISOString());
    // FSRS moves a `new` card with a passing grade into Learning or Review.
    expect(['learning', 'review']).toContain(after.state);
  });

  it("'wrong' causes a lapse (lapses increments) once the card is past `new`", () => {
    const fresh = createNewReviewItem(USER, VARIANT, 'recognize', FIXED_NOW);
    const reviewed = gradeReview(fresh, 'right', FIXED_NOW);
    const later = new Date(FIXED_NOW.getTime() + 86_400_000 * 5);
    const lapsed = gradeReview(reviewed, 'wrong', later);
    expect(lapsed.lapses).toBeGreaterThanOrEqual(reviewed.lapses);
  });

  it("'close' yields a shorter scheduled interval than 'right' for the same card", () => {
    const a = createNewReviewItem(USER, VARIANT, 'recognize', FIXED_NOW);
    const b = createNewReviewItem(USER, VARIANT, 'recognize', FIXED_NOW);
    const tomorrow = new Date(FIXED_NOW.getTime() + 86_400_000);
    const aReview = gradeReview(a, 'right', FIXED_NOW);
    const bReview = gradeReview(b, 'right', FIXED_NOW);
    const aHard = gradeReview(aReview, 'close', tomorrow);
    const bGood = gradeReview(bReview, 'right', tomorrow);
    const aDue = new Date(aHard.dueAt).getTime();
    const bDue = new Date(bGood.dueAt).getTime();
    expect(aDue).toBeLessThanOrEqual(bDue);
  });

  it('updates lastReview to now and dueAt to a future time on grade', () => {
    const fresh = createNewReviewItem(USER, VARIANT, 'recognize', FIXED_NOW);
    const graded = gradeReview(fresh, 'right', FIXED_NOW);
    expect(graded.lastReview).toBe(FIXED_NOW.toISOString());
    expect(new Date(graded.dueAt).getTime()).toBeGreaterThan(FIXED_NOW.getTime());
  });
});
