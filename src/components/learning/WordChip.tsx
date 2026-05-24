import { Pressable } from 'react-native';
import { router } from 'expo-router';

import { Text } from '../primitives/Text';
import type { PartOfSpeech } from '@/data/schemas/concept';

export type WordChipState = 'new' | 'learning' | 'known';

export interface WordChipProps {
  word: string;
  romanization?: string;
  pos?: PartOfSpeech;
  state?: WordChipState;
  audioSrc?: string | number;
  conceptId?: string;
  onPress?: () => void;
}

const stateClasses: Record<WordChipState, string> = {
  new: 'bg-surface border-border',
  learning: 'bg-warning/10 border-warning',
  known: 'bg-success/10 border-success',
};

export function WordChip({
  word,
  romanization,
  state = 'new',
  conceptId,
  onPress,
}: WordChipProps) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }
    if (conceptId) {
      router.push({ pathname: '/(modal)/word-detail', params: { conceptId } });
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={`rounded-pill border px-3 py-1 active:opacity-80 ${stateClasses[state]}`}
    >
      <Text variant="caption" weight="medium">
        {romanization ? `${word} · ${romanization}` : word}
      </Text>
    </Pressable>
  );
}

export default WordChip;
