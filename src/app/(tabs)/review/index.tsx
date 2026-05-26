import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';

import { Button, Card, FlashCard, GradingButtonRow, Screen, Text } from '@/components';
import type { GradingTier } from '@/data/schemas/grading';
import type { Variant } from '@/data/schemas/variant';
import { useReviewQueue, type ReviewQueueRow } from '@/hooks/use-review-queue';
import { storage, storageKeys } from '@/lib/storage/mmkv';

type ScriptPref = 'latin' | 'cyrillic';

// Mirrors the pickScripts contract in (modal)/lesson-active.tsx. SR has both
// spellings; HR/BS guarantee cyrillicSpelling===null via VariantSchema, so
// `alternate` is empty and the secondary line collapses.
function pickVariantScripts(variant: Variant, pref: ScriptPref): { primary: string; alternate: string } {
  const cyr = variant.cyrillicSpelling;
  if (pref === 'cyrillic' && cyr) {
    return { primary: cyr, alternate: variant.latinSpelling };
  }
  return { primary: variant.latinSpelling, alternate: cyr ?? '' };
}

export default function ReviewHome() {
  const { queue, grade, refresh } = useReviewQueue();
  const [flipped, setFlipped] = useState(false);
  const current: ReviewQueueRow | undefined = queue[0];
  const scriptPref = (storage.getString(storageKeys.serbianScriptPref) ?? 'latin') as ScriptPref;
  const scripts = current ? pickVariantScripts(current.variant, scriptPref) : null;

  // Cards graded elsewhere (lesson modal) become due in this tab silently.
  // Re-fetch the queue every time the tab regains focus.
  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const onGrade = (tier: GradingTier) => {
    if (!current) return;
    grade(current.item, tier);
    setFlipped(false);
  };

  return (
    <Screen scroll>
      <View className="gap-4 pb-6">
        <Text variant="h1">Review</Text>
        <Text variant="body" color="muted">
          Spaced-repetition queue (FSRS) — past-learned words that are due now.
        </Text>

        {queue.length === 0 ? (
          <Card variant="outlined">
            <Text variant="caption" color="muted">
              Nothing to review yet. Complete a lesson to start building the queue.
            </Text>
          </Card>
        ) : (
          <>
            <Card variant="outlined">
              <Text variant="caption" color="muted">
                {queue.length} item{queue.length === 1 ? '' : 's'} due
              </Text>
            </Card>

            {current && scripts ? (
              <View className="gap-4">
                <FlashCard
                  flipped={flipped}
                  onFlip={setFlipped}
                  className="min-h-[280px] border-2 border-border shadow-md"
                  front={
                    <View className="items-center gap-3">
                      <Text variant="label" color="accent">
                        Serbian
                      </Text>
                      <Text variant="display">{scripts.primary}</Text>
                      {scripts.alternate ? (
                        <Text variant="label" className="text-brand-500">
                          {scripts.alternate}
                        </Text>
                      ) : null}
                      <Text variant="caption" color="muted">
                        Tap to reveal
                      </Text>
                    </View>
                  }
                  back={
                    <View className="items-center gap-3 rounded-card bg-accent-500 p-6">
                      <Text variant="label" color="inverse">
                        {current.concept.partOfSpeech}
                      </Text>
                      <Text variant="display" color="inverse">
                        {current.concept.englishTranslation}
                      </Text>
                    </View>
                  }
                />

                <Button
                  label={flipped ? 'Hide meaning' : 'Show meaning'}
                  variant="secondary"
                  onPress={() => setFlipped((v) => !v)}
                  fullWidth
                />

                {flipped ? <GradingButtonRow onGrade={onGrade} /> : null}
              </View>
            ) : null}
          </>
        )}
      </View>
    </Screen>
  );
}
