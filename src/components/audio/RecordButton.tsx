import { Pressable } from 'react-native';

import { Text } from '../primitives/Text';

export type RecordButtonState = 'idle' | 'recording' | 'reviewing';
export type RecordButtonSize = 'sm' | 'md' | 'lg';

export interface RecordButtonProps {
  maxDurationMs?: number;
  onStart?: () => void;
  onStop?: (uri: string, durationMs: number) => void;
  onCancel?: () => void;
  state?: RecordButtonState;
  size?: RecordButtonSize;
}

export function RecordButton(_props: RecordButtonProps) {
  // Phase 5+ stub. Real implementation will use expo-audio recording,
  // Speechace proxy for grading, and per-phoneme feedback rendering.
  return (
    <Pressable
      className="rounded-pill bg-danger/20 border border-danger px-4 py-3 self-start active:opacity-80"
      onPress={() => {
        /* no-op stub */
      }}
    >
      <Text variant="caption" weight="semibold" color="danger">
        ● record (Phase 5+)
      </Text>
    </Pressable>
  );
}

export default RecordButton;
