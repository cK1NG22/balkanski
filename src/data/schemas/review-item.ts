import { z } from 'zod';

export const ReviewDirectionSchema = z.enum([
  'recognize',
  'produce',
  'audio_recognize',
  'script_convert',
]);
export type ReviewDirection = z.infer<typeof ReviewDirectionSchema>;

export const ReviewStateSchema = z.enum(['new', 'learning', 'review', 'relearning']);
export type ReviewState = z.infer<typeof ReviewStateSchema>;

export const ReviewItemSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  variantId: z.string().uuid(),
  direction: ReviewDirectionSchema,
  stability: z.number().nonnegative(),
  difficulty: z.number().min(1).max(10),
  elapsedDays: z.number().nonnegative(),
  scheduledDays: z.number().nonnegative(),
  learningSteps: z.number().int().nonnegative(),
  reps: z.number().int().nonnegative(),
  lapses: z.number().int().nonnegative(),
  state: ReviewStateSchema,
  lastReview: z.string().datetime().nullable(),
  dueAt: z.string().datetime(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;
