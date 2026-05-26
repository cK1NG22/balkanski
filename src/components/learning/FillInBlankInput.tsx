import { useState } from 'react';
import { Keyboard, TextInput, View } from 'react-native';

import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';
import { gradingTier } from '@/lib/grading/tiered';
import type { GradingResult } from '@/data/schemas/grading';

export interface FillInBlankInputProps {
  prompt: string;
  acceptedAnswers: string[];
  hint?: string;
  onAnswer: (value: string, result: GradingResult) => void;
  keyboard?: 'default' | 'cyrillic';
  disabled?: boolean;
}

export function FillInBlankInput({
  prompt,
  acceptedAnswers,
  hint,
  onAnswer,
  disabled = false,
}: FillInBlankInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = () => {
    // Drop the keyboard before grading so the feedback + Continue button
    // (which render below the input) aren't hidden under the IME on mobile.
    Keyboard.dismiss();
    const result = gradingTier(value, acceptedAnswers);
    onAnswer(value, result);
  };

  return (
    <View className="gap-3">
      <Text variant="body">{prompt}</Text>

      <TextInput
        value={value}
        onChangeText={setValue}
        editable={!disabled}
        autoCapitalize="none"
        autoCorrect={false}
        className="bg-surface border border-border rounded-button px-4 py-3 text-base text-ink"
        placeholder={hint ?? '...'}
      />

      <Button
        label="Check"
        onPress={handleSubmit}
        disabled={disabled || value.trim().length === 0}
        fullWidth
      />
    </View>
  );
}

export default FillInBlankInput;
