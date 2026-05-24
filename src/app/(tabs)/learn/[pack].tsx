import { useLocalSearchParams } from 'expo-router';

import { Screen, Text } from '@/components';

export default function PackDetail() {
  const { pack } = useLocalSearchParams<{ pack: string }>();
  return (
    <Screen scroll>
      <Text variant="h1">{`Pack: ${pack}`}</Text>
      <Text variant="caption" color="muted" className="mt-2">
        Topic-pack detail. Lessons authored in Phase 3.
      </Text>
    </Screen>
  );
}
