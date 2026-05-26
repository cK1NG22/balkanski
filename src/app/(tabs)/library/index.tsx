import { Link } from 'expo-router';
import { View } from 'react-native';

import { Card, Screen, Text } from '@/components';

const sections = [
  { href: '/(tabs)/library/compare', title: 'Compare', subtitle: 'Same word in SR · HR · BS' },
  { href: '/(tabs)/library/alphabet', title: 'Alphabet', subtitle: 'Serbian Cyrillic (Serbian learners only)' },
  { href: '/(tabs)/library/grammar', title: 'Grammar', subtitle: '7 cases · conjugation' },
  { href: '/(tabs)/library/vocab', title: 'Vocabulary', subtitle: 'Pareto-ranked words you know' },
  { href: '/(tabs)/library/culture', title: 'Culture', subtitle: 'Customs · everyday life' },
  { href: '/(tabs)/library/food', title: 'Food', subtitle: 'Recipes · regional dishes' },
  { href: '/(tabs)/library/geography', title: 'Geography', subtitle: 'Cities · regions · dialects' },
] as const;

export default function LibraryHome() {
  return (
    <Screen scroll>
      <View className="gap-3">
        <Text variant="h1">Library</Text>
        {sections.map((s) => (
          <Link key={s.href} href={s.href} asChild>
            <Card variant="outlined" onPress={() => {}}>
              <Text variant="h3">{s.title}</Text>
              <Text variant="caption" color="muted" className="mt-1">
                {s.subtitle}
              </Text>
            </Card>
          </Link>
        ))}
      </View>
    </Screen>
  );
}
