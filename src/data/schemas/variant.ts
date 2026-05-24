import { z } from 'zod';

export const LanguageSchema = z.enum(['hr', 'sr', 'bs']);
export type Language = z.infer<typeof LanguageSchema>;

export const GrammaticalCaseSchema = z.enum([
  'nom',
  'gen',
  'dat',
  'acc',
  'voc',
  'ins',
  'loc',
]);
export type GrammaticalCase = z.infer<typeof GrammaticalCaseSchema>;

export const CaseFormsSchema = z.object({
  nom: z.string().optional(),
  gen: z.string().optional(),
  dat: z.string().optional(),
  acc: z.string().optional(),
  voc: z.string().optional(),
  ins: z.string().optional(),
  loc: z.string().optional(),
  nomPl: z.string().optional(),
  genPl: z.string().optional(),
  datPl: z.string().optional(),
  accPl: z.string().optional(),
  vocPl: z.string().optional(),
  insPl: z.string().optional(),
  locPl: z.string().optional(),
});
export type CaseForms = z.infer<typeof CaseFormsSchema>;

export const VariantSchema = z
  .object({
    id: z.string().uuid(),
    conceptId: z.string().uuid(),
    language: LanguageSchema,
    regionalTag: z.string().nullable(),
    latinSpelling: z.string().min(1),
    cyrillicSpelling: z.string().nullable(),
    stressMark: z.string().nullable(),
    ipa: z.string().nullable(),
    audioUrl: z.string().url().nullable(),
    frequencyRankInLang: z.number().int().positive(),
    caseForms: CaseFormsSchema.nullable(),
  })
  .refine(
    (v) => v.language !== 'hr' || v.cyrillicSpelling === null,
    { message: 'Croatian variants must not have cyrillicSpelling (Latin only)' }
  )
  .refine(
    (v) => v.language !== 'bs' || v.cyrillicSpelling === null,
    { message: 'Bosnian variants must not have cyrillicSpelling (Latin only in this app)' }
  );
export type Variant = z.infer<typeof VariantSchema>;
