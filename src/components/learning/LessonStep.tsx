import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Button } from '../primitives/Button';
import { Text } from '../primitives/Text';
import type { GradingTier } from '@/data/schemas/grading';

export interface LessonStepFeedback {
  status: GradingTier;
  message?: ReactNode;
}

export interface LessonStepProps {
  prompt: ReactNode;
  instruction?: string;
  children: ReactNode;
  feedback?: LessonStepFeedback;
  onContinue?: () => void;
  continueLabel?: string;
  stepNumber?: number;
  totalSteps?: number;
}

const feedbackTone: Record<GradingTier, string> = {
  right: 'bg-tierRight/10 border-tierRight',
  close: 'bg-tierClose/10 border-tierClose',
  wrong: 'bg-tierWrong/10 border-tierWrong',
};

export function LessonStep({
  prompt,
  instruction,
  children,
  feedback,
  onContinue,
  continueLabel = 'Continue',
  stepNumber,
  totalSteps,
}: LessonStepProps) {
  return (
    <View className="gap-4">
      {stepNumber !== undefined && totalSteps !== undefined ? (
        <Text variant="caption" color="muted">{`Step ${stepNumber} of ${totalSteps}`}</Text>
      ) : null}

      {instruction ? (
        <Text variant="label" color="muted">
          {instruction}
        </Text>
      ) : null}

      <View>{prompt}</View>
      <View className="my-2">{children}</View>

      {feedback ? (
        <View className={`rounded-card border p-3 ${feedbackTone[feedback.status]}`}>
          <Text variant="caption" weight="semibold">
            {feedback.status === 'right'
              ? 'Correct'
              : feedback.status === 'close'
              ? 'Almost — check the spelling'
              : 'Not quite'}
          </Text>
          {feedback.message ? <View className="mt-1">{feedback.message}</View> : null}
        </View>
      ) : null}

      {onContinue ? (
        <Button label={continueLabel} onPress={onContinue} fullWidth />
      ) : null}
    </View>
  );
}

export default LessonStep;
