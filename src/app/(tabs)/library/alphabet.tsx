import { View } from 'react-native';

import { CyrillicLetter, Screen, Text } from '@/components';

const sample = [
  { letter: 'А', romanization: 'A', ipa: 'a' },
  { letter: 'Б', romanization: 'B', ipa: 'b' },
  { letter: 'В', romanization: 'V', ipa: 'v' },
  { letter: 'Г', romanization: 'G', ipa: 'g' },
  { letter: 'Д', romanization: 'D', ipa: 'd' },
  { letter: 'Ђ', romanization: 'Đ', ipa: 'dʑ' },
];

export default function Alphabet() {
  return (
    <Screen scroll>
      <View className="gap-4">
        <Text variant="h1">Serbian Cyrillic</Text>
        <Text variant="body" color="muted">
          30 letters of the Serbian Cyrillic alphabet. Shown only to Serbian learners.
        </Text>

        <View className="flex-row flex-wrap gap-3 justify-center">
          {sample.map((l) => (
            <CyrillicLetter key={l.letter} {...l} size="md" />
          ))}
        </View>

        <Text variant="caption" color="muted" align="center">
          Phase 1 ships the full 30-letter set with audio.
        </Text>
      </View>
    </Screen>
  );
}
