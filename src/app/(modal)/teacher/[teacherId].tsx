import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, Screen, TeacherAvatar, Text } from '@/components';

export default function TeacherBio() {
  const { teacherId } = useLocalSearchParams<{ teacherId: string }>();
  return (
    <Screen scroll>
      <View className="gap-4">
        <View className="flex-row items-center justify-between">
          <Text variant="label" color="muted">
            Teacher
          </Text>
          <Button label="Close" variant="ghost" size="sm" onPress={() => router.back()} />
        </View>

        <Card variant="elevated">
          <View className="items-center gap-3">
            <TeacherAvatar teacherId={teacherId ?? 'unknown'} size="xl" />
            <Text variant="h2">{`Teacher ${teacherId ?? ''}`}</Text>
            <Text variant="caption" color="muted" align="center">
              Phase 4 — lookalike personas (3 per country), scripted bubbles, country accents.
            </Text>
          </View>
        </Card>
      </View>
    </Screen>
  );
}
