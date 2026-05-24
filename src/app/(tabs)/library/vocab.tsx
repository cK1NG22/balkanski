import { Screen, Text } from '@/components';

export default function Vocab() {
  return (
    <Screen scroll>
      <Text variant="h1">Vocabulary</Text>
      <Text variant="body" color="muted" className="mt-2">
        Words you know, ranked by Pareto frequency. Phase 1.
      </Text>
    </Screen>
  );
}
