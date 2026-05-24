import { View } from 'react-native';

import { Text } from '../primitives/Text';

export interface AudioPlayerProps {
  src: string | number;
  autoPlay?: boolean;
  loop?: boolean;
  showWaveform?: boolean;
  showSpeed?: boolean;
  compact?: boolean;
  onPlay?: () => void;
  onComplete?: () => void;
}

export function AudioPlayer(_props: AudioPlayerProps) {
  // Phase 5+ stub. Real implementation will use expo-audio for playback,
  // optional waveform + speed controls, and tap-to-play UX.
  return (
    <View className="rounded-pill border border-border bg-bg px-3 py-2 self-start">
      <Text variant="caption" color="muted">
        ♪ audio (Phase 5+)
      </Text>
    </View>
  );
}

export default AudioPlayer;
