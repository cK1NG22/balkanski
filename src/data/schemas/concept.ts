import { z } from 'zod';

export const PartOfSpeechSchema = z.enum([
  'noun',
  'verb',
  'adjective',
  'adverb',
  'preposition',
  'pronoun',
  'conjunction',
  'interjection',
  'numeral',
  'phrase',
  'particle',
]);
export type PartOfSpeech = z.infer<typeof PartOfSpeechSchema>;

export const ConceptSchema = z.object({
  id: z.string().uuid(),
  englishLemma: z.string().min(1),
  englishTranslation: z.string().min(1),
  partOfSpeech: PartOfSpeechSchema,
  senseDisambiguator: z.string().nullable(),
  topicTags: z.array(z.string()).default([]),
  frequencyRankAggregate: z.number().int().positive().nullable(),
});
export type Concept = z.infer<typeof ConceptSchema>;
