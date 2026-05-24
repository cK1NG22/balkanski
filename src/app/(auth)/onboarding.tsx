import { View } from 'react-native';

import { Screen, Text } from '@/components';

export default function Onboarding() {
  return (
    <Screen>
      <View className="flex-1 justify-center gap-3">
        <Text variant="h1">Onboarding</Text>
        <Text variant="body" color="muted">
          Language pick, daily goal, reminders. Phase 1 deliverable.
        </Text>
      </View>
    </Screen>
  );
}
