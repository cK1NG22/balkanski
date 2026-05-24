import { z } from 'zod';

import { LanguageSchema } from './variant';

export const LessonPackSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  description: z.string(),
  language: LanguageSchema.nullable(),
  topicTag: z.string(),
  estimatedMinutes: z.number().int().positive(),
  artUrl: z.string().url().nullable(),
});
export type LessonPack = z.infer<typeof LessonPackSchema>;

export const LessonPackItemSchema = z.object({
  packId: z.string().uuid(),
  conceptId: z.string().uuid(),
  order: z.number().int().nonnegative(),
});
export type LessonPackItem = z.infer<typeof LessonPackItemSchema>;
