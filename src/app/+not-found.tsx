import { Link } from 'expo-router';
import { View } from 'react-native';

import { Screen, Text } from '@/components';

export default function NotFound() {
  return (
    <Screen>
      <View className="flex-1 items-center justify-center gap-4">
        <Text variant="h1">Lost in translation</Text>
        <Text variant="body" color="muted">
          This route doesn&apos;t exist yet.
        </Text>
        <Link href="/">
          <Text variant="body" color="accent">
            Go home →
          </Text>
        </Link>
      </View>
    </Screen>
  );
}
