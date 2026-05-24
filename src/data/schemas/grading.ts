import { z } from 'zod';

export const GradingTierSchema = z.enum(['right', 'close', 'wrong']);
export type GradingTier = z.infer<typeof GradingTierSchema>;

export const GradingResultSchema = z.object({
  tier: GradingTierSchema,
  correction: z.string().nullable(),
  missedDiacritics: z.array(z.string()).default([]),
  editDistance: z.number().int().nonnegative(),
});
export type GradingResult = z.infer<typeof GradingResultSchema>;
