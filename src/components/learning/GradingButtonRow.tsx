import { View } from 'react-native';

import type { GradingTier } from '@/data/schemas/grading';

import { Button } from '../primitives/Button';

export interface GradingButtonRowProps {
  /** Called with the chosen tier. Caller decides what to do with it (persist, advance, etc). */
  onGrade: (tier: GradingTier) => void;
  /** Hide the row until the learner has revealed the answer. */
  disabled?: boolean;
  className?: string;
}

/**
 * The 3-button right/close/wrong row used by both the new-lesson flow
 * (`(modal)/lesson-active`) and the spaced-repetition review flow
 * (`(tabs)/review`). Tier semantics are documented in
 * `src/lib/grading/tiered.ts`.
 */
export function GradingButtonRow({ onGrade, disabled, className }: GradingButtonRowProps) {
  return (
    <View className={`flex-row gap-2 ${className ?? ''}`}>
      <Button
        label="Wrong"
        variant="ghost"
        onPress={() => onGrade('wrong')}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        label="Close"
        variant="secondary"
        onPress={() => onGrade('close')}
        disabled={disabled}
        className="flex-1"
      />
      <Button
        label="Right"
        onPress={() => onGrade('right')}
        disabled={disabled}
        className="flex-1"
      />
    </View>
  );
}

export default GradingButtonRow;
