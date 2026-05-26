// ProduceCard — the "type the Serbian word for X" prompt used by the
// (modal)/lesson-active screen when `?direction=produce`. Composes
// `FillInBlankInput` (which already calls `gradingTier`) with an inline
// correction surface so `close` answers show the canonical spelling before
// the learner advances.

import { useState } from 'react';
import { View } from 'react-native';

import type { GradingResult, GradingTier } from '@/data/schemas/grading';

import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';
import { FillInBlankInput } from './FillInBlankInput';

export interface ProduceCardProps {
  /** The meaning shown to the learner (English-anchored — never localized). */
  englishTranslation: string;
  /** Optional secondary hint (part of speech, sense disambiguator, etc). */
  hint?: string;
  /** Accepted spellings — typically `[variant.latinSpelling]` for SR Latin. */
  acceptedAnswers: string[];
  /** Called once the learner taps Continue after seeing the feedback. */
  onGraded: (tier: GradingTier) => void;
}

const tierTone: Record<GradingTier, string> = {
  right: 'bg-tierRight/10 border-tierRight',
  close: 'bg-tierClose/10 border-tierClose',
  wrong: 'bg-tierWrong/10 border-tierWrong',
};

const tierHeadline: Record<GradingTier, string> = {
  right: 'Bravo!',
  close: 'Almost — check the spelling',
  wrong: 'Not quite',
};

export function ProduceCard({
  englishTranslation,
  hint,
  acceptedAnswers,
  onGraded,
}: ProduceCardProps) {
  const [result, setResult] = useState<GradingResult | null>(null);

  const handleAnswer = (_value: string, r: GradingResult) => {
    setResult(r);
  };

  const handleContinue = () => {
    if (!result) return;
    onGraded(result.tier);
    setResult(null);
  };

  return (
    <View className="gap-4">
      <View className="rounded-card border border-border bg-surface p-5 shadow-sm">
        <Text variant="label" color="muted">
          Type the Serbian word for
        </Text>
        <Text variant="h2" weight="bold" className="mt-1">
          {englishTranslation}
        </Text>
        {hint ? (
          <Text variant="caption" color="muted" className="mt-1">
            {hint}
          </Text>
        ) : null}
      </View>

      <FillInBlankInput
        prompt="Your answer"
        acceptedAnswers={acceptedAnswers}
        onAnswer={handleAnswer}
        disabled={result !== null}
      />

      {result ? (
        <View className={`rounded-card border p-3 ${tierTone[result.tier]}`}>
          <Text variant="caption" weight="semibold">
            {tierHeadline[result.tier]}
          </Text>
          {result.tier !== 'right' && result.correction ? (
            <Text variant="body" className="mt-1">
              {`Correct spelling: ${result.correction}`}
            </Text>
          ) : null}
        </View>
      ) : null}

      {result ? (
        <Button label="Continue" onPress={handleContinue} fullWidth size="lg" />
      ) : null}
    </View>
  );
}

export default ProduceCard;
