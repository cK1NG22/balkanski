import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '../primitives/Text';
import type { GrammaticalCase } from '@/data/schemas/variant';

const caseLabel: Record<GrammaticalCase, string> = {
  nom: 'Nominative',
  gen: 'Genitive',
  dat: 'Dative',
  acc: 'Accusative',
  voc: 'Vocative',
  ins: 'Instrumental',
  loc: 'Locative',
};

export interface CaseEndingPickerProps {
  stem: string;
  options: string[];
  correct: string;
  caseHint?: GrammaticalCase;
  onAnswer: (chosen: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function CaseEndingPicker({
  stem,
  options,
  correct,
  caseHint,
  onAnswer,
  disabled = false,
}: CaseEndingPickerProps) {
  const [chosen, setChosen] = useState<string | null>(null);

  const handlePick = (option: string) => {
    if (disabled || chosen) return;
    setChosen(option);
    onAnswer(option, option === correct);
  };

  return (
    <View className="gap-3">
      {caseHint ? (
        <Text variant="label" color="muted">{`${caseLabel[caseHint]} form`}</Text>
      ) : null}

      <Text variant="h2" align="center">{`${stem}___`}</Text>

      <View className="flex-row flex-wrap gap-2 justify-center">
        {options.map((option) => {
          const isPicked = chosen === option;
          const isCorrect = option === correct;
          let tone = 'bg-surface border-border';
          if (isPicked && isCorrect) tone = 'bg-tierRight/20 border-tierRight';
          else if (isPicked && !isCorrect) tone = 'bg-tierWrong/20 border-tierWrong';
          else if (chosen && isCorrect) tone = 'bg-tierRight/20 border-tierRight';

          return (
            <Pressable
              key={option}
              onPress={() => handlePick(option)}
              disabled={disabled || chosen !== null}
              className={`rounded-button border px-4 py-3 active:opacity-80 ${tone}`}
            >
              <Text weight="semibold">{option}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default CaseEndingPicker;
