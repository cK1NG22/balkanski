import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

import { Screen, Text } from '@/components';
import { useAuth } from '@/providers/AuthProvider';
import { storage, storageKeys } from '@/lib/storage/mmkv';

// Splash / OAuth gate.
// - Loading → render a tiny splash.
// - Signed in + onboarded → redirect to tabs.
// - Signed in but no onboarding → redirect to placement test.
// - Not signed in → redirect to sign-in.

export default function Index() {
  const { session, loading } = useAuth();

  // Side effect placeholder for Phase 1 (telemetry / deep-link handling).
  useEffect(() => {}, [session]);

  if (loading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text variant="display">balkanski</Text>
          <Text variant="caption" color="muted" className="mt-2">
            loading…
          </Text>
        </View>
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const onboardingComplete = storage.getBoolean(storageKeys.onboardingComplete);
  if (!onboardingComplete) {
    return <Redirect href="/(auth)/placement-test" />;
  }

  return <Redirect href="/(tabs)/learn" />;
}
