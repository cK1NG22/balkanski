import { z } from 'zod';

import { LanguageSchema } from './variant';

export const ScriptPrefSchema = z.enum(['latin', 'cyrillic']);
export type ScriptPref = z.infer<typeof ScriptPrefSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime().nullable(),
  primaryLanguage: LanguageSchema,
  proficiencyEstimate: z.number().int().min(0),
  serbianScriptPref: ScriptPrefSchema.default('latin'),
  dailyGoalMinutes: z.number().int().positive().default(5),
  timezone: z.string().default('UTC'),
  plan: z.literal('free').default('free'),
});
export type User = z.infer<typeof UserSchema>;
