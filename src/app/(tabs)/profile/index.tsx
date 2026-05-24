import { router } from 'expo-router';
import { View } from 'react-native';

import { Button, Card, ProgressBar, Screen, TeacherAvatar, Text } from '@/components';

const TENNIS_TEACHER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC5HMb4mPa_vY06EupxkJFufYaHsouGbNEOAHQvCFvbN9U22BRn8_aF_Ik14C92FQhsjvhRcdzT-u2-hkTvrzefvJHckefb62DSt7yPUsmsyN0_yp9M390VBxJm6_ig-ZkQiWBdyuu6reCFodrJa5flzLTfZsmYIDc_YGwBxn4XtQOxxN2jiUaYc7aPZtvFRGSQXDA03xHJyYhFqaw4zLobxfier954rrakStmOWpI84py0VaQdVX0RvPfKxKeKQGPuZOkKgbm2dAc';

const progressRows = [
  { title: 'Basic Verbs', value: 0.88, color: 'primary' as const },
  { title: 'Travel Phrases', value: 0.42, color: 'success' as const },
  { title: 'Dining Out', value: 0.12, color: 'warning' as const },
];

export default function ProfileHome() {
  return (
    <Screen scroll>
      <View className="gap-5 pb-6">
        <Card variant="outlined" className="items-center gap-3">
          <View className="rounded-full border border-border bg-bg p-3">
            <TeacherAvatar
              teacherId="tennis-teacher"
              name="Stefan"
              avatarUrl={TENNIS_TEACHER}
              size="xl"
            />
          </View>
          <View className="items-center gap-1">
            <Text
              variant="caption"
              color="inverse"
              className="rounded-pill bg-accent-500 px-3 py-1"
            >
              Liga Velikana
            </Text>
            <Text variant="h2" align="center" weight="bold">
              Stefan Nemanjic
            </Text>
            <Text variant="caption" align="center" color="muted">
              Current rank: #14
            </Text>
          </View>
          <View className="w-full flex-row gap-3">
            <StatTile label="Streak" value="12" />
            <StatTile label="Words" value="245" />
            <StatTile label="Level" value="42" />
          </View>
        </Card>

        <Card variant="outlined" className="gap-4 bg-brand-500">
          <View className="items-center gap-2">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-surface">
              <Text variant="h2" className="text-brand-500">
                5
              </Text>
            </View>
            <Text variant="h3" color="inverse" align="center" weight="bold">
              Daily Challenge
            </Text>
            <Text variant="caption" color="inverse" align="center">
              Complete five tennis-themed vocabulary drills.
            </Text>
          </View>
          <ProgressBar value={0.6} size="md" color="warning" />
          <Text variant="label" color="inverse" align="center">
            3 / 5 completed
          </Text>
        </Card>

        <Card variant="outlined" className="gap-4">
          <Text variant="h3" weight="bold">
            Study Success
          </Text>
          <Text variant="caption" color="muted">
            Correct answers per day
          </Text>
          <View className="h-32 flex-row items-end gap-2">
            {[0.45, 0.62, 0.5, 0.34, 0.58, 0.67, 0.54].map((height, index) => (
              <View key={index} className="flex-1 justify-end gap-1">
                <View className="w-full rounded-sm bg-warning" style={{ height: `${height * 45}%` }} />
                <View className="w-full rounded-sm bg-accent-500" style={{ height: `${height * 35}%` }} />
                <View className="w-full rounded-sm bg-brand-500" style={{ height: `${height * 55}%` }} />
              </View>
            ))}
          </View>
        </Card>

        <Card variant="outlined" className="gap-4">
          <Text variant="h3" weight="bold">
            Recent Milestones
          </Text>
          <Milestone title="Cyrillic Master" description="Read 100 pages of text" />
          <Milestone title="Local Talker" description="Complete five speaking-free drills" />
          <Milestone title="Speed Drill" description="100% score in under 60s" />
        </Card>

        <View className="gap-3">
          <Text variant="h3" weight="bold">
            Course Progression
          </Text>
          {progressRows.map((row) => (
            <Card key={row.title} variant="outlined" className="gap-3">
              <View className="flex-row justify-between">
                <Text variant="body" weight="semibold">
                  {row.title}
                </Text>
                <Text variant="caption" className="text-brand-500" weight="bold">
                  {Math.round(row.value * 100)}%
                </Text>
              </View>
              <ProgressBar value={row.value} color={row.color} />
            </Card>
          ))}
          <Button label="Explore Courses" variant="secondary" onPress={() => router.push('/(tabs)/library')} />
          <Button label="Settings" variant="ghost" onPress={() => router.push('/(tabs)/profile/settings')} />
        </View>
      </View>
    </Screen>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center rounded-button border border-border bg-bg p-3">
      <Text variant="label" color="muted">
        {label}
      </Text>
      <Text variant="h3" className="text-brand-500">
        {value}
      </Text>
    </View>
  );
}

function Milestone({ title, description }: { title: string; description: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-brand-50">
        <Text variant="body" className="text-brand-500">
          ✓
        </Text>
      </View>
      <View className="flex-1">
        <Text variant="body" weight="semibold">
          {title}
        </Text>
        <Text variant="caption" color="muted">
          {description}
        </Text>
      </View>
    </View>
  );
}
