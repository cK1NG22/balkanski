import { z } from 'zod';

import { LanguageSchema } from './variant';

export const ScriptPrefSchema = z.enum(['latin', 'cyrillic']);
export type ScriptPref = z.infer<typeof ScriptPrefSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().nullable(),
  // Nullable until onboarding picks a language and the placement test runs.
  // The auth-trigger creates the row with these as NULL; loader code must
  // gate any Pareto/SRS work on a non-null primaryLanguage.
  primaryLanguage: LanguageSchema.nullable(),
  proficiencyEstimate: z.number().int().min(0).nullable(),
  timezone: z.string().nullable(),
  serbianScriptPref: ScriptPrefSchema.default('latin'),
  dailyGoalMinutes: z.number().int().positive().default(5),
  plan: z.literal('free').default('free'),
});
export type User = z.infer<typeof UserSchema>;
