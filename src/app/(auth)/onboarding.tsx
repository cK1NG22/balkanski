import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, Text } from '@/components';
import { storage, storageKeys } from '@/lib/storage/mmkv';

// Post-sign-in onboarding nudge. Two paths, both finish onboarding immediately
// so the lessons aren't gated on either choice.
// Authoritative design: docs/decisions/0002-known-words-vs-placement-test.md

export default function Onboarding() {
  // One navigation per choice -- chaining replace+push races inside expo-router.
  // For "Mark words" we replace directly into the modal carrying a `from` param
  // so the modal's Done button knows to exit to /(tabs)/learn instead of back().
  const completeAndStartFresh = () => {
    storage.set(storageKeys.onboardingComplete, true);
    router.replace('/(tabs)/learn');
  };
  const completeAndMarkKnown = () => {
    storage.set(storageKeys.onboardingComplete, true);
    router.replace({
      pathname: '/(modal)/known-words',
      params: { from: 'onboarding' },
    });
  };

  return (
    <Screen scroll>
      <View className="gap-6 pt-4">
        <View className="gap-2">
          <Text variant="h1" weight="bold">
            Welcome
          </Text>
          <Text variant="body" color="muted">
            Pick how you'd like to start. You can change this anytime in Settings.
          </Text>
        </View>

        <Card variant="outlined" className="gap-3">
          <Text variant="h3" weight="bold">
            Start fresh
          </Text>
          <Text variant="body" color="muted">
            Begin at the most common Serbian words and work outward. Best if
            you're new to the language.
          </Text>
          <Button label="Start fresh" onPress={completeAndStartFresh} fullWidth />
        </Card>

        <Card variant="outlined" className="gap-3">
          <Text variant="h3" weight="bold">
            Mark words I already know
          </Text>
          <Text variant="body" color="muted">
            Scan the frequency-ranked list and check off words you already
            recognize. Lessons will skip those.
          </Text>
          <Button
            label="Open Known Words"
            variant="secondary"
            onPress={completeAndMarkKnown}
            fullWidth
          />
        </Card>
      </View>
    </Screen>
  );
}
