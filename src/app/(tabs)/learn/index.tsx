import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  Card,
  ParetoProgress,
  Screen,
  StreakBadge,
  TeacherAvatar,
  Text,
} from '@/components';
import { useParetoLesson } from '@/hooks/use-pareto-lesson';
import { useStreak } from '@/hooks/use-streak';
import { selectNextVariants, FLUENCY_TARGET_RANK } from '@/lib/pareto/sequencer';
import { storage, storageKeys } from '@/lib/storage/mmkv';
import type { Variant } from '@/data/schemas/variant';

type ScriptPref = 'latin' | 'cyrillic';

function readScriptPref(): ScriptPref {
  return (storage.getString(storageKeys.serbianScriptPref) ?? 'latin') as ScriptPref;
}

// Mirrors the pickScripts contract in (modal)/lesson-active.tsx: for SR
// the learner sees their chosen script; for HR/BS (cyrillicSpelling===null
// per zod schema) it's always latin and the alternate stays empty.
function pickVariantScripts(variant: Variant, pref: ScriptPref): { primary: string; alternate: string } {
  const cyr = variant.cyrillicSpelling;
  if (pref === 'cyrillic' && cyr) {
    return { primary: cyr, alternate: variant.latinSpelling };
  }
  return { primary: variant.latinSpelling, alternate: cyr ?? '' };
}

const DAD_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCnYtcAIEGQ1AlHCVTI2RiTs7_gqdye8YtQK9pwYRB2idawzZ5mro-WClEjOe9SZOJD0SuFGQEd2NgxFC740M4vh6nHB2qmFChYNjXYLwU2wUq7iETyoZDb28g4lHxqlzYXdKAoGZ373fsYj0iUqNf9hbA3OshqCQFeJv8h86wlD7PYOE4FtJYqozESCL26jOFszxLSkTCd6WXX0_Dre-n9dK7ERCZlobbaoa5uPTAM9hKHOOyghphwcwul9imAgTCImEEcbvNwcDE';

export default function LearnHome() {
  const { vocab, known, knownCount, nextVariant, nextConcept, refresh: refreshLesson } =
    useParetoLesson();
  const { state: streak, refresh: refreshStreak } = useStreak();
  const [scriptPref, setScriptPref] = useState<ScriptPref>(readScriptPref);

  // Tab screens stay mounted across navigation, so re-read on focus to catch
  // the streak tick from the lesson modal, any script-pref change made in
  // Settings, AND known-words edits (mark/unmark) made in the editor — all
  // while this tab was off-screen. Without refreshLesson(), nextVariant stays
  // stale and "Continue Learning"/"Practice typing" stay wrongly disabled
  // until a full app relaunch.
  useFocusEffect(
    useCallback(() => {
      refreshStreak();
      refreshLesson();
      setScriptPref(readScriptPref());
    }, [refreshStreak, refreshLesson]),
  );

  const upcoming = useMemo(
    () =>
      selectNextVariants(
        {
          language: vocab.language,
          knownVariantIds: known,
          allVariants: vocab.variants,
        },
        3,
      ),
    [vocab, known],
  );

  return (
    <Screen scroll>
      <View className="gap-5 pb-6">
        <Card variant="outlined" className="items-center gap-5 overflow-hidden px-5 py-7">
          <View className="items-center gap-3">
            <View className="rounded-full bg-surface p-3 shadow-md">
              <TeacherAvatar
                teacherId="balkan-dad"
                name="Balkan Dad"
                avatarUrl={DAD_IMAGE}
                size="xl"
              />
            </View>
            <View className="rounded-card border border-border bg-surface px-4 py-2 shadow-md">
              <Text variant="h3" className="text-brand-500">
                Hajde, počni!
              </Text>
            </View>
          </View>

          <View className="gap-2">
            <Text variant="h2" align="center" weight="bold">
              Ready for your daily practice?
            </Text>
            <Text variant="body" align="center" color="muted">
              {nextVariant && nextConcept
                ? `Next up: ${pickVariantScripts(nextVariant, scriptPref).primary} ("${nextConcept.englishTranslation}").`
                : 'Session complete for now.'}
            </Text>
          </View>

          <Button
            label="Continue Learning"
            onPress={() => router.push('/(modal)/lesson-active')}
            fullWidth
            size="lg"
            disabled={!nextVariant}
          />
          <Button
            label="Practice typing"
            variant="secondary"
            onPress={() =>
              router.push({
                pathname: '/(modal)/lesson-active',
                params: { direction: 'produce' },
              })
            }
            fullWidth
            disabled={!nextVariant}
          />
        </Card>

        <Card variant="outlined" className="gap-4">
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text variant="h3" weight="bold">
                Daily Streak
              </Text>
              <Text variant="body" color="muted">
                {streak.count > 0
                  ? `${streak.count} day${streak.count === 1 ? '' : 's'} in a row.`
                  : 'Start a session to begin your streak.'}
              </Text>
            </View>
            <Text variant="h2" className="text-brand-500">
              {streak.count}
            </Text>
          </View>
          <View className="self-start">
            <StreakBadge days={streak.count} active={streak.count > 0} />
          </View>
        </Card>

        <Card variant="outlined" className="gap-3">
          <ParetoProgress
            currentRank={knownCount}
            targetRank={FLUENCY_TARGET_RANK}
            language={vocab.language}
            validated={vocab.validated}
          />
          <Text variant="caption" color="muted">
            Ranks from {vocab.meta.sources[0]?.name ?? 'corpus'} ·{' '}
            v{vocab.meta.version}
          </Text>
        </Card>

        <Card variant="outlined" className="gap-4">
          <View className="flex-row items-center justify-between">
            <Text variant="h3" weight="bold">
              Starter Path
            </Text>
            <Text variant="caption" className="text-accent-500" weight="semibold">
              Serbian
            </Text>
          </View>
          {upcoming.map((variant, index) => {
            const { primary, alternate } = pickVariantScripts(variant, scriptPref);
            return (
              <View
                key={variant.id}
                className={`flex-row items-center justify-between rounded-button border p-3 ${
                  index === 0 ? 'border-brand-500 bg-brand-50' : 'border-border bg-bg'
                }`}
              >
                <View className="flex-row items-center gap-3">
                  <Text variant="body" weight="bold" className="text-brand-500">
                    #{variant.frequencyRankInLang}
                  </Text>
                  <View>
                    <Text variant="body" weight="semibold">
                      {primary}
                    </Text>
                    <Text variant="caption" color="muted">
                      {alternate || 'Latin only'}
                    </Text>
                  </View>
                </View>
                <Text variant="caption" color="muted">
                  {index === 0 ? 'Next' : 'Up next'}
                </Text>
              </View>
            );
          })}
        </Card>
      </View>
    </Screen>
  );
}
