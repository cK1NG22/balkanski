import { z } from 'zod';

// known_variants: a (user, variant) set capturing "I already know this word."
// Authoritative design: docs/decisions/0002-known-words-vs-placement-test.md
//
// The natural primary key is (userId, variantId) -- there is no surrogate id,
// because the row is set membership, not an entity with its own identity.

export const KnownVariantSchema = z.object({
  userId: z.string().uuid(),
  variantId: z.string().uuid(),
  markedAt: z.string().datetime(),
});
export type KnownVariant = z.infer<typeof KnownVariantSchema>;
