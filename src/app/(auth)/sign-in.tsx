import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Screen, Text } from '@/components';
import { signInWithGoogle } from '@/lib/auth';

const FLAG_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAxpaMuyPQp2ZOu136OHkvTE5Iep7Ip09tajIBWdBQIpiCAcP7XZq6Zup8or78-Jibr2rBHn6LV4u5mKKdRId-laZrwuhZQhXcNrP-4INr-fjlQf_5SA6ajJIAVS-0D3gHFu0MS5_ULMMXp47WYsZ7E7kXvnN7yWy16pQWTdPHPbz4XgfhiBibApb7GmCWYJsBEXWOXm9xMTZGEj1JcbHUatXctATug_M6m90eopN6AdqbhJKABdJuxoadQWt6JKoCc7CV9Ghg5_nc';

export default function SignIn() {
  const [signingIn, setSigningIn] = useState(false);

  async function handleSignIn() {
    if (signingIn) return;
    setSigningIn(true);
    const result = await signInWithGoogle();
    setSigningIn(false);
    if (result.type === 'error') {
      Alert.alert('Sign-in failed', result.message);
    }
    // On success, AuthProvider's onAuthChange subscription fires and the
    // index route redirects automatically — no navigation call needed here.
  }

  return (
    <Screen>
      <View className="flex-1 justify-center gap-8 px-3">
        <View className="items-center gap-6">
          <View className="h-44 w-44 overflow-hidden rounded-card bg-surface shadow-lg">
            <Image
              source={{ uri: FLAG_IMAGE }}
              className="h-full w-full"
              contentFit="cover"
              accessibilityLabel="Serbian flag and crest"
            />
          </View>

          <View className="gap-3">
            <Text variant="display" align="center" className="text-brand-500">
              Balkanski
            </Text>
            <Text variant="h3" align="center" color="muted">
              The spirit of the Balkans in your pocket.
            </Text>
          </View>
        </View>

        <View className="gap-5">
          <Button
            label={signingIn ? 'Opening Google…' : 'Sign in with Google'}
            onPress={handleSignIn}
            disabled={signingIn}
            fullWidth
            size="lg"
          />
          <View className="flex-row items-center gap-4">
            <View className="h-px flex-1 bg-border" />
            <Text variant="caption" color="muted">
              Personal use
            </Text>
            <View className="h-px flex-1 bg-border" />
          </View>
        </View>

        <View className="items-center gap-3">
          <Text variant="body" align="center" weight="semibold">
            Personal use. No tracking.
          </Text>
        </View>
      </View>
    </Screen>
  );
}
