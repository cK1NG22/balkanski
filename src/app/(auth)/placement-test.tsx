import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { storage, storageKeys } from '@/lib/storage/mmkv';

export default function PlacementTest() {
  const skip = () => {
    storage.set(storageKeys.onboardingComplete, true);
    router.replace('/(tabs)/learn');
  };

  return (
    <Screen scroll>
      <View className="gap-4">
        <Text variant="h1">Placement test</Text>
        <Text variant="body" color="muted">
          Phase 0 stub. The real test (vocab-recall + grammar-pattern, design TBD) drops here in
          Phase 1 and writes the result to <Text variant="mono">users.proficiency_estimate</Text>.
        </Text>

        <Card variant="outlined">
          <Text variant="caption" color="muted">
            For now, tap below to skip and start at the beginning of the Pareto path.
          </Text>
        </Card>

        <Button label="Start at the beginning" onPress={skip} fullWidth />
      </View>
    </Screen>
  );
}
