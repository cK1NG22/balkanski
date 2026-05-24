import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Screen, Text } from '@/components';

export default function CompareLanguages() {
  return (
    <Screen scroll>
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text variant="label" color="muted">
            Compare
          </Text>
          <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>

        <Text variant="h1">Compare across languages</Text>
        <Text variant="body" color="muted">
          Same concept in Croatian, Serbian, Bosnian + any applicable regional variants.
          Phase 2 wires this via <Text variant="mono">CompareLanguagesPanel</Text>.
        </Text>
      </View>
    </Screen>
  );
}
