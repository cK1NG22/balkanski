import { Screen, Text } from '@/components';

export default function Food() {
  return (
    <Screen scroll>
      <Text variant="h1">Food</Text>
      <Text variant="body" color="muted" className="mt-2">
        Recipes unlock with progression. Phase 7 (Layer 3).
      </Text>
    </Screen>
  );
}
