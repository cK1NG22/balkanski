import { View } from 'react-native';

import { Text } from '../primitives/Text';
import { ProgressBar } from './ProgressBar';
import type { Language } from '@/data/schemas/variant';

const languageName: Record<Language, string> = {
  hr: 'Croatian',
  sr: 'Serbian',
  bs: 'Bosnian',
};

export interface ParetoProgressProps {
  currentRank: number;
  targetRank: number;
  language: Language;
  // `validated` is FALSE until the corpus ingestion pipeline has actually run
  // and produced real frequency ranks. Until then we render the raw count
  // only — no "X% to fluency" claim. See feedback-pareto-honesty memory.
  validated?: boolean;
}

export function ParetoProgress({
  currentRank,
  targetRank,
  language,
  validated = false,
}: ParetoProgressProps) {
  const ratio = Math.max(0, Math.min(1, currentRank / targetRank));
  const percent = Math.round(ratio * 100);

  return (
    <View className="gap-2">
      <Text variant="label" color="muted">
        {`${languageName[language]} · ${validated ? `top ${targetRank} words` : 'starter vocab'}`}
      </Text>
      {validated ? (
        <Text variant="h3">{`${percent}% of the way to 80% fluency`}</Text>
      ) : (
        <Text variant="h3">{`${currentRank} words known`}</Text>
      )}
      {validated ? (
        <Text variant="caption" color="muted">{`${currentRank} / ${targetRank} known`}</Text>
      ) : null}
      <ProgressBar value={ratio} size="md" color="primary" />
    </View>
  );
}

export default ParetoProgress;
