import { Tabs } from 'expo-router';

import { Text } from '@/components';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: () => <Text>📘</Text>,
        }}
      />
      <Tabs.Screen
        name="review"
        options={{
          title: 'Review',
          tabBarIcon: () => <Text>🔁</Text>,
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: 'Library',
          tabBarIcon: () => <Text>📚</Text>,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: () => <Text>👤</Text>,
        }}
      />
    </Tabs>
  );
}
