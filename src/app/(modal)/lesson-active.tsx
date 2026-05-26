import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import {
  Button,
  FlashCard,
  GradingButtonRow,
  LessonStep,
  ProduceCard,
  ProgressBar,
  Screen,
  TeacherAvatar,
  Text,
} from '@/components';
import { useParetoLesson, type LessonDirection } from '@/hooks/use-pareto-lesson';
import type { GradingTier } from '@/data/schemas/grading';
import type { Variant } from '@/data/schemas/variant';
import { storage, storageKeys } from '@/lib/storage/mmkv';

type ScriptPref = 'latin' | 'cyrillic';

// SR variants always carry both spellings; HR/BS only carry latinSpelling
// (the zod schema enforces cyrillicSpelling === null there). Returns the
// learner's preferred-script form plus the alternate (or empty when there
// is no alternate to show).
function pickScripts(variant: Variant, pref: ScriptPref): {
  primary: string;
  alternate: string;
  acceptedAnswers: string[];
} {
  const cyr = variant.cyrillicSpelling;
  if (pref === 'cyrillic' && cyr) {
    return {
      primary: cyr,
      alternate: variant.latinSpelling,
      acceptedAnswers: [cyr, variant.latinSpelling],
    };
  }
  return {
    primary: variant.latinSpelling,
    alternate: cyr ?? '',
    acceptedAnswers: cyr ? [variant.latinSpelling, cyr] : [variant.latinSpelling],
  };
}

const COACH_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD4QBuQyffkksLihLTnrilh0lLqRDcjLbLHqUXHyM6_NGIxxanpTHAi9DB8KyMKYtGMc-jVhSjX6OZ6FXxxDhoYZ_3AmDLUsAUBI--oQr_pogZhk3MnMxQADRVblONZUp3LBIwvL0xwIjqrVvkAxZjS8mATwZc9MVi3sOU0MzcMVBOIDB68hQV05KJbxLneRKAgRCxpGI2kuF1jWO0SeCAW4Q2sDA1ZtWBBnPm7eOqA5m_ILVNCY-GoUgtSQoKIN5WUtI9ATUR16Rs';

const SESSION_LENGTH = 10;

export default function LessonActive() {
  const params = useLocalSearchParams<{ direction?: string }>();
  const direction: LessonDirection =
    params.direction === 'produce' ? 'produce' : 'recognize';
  const { nextVariant, nextConcept, grade } = useParetoLesson(direction);
  const scriptPref = (storage.getString(storageKeys.serbianScriptPref) ?? 'latin') as ScriptPref;
  const scripts = nextVariant ? pickScripts(nextVariant, scriptPref) : null;
  const [flipped, setFlipped] = useState(false);
  const [completed, setCompleted] = useState(0);
  const [lastTier, setLastTier] = useState<GradingTier | null>(null);

  const onGrade = (tier: GradingTier) => {
    if (!nextVariant) return;
    setLastTier(tier);
    grade(tier);
    setFlipped(false);
    setCompleted((c) => c + 1);
  };

  const sessionDone = completed >= SESSION_LENGTH || !nextVariant;
  const progress = Math.min(1, completed / SESSION_LENGTH);

  return (
    <Screen scroll>
      <View className="gap-6 pb-6">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-full border-2 border-brand-500 bg-accent-500/20">
              <Text variant="h3" className="text-brand-500">
                S
              </Text>
            </View>
            <Text variant="h2" className="text-brand-500" weight="bold">
              Balkanski
            </Text>
          </View>
          <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>

        <View className="gap-3">
          <View className="flex-row items-end justify-between">
            <Text variant="label" className="text-accent-500">
              Current session
            </Text>
            <Text variant="body" weight="semibold">
              {completed} / {SESSION_LENGTH} words
            </Text>
          </View>
          <ProgressBar value={progress} size="lg" />
        </View>

        <View className="items-center gap-3">
          <View className="self-end rounded-card border border-border bg-surface px-4 py-3 shadow-md">
            <Text variant="h3" className="text-brand-500">
              {lastTier === 'right'
                ? 'Bravo!'
                : lastTier === 'close'
                ? 'Skoro!'
                : lastTier === 'wrong'
                ? 'Nije problem.'
                : "Idemo! You've got this!"}
            </Text>
          </View>
          <View className="rounded-full bg-surface p-4 shadow-md">
            <TeacherAvatar
              teacherId="coach"
              name="Coach"
              avatarUrl={COACH_IMAGE}
              size="xl"
            />
          </View>
        </View>

        {sessionDone ? (
          <View className="gap-4">
            <Text variant="h2" align="center" weight="bold">
              Session complete
            </Text>
            <Text variant="body" align="center" color="muted">
              {nextVariant
                ? `You finished ${SESSION_LENGTH} words. Take a breather.`
                : "You've worked through the seed. New words will arrive as the corpus grows."}
            </Text>
            <Button label="Done" onPress={() => router.back()} fullWidth size="lg" />
          </View>
        ) : nextVariant && nextConcept && scripts && direction === 'produce' ? (
          <LessonStep
            stepNumber={completed + 1}
            totalSteps={SESSION_LENGTH}
            instruction={
              scriptPref === 'cyrillic' && nextVariant.cyrillicSpelling
                ? 'Type the Serbian spelling — Cyrillic or Latin both count.'
                : 'Type the Serbian spelling. Diacritics count.'
            }
            prompt={
              <ProduceCard
                key={nextVariant.id}
                englishTranslation={nextConcept.englishTranslation}
                hint={
                  nextConcept.senseDisambiguator
                    ? `${nextConcept.partOfSpeech} · ${nextConcept.senseDisambiguator}`
                    : nextConcept.partOfSpeech
                }
                acceptedAnswers={scripts.acceptedAnswers}
                onGraded={onGrade}
              />
            }
          >
            <View />
          </LessonStep>
        ) : nextVariant && nextConcept && scripts ? (
          <LessonStep
            stepNumber={completed + 1}
            totalSteps={SESSION_LENGTH}
            instruction="Tap the card to reveal the meaning."
            prompt={
              <FlashCard
                flipped={flipped}
                onFlip={setFlipped}
                className="min-h-[360px] border-2 border-border shadow-lg"
                front={
                  <CardFace
                    eyebrow={`Rank #${nextVariant.frequencyRankInLang} · Serbian`}
                    title={scripts.primary}
                    subtitle={scripts.alternate}
                    helper="Tap to reveal meaning"
                  />
                }
                back={
                  <CardFace
                    eyebrow={`${nextConcept.partOfSpeech}${
                      nextConcept.senseDisambiguator
                        ? ` · ${nextConcept.senseDisambiguator}`
                        : ''
                    }`}
                    title={nextConcept.englishTranslation}
                    subtitle={
                      scripts.alternate
                        ? `${scripts.primary} · ${scripts.alternate}`
                        : scripts.primary
                    }
                    helper={
                      nextVariant.caseForms
                        ? `nom: ${nextVariant.caseForms.nom ?? '—'} · gen: ${
                            nextVariant.caseForms.gen ?? '—'
                          }`
                        : nextConcept.topicTags.join(' · ') || ''
                    }
                    inverse
                  />
                }
              />
            }
          >
            <View className="gap-3">
              <Button
                label={flipped ? 'Hide meaning' : 'Show meaning'}
                variant="secondary"
                onPress={() => setFlipped((v) => !v)}
                fullWidth
                size="lg"
              />
              {flipped ? <GradingButtonRow onGrade={onGrade} /> : null}
            </View>
          </LessonStep>
        ) : null}
      </View>
    </Screen>
  );
}

function CardFace({
  eyebrow,
  title,
  subtitle,
  helper,
  inverse = false,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  helper: string;
  inverse?: boolean;
}) {
  return (
    <View
      className={`w-full items-center justify-center gap-4 ${
        inverse ? 'rounded-card bg-accent-500 p-6' : ''
      }`}
    >
      <Text variant="label" color={inverse ? 'inverse' : 'accent'}>
        {eyebrow}
      </Text>
      <Text variant="display" color={inverse ? 'inverse' : 'default'}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          variant="label"
          color={inverse ? 'inverse' : 'default'}
          className={inverse ? '' : 'text-brand-500'}
        >
          {subtitle}
        </Text>
      ) : null}
      {helper ? (
        <Text variant="body" color={inverse ? 'inverse' : 'muted'} align="center">
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
